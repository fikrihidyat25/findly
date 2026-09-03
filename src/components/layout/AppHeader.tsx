'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Bell,
  MessageSquare,
  Menu,
  CheckCircle2,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from 'lucide-react';

interface AppHeaderProps {
  onOpenMobileMenu?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export default function AppHeader({
  onOpenMobileMenu,
  searchQuery = '',
  onSearchChange,
}: AppHeaderProps) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu Toggle & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        {/* Global Search Input */}
        <div className="relative w-full">
          <Search
            size={17}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Cari barang hilang atau ditemukan..."
            className="w-full bg-gray-50/80 hover:bg-gray-50 focus:bg-white pl-10 pr-12 py-2 rounded-xl text-xs sm:text-sm text-gray-800 placeholder-gray-400 border border-gray-200/80 focus:border-[#30AFFF] focus:ring-2 focus:ring-[#30AFFF]/20 focus:outline-none transition-all shadow-2xs"
          />
          <div className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 items-center gap-0.5 text-[10px] font-semibold text-gray-400 bg-white border border-gray-200 px-1.5 py-0.5 rounded shadow-2xs">
            <span>⌘</span>
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right: Notifications, Messages, and Profile */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* Notification Bell */}
        <Link
          href="/notifications"
          className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
          aria-label="Notifications"
        >
          <Bell size={19} className="stroke-[1.75]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
        </Link>

        {/* Messages */}
        <Link
          href="/messages"
          className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
          aria-label="Messages"
        >
          <MessageSquare size={19} className="stroke-[1.75]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#30AFFF] ring-2 ring-white" />
        </Link>

        {/* User Profile Pill & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all cursor-pointer"
          >
            {/* Avatar with Verified Ring */}
            <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-[#30AFFF] to-[#60c4ff] text-white font-bold flex items-center justify-center text-xs shadow-xs">
              BS
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center">
                <CheckCircle2 size={12} className="text-[#10B981] fill-white" />
              </div>
            </div>

            {/* Name & Role (Desktop) */}
            <div className="hidden lg:flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-gray-900 leading-none">
                  Budi Santoso
                </span>
              </div>
              <span className="text-[11px] text-gray-400 leading-none mt-1">
                Student
              </span>
            </div>

            <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
          </button>

          {/* Profile Dropdown Menu */}
          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2.5 border-b border-gray-50">
                <p className="text-xs font-bold text-gray-900">Budi Santoso</p>
                <p className="text-[11px] text-gray-400 truncate">budi.santoso@univ-abc.ac.id</p>
                <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                  <CheckCircle2 size={10} />
                  <span>University Verified</span>
                </div>
              </div>

              <div className="py-1">
                <Link
                  href="/profile"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                >
                  <User size={14} className="text-gray-400" />
                  <span>Profil Saya</span>
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                >
                  <Settings size={14} className="text-gray-400" />
                  <span>Pengaturan</span>
                </Link>
              </div>

              <div className="border-t border-gray-50 pt-1">
                <Link
                  href="/login"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-red-600 hover:bg-red-50"
                >
                  <LogOut size={14} />
                  <span>Keluar</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
