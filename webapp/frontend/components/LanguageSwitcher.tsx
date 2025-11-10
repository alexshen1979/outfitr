'use client';

import { useI18n } from '@/lib/i18n';
import { localeNames } from '@/config/i18n';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="relative">
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as 'en' | 'zh')}
        className="border border-gray-300 bg-white px-4 py-2 text-xs font-light uppercase tracking-widest text-gray-900 transition-all focus:border-gray-900 focus:outline-none"
      >
        <option value="en" className="text-gray-900">{localeNames.en}</option>
        <option value="zh" className="text-gray-900">{localeNames.zh}</option>
      </select>
    </div>
  );
}

