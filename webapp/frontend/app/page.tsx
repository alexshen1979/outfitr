'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useI18n } from '@/lib/i18n';
import Link from 'next/link';

export default function Home() {
  const { isAuthenticated, user, initialize } = useAuthStore();
  const { t } = useI18n();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 lg:py-32">
        <div className="text-center">
          {/* 主标题 - 简洁优雅 */}
          <div className="mb-16">
            <h1 className="mb-4 text-6xl font-light tracking-tight text-gray-900 sm:text-7xl md:text-8xl">
              {t('home.title')}
            </h1>
            <div className="mb-6 inline-block">
              <span className="text-6xl font-light tracking-tight text-gray-900 sm:text-7xl md:text-8xl">
                OUTFITR
              </span>
            </div>
            <div className="mx-auto mt-6 h-px w-24 bg-gray-300"></div>
            <p className="mt-8 text-lg font-light tracking-wide text-gray-600 sm:text-xl">
              {t('home.subtitle')}
            </p>
          </div>

          {isAuthenticated ? (
            <div className="mt-20">
              {/* 欢迎信息 - 极简风格 */}
              <div className="mb-16">
                <p className="text-xl font-light text-gray-700">
                  {t('home.welcomeBack', { name: user?.nickname || user?.email || '' })}
                </p>
                <p className="mt-3 text-sm font-light tracking-wide text-gray-500">
                  {t('home.welcomeMessage')}
                </p>
              </div>

              {/* 操作按钮 - 简洁高级 */}
              <div className="mb-20 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link
                  href="/outfit/generate"
                  className="group relative inline-flex items-center justify-center border border-gray-900 bg-gray-900 px-10 py-4 text-sm font-light uppercase tracking-widest text-white transition-all duration-300 hover:bg-white hover:text-gray-900"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    {t('home.startStyling')}
                    <svg
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </span>
                </Link>

                <Link
                  href="/wardrobe"
                  className="inline-flex items-center justify-center border border-gray-300 bg-white px-10 py-4 text-sm font-light uppercase tracking-widest text-gray-900 transition-all duration-300 hover:border-gray-900"
                >
                  {t('home.myWardrobe')}
                </Link>

                <Link
                  href="/profile"
                  className="inline-flex items-center justify-center border border-gray-300 bg-white px-10 py-4 text-sm font-light uppercase tracking-widest text-gray-900 transition-all duration-300 hover:border-gray-900"
                >
                  {t('home.myProfile')}
                </Link>
              </div>

              {/* 功能卡片 - 极简网格 */}
              <div className="mt-24 grid grid-cols-1 gap-px border-t border-l border-gray-200 sm:grid-cols-3">
                <div className="border-b border-r border-gray-200 bg-white p-12 transition-colors hover:bg-gray-50">
                  <div className="mb-6 text-xs font-light uppercase tracking-widest text-gray-500">
                    {t('home.feature1.title')}
                  </div>
                  <p className="text-sm font-light leading-relaxed text-gray-600">
                    {t('home.feature1.description')}
                  </p>
                </div>

                <div className="border-b border-r border-gray-200 bg-white p-12 transition-colors hover:bg-gray-50">
                  <div className="mb-6 text-xs font-light uppercase tracking-widest text-gray-500">
                    {t('home.feature2.title')}
                  </div>
                  <p className="text-sm font-light leading-relaxed text-gray-600">
                    {t('home.feature2.description')}
                  </p>
                </div>

                <div className="border-b border-r border-gray-200 bg-white p-12 transition-colors hover:bg-gray-50 sm:border-r-0">
                  <div className="mb-6 text-xs font-light uppercase tracking-widest text-gray-500">
                    {t('home.feature3.title')}
                  </div>
                  <p className="text-sm font-light leading-relaxed text-gray-600">
                    {t('home.feature3.description')}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-20">
              {/* 未登录状态 - 简洁设计 */}
              <div className="mb-16">
                <p className="text-lg font-light text-gray-600">
                  {t('home.getStartedDescription')}
                </p>
              </div>

              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link
                  href="/register"
                  className="group relative inline-flex items-center justify-center border border-gray-900 bg-gray-900 px-10 py-4 text-sm font-light uppercase tracking-widest text-white transition-all duration-300 hover:bg-white hover:text-gray-900"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    {t('home.getStarted')}
                    <svg
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </span>
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center border border-gray-300 bg-white px-10 py-4 text-sm font-light uppercase tracking-widest text-gray-900 transition-all duration-300 hover:border-gray-900"
                >
                  {t('auth.signIn')}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
