'use client';

import { Mail } from 'lucide-react';

interface SocialButtonsProps {
  actionLabel?: 'Daftar' | 'Masuk';
  onGoogleLogin?: () => void;
  onEmailClick?: () => void;
  isLoading?: boolean;
}

export default function SocialButtons({
  actionLabel = 'Masuk',
  onGoogleLogin,
  onEmailClick,
  isLoading = false,
}: SocialButtonsProps) {
  return (
    <div className="flex flex-col gap-2.5 w-full">
      {/* Google Button */}
      <button
        type="button"
        onClick={onGoogleLogin}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 active:scale-[0.99] transition-all cursor-pointer shadow-2xs disabled:opacity-60"
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.37 7.33 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.63 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>
        <span>{actionLabel} dengan Google</span>
      </button>

      {/* Email Button */}
      <button
        type="button"
        onClick={onEmailClick}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 active:scale-[0.99] transition-all cursor-pointer shadow-2xs disabled:opacity-60"
      >
        <Mail size={17} className="text-gray-500 shrink-0 stroke-[1.75]" />
        <span>{actionLabel} dengan email</span>
      </button>
    </div>
  );
}
