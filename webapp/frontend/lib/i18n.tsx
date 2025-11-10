'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Locale = 'en' | 'zh';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// 翻译数据
const messages: Record<Locale, any> = {
  en: require('@/messages/en.json'),
  zh: require('@/messages/zh.json'),
};

// 检测浏览器语言
function detectLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  
  // 检查localStorage
  const savedLocale = localStorage.getItem('locale') as Locale;
  if (savedLocale && (savedLocale === 'en' || savedLocale === 'zh')) {
    return savedLocale;
  }
  
  // 检测浏览器语言
  const browserLang = navigator.language || (navigator as any).userLanguage;
  if (browserLang.startsWith('zh')) {
    return 'zh';
  }
  
  return 'en';
}

// 获取嵌套的翻译值
function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((current, key) => current?.[key], obj) || path;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    const detectedLocale = detectLocale();
    setLocaleState(detectedLocale);
    // 更新HTML lang属性
    if (typeof document !== 'undefined') {
      document.documentElement.lang = detectedLocale;
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
    // 更新HTML lang属性
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLocale;
    }
  };

  const t = (key: string, params?: Record<string, string>): string => {
    const message = getNestedValue(messages[locale], key);
    if (!params) return message;
    
    // 替换参数
    return Object.entries(params).reduce(
      (acc, [paramKey, paramValue]) => acc.replace(`{${paramKey}}`, paramValue),
      message
    );
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

