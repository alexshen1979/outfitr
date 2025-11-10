'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useI18n } from '@/lib/i18n';
import Link from 'next/link';

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const { t } = useI18n();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    mode: 'onBlur', // 在失去焦点时验证
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authAPI.login(data);
      login(response.data.token, response.data.user);
      router.push('/');
    } catch (err: any) {
      console.error('Login error:', err);
      console.error('Error response:', err.response?.data);
      
      // 显示详细的错误信息
      let errorMessage = t('errors.loginFailed');
      
      if (err.response?.data?.error) {
        // 使用后端返回的具体错误信息
        errorMessage = err.response.data.error.message || errorMessage;
        
        // 特殊处理某些错误代码
        if (err.response.data.error.code === 'INVALID_CREDENTIALS') {
          errorMessage = t('errors.invalidCredentials') || '邮箱或密码错误';
        } else if (err.response.data.error.code === 'VALIDATION_ERROR') {
          errorMessage = err.response.data.error.message;
        } else if (err.response.data.error.code === 'DATABASE_ERROR') {
          errorMessage = t('errors.databaseError') || '数据库错误';
        }
      } else if (err.code === 'ECONNREFUSED' || err.message?.includes('Network Error')) {
        errorMessage = t('errors.backendNotRunning') || '无法连接到服务器，请确保后端服务正在运行';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6 py-20">
      <div className="w-full max-w-md space-y-12">
        <div className="text-center">
          <h2 className="text-4xl font-light tracking-tight text-gray-900">
            {t('auth.signInTitle')}
          </h2>
          <div className="mx-auto mt-4 h-px w-16 bg-gray-300"></div>
          <p className="mt-6 text-sm font-light tracking-wide text-gray-500">
            {t('auth.welcomeBack')}
          </p>
        </div>

        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="relative border-l-2 border-red-500 bg-red-50 px-6 py-4">
              <div className="flex items-start gap-3">
                <svg
                  className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-xs font-light tracking-wide text-red-900">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-xs font-light uppercase tracking-widest text-gray-500 mb-3">
                {t('auth.email')}
              </label>
              <input
                {...register('email', {
                  required: t('auth.emailRequired'),
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: t('auth.invalidEmail'),
                  },
                })}
                type="email"
                id="email"
                className="w-full border-b border-gray-300 bg-transparent px-0 py-3 text-sm font-light text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none transition-colors"
                placeholder="you@example.com"
              />
              {errors.email && (
                <div className="mt-2 relative border-l-2 border-red-500 bg-red-50 px-4 py-2">
                  <div className="flex items-start gap-2">
                    <svg
                      className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-xs font-light tracking-wide text-red-900">{errors.email.message}</p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-light uppercase tracking-widest text-gray-500 mb-3">
                {t('auth.password')}
              </label>
              <input
                {...register('password', {
                  required: t('auth.passwordRequired'),
                })}
                type="password"
                id="password"
                className="w-full border-b border-gray-300 bg-transparent px-0 py-3 text-sm font-light text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none transition-colors"
                placeholder="••••••••"
              />
              {errors.password && (
                <div className="mt-2 relative border-l-2 border-red-500 bg-red-50 px-4 py-2">
                  <div className="flex items-start gap-2">
                    <svg
                      className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-xs font-light tracking-wide text-red-900">{errors.password.message}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full border border-gray-900 bg-gray-900 px-8 py-4 text-xs font-light uppercase tracking-widest text-white transition-all hover:bg-white hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? t('auth.signingIn') : t('auth.signIn')}
            </button>
          </div>

          <div className="text-center text-xs font-light tracking-wide">
            <span className="text-gray-500">{t('auth.dontHaveAccount')} </span>
            <Link href="/register" className="text-gray-900 underline underline-offset-4 hover:text-gray-600 transition-colors">
              {t('auth.signUp')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
