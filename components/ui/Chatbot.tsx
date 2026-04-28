import React, { useEffect, useRef, useState } from 'react';

/* ─── Config ──────────────────────────────────────────────────────────────── */
const AGENT_ID = 'agent_9001kpwd96apfrcvzaaeefkyz13f';
const CONTACT_URL = 'https://taskforceai.tech/#/contact';
const BOOK_DEMO_URL = 'https://taskforceai.tech/#/book-demo';
const WHATSAPP_NUMBER = '94776697566';
const WHATSAPP_MSG = 'Hello TaskForce AI';

/* ─── WhatsApp SVG ───────────────────────────────────────────────────────── */
const WaIcon = ({ size = 22 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width={size} height={size} fill="#25D366">
    <path d="M19.11 17.2c-.27-.14-1.58-.78-1.83-.87-.24-.09-.42-.14-.6.14-.18.27-.69.87-.85 1.05-.16.18-.31.21-.58.07-.27-.14-1.13-.42-2.15-1.35-.8-.71-1.34-1.59-1.5-1.86-.16-.27-.02-.42.12-.56.12-.12.27-.31.4-.47.13-.16.18-.27.27-.45.09-.18.04-.34-.02-.47-.07-.14-.6-1.45-.82-1.99-.22-.52-.44-.45-.6-.46h-.51c-.18 0-.47.07-.71.34-.24.27-.91.89-.91 2.17 0 1.28.93 2.52 1.06 2.69.13.18 1.82 2.78 4.41 3.89.62.27 1.11.43 1.49.55.63.2 1.2.17 1.65.1.5-.08 1.58-.64 1.8-1.25.22-.62.22-1.15.16-1.25-.07-.1-.24-.16-.51-.3zM16.03 3.2c-7.08 0-12.8 5.72-12.8 12.8 0 2.25.58 4.44 1.69 6.38L3.2 28.8l6.57-1.69a12.73 12.73 0 006.26 1.6h.01c7.07 0 12.8-5.73 12.8-12.8 0-3.43-1.34-6.66-3.77-9.09A12.7 12.7 0 0016.03 3.2zm0 23.34h-.01a10.6 10.6 0 01-5.4-1.48l-.39-.23-3.9 1 1.04-3.8-.25-.39a10.58 10.58 0 01-1.62-5.63c0-5.84 4.75-10.59 10.6-10.59 2.83 0 5.49 1.1 7.49 3.1a10.52 10.52 0 013.1 7.49c0 5.84-4.76 10.59-10.6 10.59z"/>
  </svg>
);

/* ─── Main Component ─────────────────────────────────────────────────────── */
const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const widgetRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const widget = widgetRef.current;
    if (!widget) return;

    const onCall = (e: Event) => {
      const ce = e as CustomEvent<any>;
      if (!ce.detail?.config) return;

      ce.detail.config.clientTools = {
        contact_hq: ({ url }: { url?: string }) => {
          setTimeout(() => {
            window.location.href = url || CONTACT_URL;
          }, 1200);
        },
        book_demo: ({ url }: { url?: string }) => {
          setTimeout(() => {
            window.location.href = url || BOOK_DEMO_URL;
          }, 1200);
        },
      };
    };

    widget.addEventListener('elevenlabs-convai:call', onCall);
    return () => widget.removeEventListener('elevenlabs-convai:call', onCall);
  }, [open]);

  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MSG)}`;

  return (
    <>
      <style>{`
        @keyframes tfSlideIn {
          from { opacity:0; transform:translateX(22px); }
          to { opacity:1; transform:translateX(0); }
        }

        @keyframes tfChatGlow {
          0%,100% { box-shadow: 0 0 16px rgba(0,102,255,0.22), 0 8px 24px rgba(0,0,0,0.45); }
          50% { box-shadow: 0 0 30px rgba(0,102,255,0.42), 0 8px 32px rgba(0,0,0,0.55); }
        }

        @keyframes tfWaGlow {
          0%,100% { box-shadow: 0 0 14px rgba(37,211,102,0.15); }
          50% { box-shadow: 0 0 26px rgba(37,211,102,0.35); }
        }

        .tf-side-panel {
          animation: tfSlideIn 0.22s cubic-bezier(0.16,1,0.3,1);
        }

        .tf-chat-glow {
          animation: tfChatGlow 3s ease-in-out infinite;
        }

        .tf-wa-glow {
          animation: tfWaGlow 3s ease-in-out infinite;
        }

        .tf-rail-btn {
          transition: transform 0.18s ease, background 0.18s ease;
        }

        .tf-rail-btn:hover {
          transform: scale(1.07);
        }

        .tf-elevenlabs-wrapper {
          position: fixed;
          right: 72px;
          bottom: 20%;
          width: 400px;
          height: 620px;
          z-index: 9999;
        }

        .tf-elevenlabs-wrapper elevenlabs-convai {
          width: 100%;
          height: 100%;
          display: block;
        }

        @media (max-width: 768px) {
          .tf-elevenlabs-wrapper {
            right: 0;
            left: 0;
            bottom: 0;
            width: 100vw;
            height: 82vh;
          }

          .tf-side-rail {
            bottom: 80px !important;
          }
        }
      `}</style>

      <div
        className="tf-side-rail"
        style={{
          position: 'fixed',
          right: 0,
          bottom: '26%',
          zIndex: 9998,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <button
          onClick={() => setPanelOpen((p) => !p)}
          aria-label={panelOpen ? 'Collapse panel' : 'Expand panel'}
          style={{
            width: '20px',
            height: '70px',
            borderRadius: '10px 0 0 10px',
            border: '1px solid rgba(0,102,255,0.25)',
            borderRight: 'none',
            background: 'linear-gradient(180deg,rgba(0,102,255,0.22) 0%,rgba(6,182,212,0.14) 100%)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            color: 'rgba(255,255,255,0.8)',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {panelOpen ? '›' : '‹'}
        </button>

        {panelOpen && (
          <div
            className="tf-side-panel"
            style={{
              display: 'flex',
              flexDirection: 'column',
              background: 'linear-gradient(180deg,rgba(8,10,22,0.97) 0%,rgba(5,7,16,0.97) 100%)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: '0 0 0 18px',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              overflow: 'hidden',
              boxShadow: '-6px 10px 48px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04) inset',
            }}
          >
            <button
              className="tf-rail-btn tf-chat-glow"
              onClick={() => setOpen((p) => !p)}
              aria-label={open ? 'Close AI chat' : 'Open AI chat'}
              title="AI Assistant"
              style={{
                width: '64px',
                height: '70px',
                border: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                background: open
                  ? 'linear-gradient(160deg,rgba(0,102,255,0.38) 0%,rgba(6,182,212,0.22) 100%)'
                  : 'transparent',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                padding: 0,
              }}
            >
              <span
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg,#0057e7 0%,#06b6d4 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 18px rgba(0,102,255,0.5)',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                {open ? (
                  <span style={{ color: '#fff', fontSize: '22px', lineHeight: 1 }}>×</span>
                ) : (
                  <img
                    src="/logo-icon.png"
                    alt="AI"
                    style={{ width: '26px', height: '26px', objectFit: 'contain' }}
                  />
                )}
              </span>

              <span
                style={{
                  color: open ? 'rgba(6,182,212,0.9)' : 'rgba(255,255,255,0.45)',
                  fontSize: '8.5px',
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                {open ? 'Close' : 'Chat AI'}
              </span>
            </button>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="tf-rail-btn tf-wa-glow"
              title="Chat on WhatsApp"
              style={{
                width: '64px',
                height: '70px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                textDecoration: 'none',
                background: 'rgba(37,211,102,0.06)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <span
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '14px',
                  background: 'rgba(37,211,102,0.13)',
                  border: '1px solid rgba(37,211,102,0.32)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <WaIcon size={24} />
              </span>

              <span
                style={{
                  color: 'rgba(37,211,102,0.65)',
                  fontSize: '8.5px',
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                WhatsApp
              </span>
            </a>
          </div>
        )}
      </div>

      {open && (
        <div className="tf-elevenlabs-wrapper">
          {React.createElement('elevenlabs-convai', {
            ref: (el: HTMLElement | null) => {
              widgetRef.current = el;
            },
            'agent-id': AGENT_ID,
          })}
        </div>
      )}
    </>
  );
};

export default Chatbot;
