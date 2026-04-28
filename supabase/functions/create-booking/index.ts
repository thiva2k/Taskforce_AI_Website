// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("📥 Incoming body:", body);

    const full_name = (body.full_name || "").trim();
    const work_email = (body.work_email || "").trim();
    const company_name = (body.company_name || "").trim();
    const message = (body.message || "").trim();
    const selected_date = (body.selected_date || "").trim();
    const selected_time = (body.selected_time || "").trim();
    const timezone = (body.timezone || "Asia/Colombo").trim();

    if (!full_name || !work_email || !selected_date || !selected_time) {
      return jsonResponse({ error: "Missing required fields" }, 400);
    }

    // ENV
    const GOOGLE_SERVICE_ACCOUNT = Deno.env.get("GOOGLE_SERVICE_ACCOUNT");
    const GOOGLE_CALENDAR_ID = Deno.env.get("GOOGLE_CALENDAR_ID");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const INTERNAL_BOOKING_EMAIL =
      Deno.env.get("INTERNAL_BOOKING_EMAIL") || "your@email.com";

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    );

    // GOOGLE AUTH
    const serviceAccount = JSON.parse(GOOGLE_SERVICE_ACCOUNT);
    const accessToken = await getGoogleAccessToken(serviceAccount);

    // BUILD TIME
    const { startDateTime, endDateTime } = buildSlotDateTimes(
      selected_date,
      selected_time
    );

    // CHECK SLOT
    const isFree = await checkSlotAvailability(
      accessToken,
      GOOGLE_CALENDAR_ID,
      startDateTime,
      endDateTime,
      timezone
    );

    if (!isFree) {
      return jsonResponse(
        { error: "Selected slot is not available" },
        409
      );
    }

    // INSERT BOOKING
    const { data: bookingRow } = await supabase
      .from("demo_bookings")
      .insert([
        {
          full_name,
          work_email,
          company_name,
          message,
          selected_date,
          selected_time,
          timezone,
          status: "pending",
        },
      ])
      .select()
      .single();

    // CREATE GOOGLE EVENT
    const eventPayload = {
      summary: `TaskForce AI Demo - ${full_name}`,
      description: `Email: ${work_email}`,
      start: {
        dateTime: startDateTime,
        timeZone: timezone,
      },
      end: {
        dateTime: endDateTime,
        timeZone: timezone,
      },
    };

    const eventRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
        GOOGLE_CALENDAR_ID
      )}/events`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventPayload),
      }
    );

    const eventJson = await eventRes.json();

    if (!eventRes.ok) {
      return jsonResponse(
        { error: "Google Calendar Error", details: eventJson },
        500
      );
    }

    // UPDATE BOOKING
    await supabase
      .from("demo_bookings")
      .update({
        status: "confirmed",
        google_event_id: eventJson.id,
      })
      .eq("id", bookingRow.id);

    // =====================================================
    // SEND EMAILS (INTERNAL + CLIENT)
    // =====================================================
    try {
      // INTERNAL EMAIL
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Bookings <no-reply@taskforceai.tech>",
          to: [INTERNAL_BOOKING_EMAIL],
          subject: "🚀 New Demo Booking",
          html: `
            <h2>New Booking</h2>
            <p><b>Name:</b> ${full_name}</p>
            <p><b>Email:</b> ${work_email}</p>
            <p><b>Company:</b> ${company_name}</p>
            <p><b>Date:</b> ${selected_date}</p>
            <p><b>Time:</b> ${selected_time}</p>
            <p><b>Message:</b> ${message}</p>
          `,
        }),
      });

      // CLIENT EMAIL
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "TaskForce AI <no-reply@taskforceai.tech>",
          to: [work_email],
          subject: "✅ Demo Booking Confirmed",
          html: `
            <h2>Demo Confirmed 🎉</h2>
            <p>Hi ${full_name},</p>
            <p>Your demo has been successfully scheduled.</p>
            <p><b>Date:</b> ${selected_date}</p>
            <p><b>Time:</b> ${selected_time}</p>
            <p>Please check your Google Calendar for meeting details.</p>
          `,
        }),
      });

    } catch (emailError) {
      console.error("❌ Email sending failed:", emailError);
    }

    return jsonResponse({
      success: true,
      booking_id: bookingRow.id,
    });

  } catch (error) {
    console.error("❌ ERROR:", error);
    return jsonResponse({ error: error.message }, 500);
  }
});

// =====================================================
// HELPERS
// =====================================================

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

// ✅ FIXED TIMEZONE HANDLING
function buildSlotDateTimes(date: string, time: string) {
  const { hour, minute } = convert12HourTo24Hour(time);

  const startDateTime = `${date}T${String(hour).padStart(2, "0")}:${String(
    minute
  ).padStart(2, "0")}:00`;

  const end = new Date(`${startDateTime}`);
  end.setMinutes(end.getMinutes() + 30);

  const endDateTime = `${date}T${String(end.getHours()).padStart(2, "0")}:${String(
    end.getMinutes()
  ).padStart(2, "0")}:00`;

  return { startDateTime, endDateTime };
}

function convert12HourTo24Hour(time: string) {
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) throw new Error("Invalid time format");

  let hour = parseInt(match[1]);
  const minute = parseInt(match[2]);
  const period = match[3].toUpperCase();

  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;

  return { hour, minute };
}

async function getGoogleAccessToken(serviceAccount: any) {
  const now = Math.floor(Date.now() / 1000);

  const jwtHeader = { alg: "RS256", typ: "JWT" };
  const jwtClaimSet = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/calendar",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const unsignedJwt =
    `${base64UrlEncode(JSON.stringify(jwtHeader))}.` +
    `${base64UrlEncode(JSON.stringify(jwtClaimSet))}`;

  const signature = await signWithPrivateKey(
    unsignedJwt,
    serviceAccount.private_key
  );

  const assertion = `${unsignedJwt}.${signature}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  const tokenJson = await tokenRes.json();

  if (!tokenJson.access_token) {
    throw new Error("Failed to get access token");
  }

  return tokenJson.access_token;
}

async function signWithPrivateKey(data: string, privateKeyPem: string) {
  const pem = privateKeyPem
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\n/g, "");

  const binaryDer = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryDer.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(data)
  );

  return base64UrlEncodeBytes(new Uint8Array(signature));
}

async function checkSlotAvailability(
  accessToken: string,
  calendarId: string,
  startDateTime: string,
  endDateTime: string,
  timezone: string
) {
  const res = await fetch(
    "https://www.googleapis.com/calendar/v3/freeBusy",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        timeMin: startDateTime,
        timeMax: endDateTime,
        timeZone: timezone,
        items: [{ id: calendarId }],
      }),
    }
  );

  const json = await res.json();
  return (json?.calendars?.[calendarId]?.busy || []).length === 0;
}

function base64UrlEncode(input: string) {
  return base64UrlEncodeBytes(new TextEncoder().encode(input));
}

function base64UrlEncodeBytes(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}