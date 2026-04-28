import React from 'react';

export const WhatsAppFloat: React.FC = () => {
  const whatsappNumber = '94776697566'; // replace with your real number
  const message = 'Hello TaskForce AI';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      title="Chat on WhatsApp"
      className="
        fixed bottom-8 right-8 z-[9999]
        w-20 h-20 rounded-full
        flex items-center justify-center
        bg-[#0b1220]/95
        border border-white/10
        shadow-[0_10px_35px_rgba(0,0,0,0.45)]
        backdrop-blur-md
        hover:scale-110
        transition-all duration-300
      "
    >
      <span
        className="
          absolute inset-0 rounded-full
          bg-[radial-gradient(circle_at_center,rgba(37,211,102,0.18),transparent_65%)]
          pointer-events-none
        "
      />
      <span
        className="
          absolute inset-[6px] rounded-full
          border border-[#25D366]/25
          pointer-events-none
        "
      />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        className="w-10 h-10 fill-[#25D366] drop-shadow-[0_0_8px_rgba(37,211,102,0.35)] relative z-10"
      >
        <path d="M19.11 17.2c-.27-.14-1.58-.78-1.83-.87-.24-.09-.42-.14-.6.14-.18.27-.69.87-.85 1.05-.16.18-.31.21-.58.07-.27-.14-1.13-.42-2.15-1.35-.8-.71-1.34-1.59-1.5-1.86-.16-.27-.02-.42.12-.56.12-.12.27-.31.4-.47.13-.16.18-.27.27-.45.09-.18.04-.34-.02-.47-.07-.14-.6-1.45-.82-1.99-.22-.52-.44-.45-.6-.46h-.51c-.18 0-.47.07-.71.34-.24.27-.91.89-.91 2.17 0 1.28.93 2.52 1.06 2.69.13.18 1.82 2.78 4.41 3.89.62.27 1.11.43 1.49.55.63.2 1.2.17 1.65.1.5-.08 1.58-.64 1.8-1.25.22-.62.22-1.15.16-1.25-.07-.1-.24-.16-.51-.3zM16.03 3.2c-7.08 0-12.8 5.72-12.8 12.8 0 2.25.58 4.44 1.69 6.38L3.2 28.8l6.57-1.69a12.73 12.73 0 0 0 6.26 1.6h.01c7.07 0 12.8-5.73 12.8-12.8 0-3.43-1.34-6.66-3.77-9.09A12.7 12.7 0 0 0 16.03 3.2zm0 23.34h-.01a10.6 10.6 0 0 1-5.4-1.48l-.39-.23-3.9 1 1.04-3.8-.25-.39a10.58 10.58 0 0 1-1.62-5.63c0-5.84 4.75-10.59 10.6-10.59 2.83 0 5.49 1.1 7.49 3.1a10.52 10.52 0 0 1 3.1 7.49c0 5.84-4.76 10.59-10.6 10.59z" />
      </svg>
    </a>
  );
};