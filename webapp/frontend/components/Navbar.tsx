'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const pathname = usePathname();
  const { t } = useI18n();

  const navLinks = [
    { href: '/', label: t('navbar.home') },
    { href: '/wardrobe', label: t('navbar.wardrobe'), protected: true },
    { href: '/profile', label: t('navbar.profile'), protected: true },
    { href: '/outfit/generate', label: t('navbar.outfit'), protected: true },
  ];

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center space-x-12">
            <Link href="/" className="text-lg font-light tracking-widest text-gray-900">
              OUTFITR
            </Link>
            <div className="hidden space-x-8 md:flex">
              {navLinks.map((link) => {
                if (link.protected && !isAuthenticated) return null;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm font-light tracking-wide transition-colors ${
                      pathname === link.href
                        ? 'text-gray-900 border-b border-gray-900 pb-1'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <LanguageSwitcher />
            {isAuthenticated ? (
              <>
                <span className="hidden text-xs font-light tracking-wide text-gray-500 sm:inline">
                  {user?.nickname || user?.email}
                </span>
                <button
                  onClick={logout}
                  className="border border-gray-300 bg-white px-6 py-2 text-xs font-light uppercase tracking-widest text-gray-900 transition-all hover:border-gray-900"
                >
                  {t('auth.signOut')}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs font-light tracking-wide text-gray-600 transition-colors hover:text-gray-900"
                >
                  {t('auth.signIn')}
                </Link>
                <Link
                  href="/register"
                  className="border border-gray-900 bg-gray-900 px-6 py-2 text-xs font-light uppercase tracking-widest text-white transition-all hover:bg-white hover:text-gray-900"
                >
                  {t('auth.signUp')}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
