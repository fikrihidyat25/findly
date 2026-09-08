import Link from 'next/link';
import Image from 'next/image';

export default function AuthBanner() {
  return (
    <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-8 sm:p-10 bg-gradient-to-b from-[#dff0ff] via-[#65bcfc] to-[#1f97fc] rounded-2xl relative overflow-hidden select-none min-h-[620px]">
      {/* Decorative subtle background overlay */}
      <div className="absolute inset-0 bg-radial from-white/20 to-transparent pointer-events-none" />

      {/* Brand Logo */}
      <div className="relative z-10">
        <Link
          href="/"
          className="text-2xl font-black tracking-tight text-primary drop-shadow-sm hover:opacity-85 transition-opacity inline-block"
        >
          Findly.
        </Link>
      </div>

      {/* Center Illustration */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto py-8">
        <div className="relative w-48 h-64 transition-transform hover:scale-105 duration-300">
          <Image
            src="/auth-box-icon.png"
            alt="Findly Box Illustration"
            fill
            className="object-contain drop-shadow-md"
            priority
          />
        </div>
      </div>

      {/* Footer text */}
      <div className="relative z-10">
        <p className="text-xs text-white/75 font-normal tracking-wide">
          © 2026 Findly.
        </p>
      </div>
    </div>
  );
}
