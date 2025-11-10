'use client';

import { useState, useEffect } from 'react';
import { outfitAPI, userPhotoAPI, wardrobeAPI, UserPhoto, WardrobeItem } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useI18n } from '@/lib/i18n';
import ProtectedRoute from '@/components/ProtectedRoute';

function GenerateOutfitContent() {
  const { initialize } = useAuthStore();
  const { t } = useI18n();
  const [userPhotos, setUserPhotos] = useState<UserPhoto[]>([]);
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [selectedPhotoId, setSelectedPhotoId] = useState<number | null>(null);
  const [selectedClothingIds, setSelectedClothingIds] = useState<number[]>([]);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [photosExpanded, setPhotosExpanded] = useState(false);
  const [clothingExpanded, setClothingExpanded] = useState(false);

  useEffect(() => {
    initialize();
    loadData();
  }, [initialize]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [photosRes, itemsRes] = await Promise.all([
        userPhotoAPI.getPhotos('body'),
        wardrobeAPI.getItems(),
      ]);
      setUserPhotos(photosRes.data);
      setWardrobeItems(itemsRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleClothingSelect = (id: number) => {
    setSelectedClothingIds((prev) => {
      if (prev.includes(id)) {
        // 取消选择
        return prev.filter((itemId) => itemId !== id);
      } else {
        // 最多选择2个
        if (prev.length >= 2) {
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  const handleGenerate = async () => {
    if (!selectedPhotoId) {
      setError(t('generate.selectPhotoRequired') || '请选择一张照片');
      return;
    }

    if (selectedClothingIds.length === 0) {
      setError(t('generate.selectClothingRequired') || '请至少选择一件服装');
      return;
    }

    if (selectedClothingIds.length > 2) {
      setError(t('generate.maxClothingExceeded') || '最多只能选择2件服装');
      return;
    }

    setGenerating(true);
    setError(null);
    setResult(null);

    try {
      const response = await outfitAPI.generate({
        user_photo_id: selectedPhotoId,
        clothing_ids: selectedClothingIds,
      });
      
      const imageUrl = response.data.result_image_url.startsWith('http')
        ? response.data.result_image_url
        : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001'}${response.data.result_image_url}`;
      
      setResult(imageUrl);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || t('errors.unknownError'));
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin border-2 border-gray-200 border-t-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        <h1 className="mb-8 text-3xl font-light tracking-tight text-gray-900">{t('generate.title')}</h1>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* 左侧：选择区域 - 更紧凑 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 用户照片选择 */}
            <div className="border border-gray-200 bg-white p-4">
              <h2 className="mb-4 text-xs font-light uppercase tracking-widest text-gray-500">{t('generate.step1')}：{t('generate.yourPhoto')}</h2>
              
              {userPhotos.length === 0 ? (
                <div className="border border-gray-200 bg-white p-4">
                  <p className="text-xs font-light tracking-wide text-gray-500 mb-2">
                    {t('generate.noPhotos') || '您还没有上传照片'}
                  </p>
                  <a
                    href="/profile"
                    className="text-xs font-light tracking-wide text-gray-900 underline hover:text-gray-600"
                  >
                    {t('generate.goToProfile') || '前往形象页面上传照片'}
                  </a>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-8 gap-2">
                    {(photosExpanded ? userPhotos : userPhotos.slice(0, 16)).map((photo) => {
                      // 构建完整的图片URL
                      let imageUrl = photo.photo_url;
                      if (!imageUrl.startsWith('http')) {
                        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001';
                        // 确保URL格式正确
                        if (!imageUrl.startsWith('/')) {
                          imageUrl = `/${imageUrl}`;
                        }
                        imageUrl = `${baseUrl}${imageUrl}`;
                      }
                      
                      return (
                        <div
                          key={photo.id}
                          onClick={() => setSelectedPhotoId(photo.id === selectedPhotoId ? null : photo.id)}
                          className={`relative cursor-pointer border-2 transition-all ${
                            selectedPhotoId === photo.id
                              ? 'border-gray-900'
                              : 'border-gray-200 hover:border-gray-400'
                          }`}
                        >
                          <img
                            src={imageUrl}
                            alt="User photo"
                            className="aspect-square w-full object-cover"
                            onError={(e) => {
                              console.error('Image load error:', imageUrl);
                              console.error('Photo data:', photo);
                            }}
                          />
                          {selectedPhotoId === photo.id && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="bg-gray-900 bg-opacity-95 rounded-full p-1 shadow-lg ring-1 ring-white">
                                <svg
                                  className="h-3 w-3 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {userPhotos.length > 16 && (
                    <button
                      onClick={() => setPhotosExpanded(!photosExpanded)}
                      className="mt-4 flex w-full items-center justify-center gap-2 border border-gray-300 bg-white px-4 py-2 text-xs font-light uppercase tracking-widest text-gray-900 transition-all hover:border-gray-900"
                    >
                      {photosExpanded ? (
                        <>
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                          {t('generate.collapse')}
                        </>
                      ) : (
                        <>
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                          {t('generate.expandMore')} ({userPhotos.length - 16})
                        </>
                      )}
                    </button>
                  )}
                </>
              )}
            </div>

            {/* 服装选择 */}
            <div className="border border-gray-200 bg-white p-4">
              <h2 className="mb-4 text-xs font-light uppercase tracking-widest text-gray-500">
                {t('generate.step2')}：{t('generate.selectClothing')} ({selectedClothingIds.length}/2)
              </h2>
              {wardrobeItems.length === 0 ? (
                <div className="border border-gray-200 bg-white p-4">
                  <p className="text-xs font-light tracking-wide text-gray-500 mb-2">
                    {t('generate.emptyWardrobe')}
                  </p>
                  <a
                    href="/wardrobe"
                    className="text-xs font-light tracking-wide text-gray-900 underline hover:text-gray-600"
                  >
                    {t('generate.goToWardrobe') || '前往衣柜页面添加服装'}
                  </a>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-8 gap-2">
                    {(clothingExpanded ? wardrobeItems : wardrobeItems.slice(0, 16)).map((item) => {
                      const imageUrl = item.image_url.startsWith('http')
                        ? item.image_url
                        : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001'}${item.image_url}`;
                      const isSelected = selectedClothingIds.includes(item.id);
                      const isDisabled = !isSelected && selectedClothingIds.length >= 2;

                      return (
                        <div
                          key={item.id}
                          onClick={() => !isDisabled && handleClothingSelect(item.id)}
                          className={`relative cursor-pointer border-2 transition-all ${
                            isSelected
                              ? 'border-gray-900'
                              : isDisabled
                              ? 'border-gray-100 opacity-50 cursor-not-allowed'
                              : 'border-gray-200 hover:border-gray-400'
                          }`}
                        >
                          <img
                            src={imageUrl}
                            alt={item.name || 'Clothing item'}
                            className="aspect-[4/3] w-full object-cover"
                          />
                          {isSelected && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="bg-gray-900 bg-opacity-95 rounded-full p-1 shadow-lg ring-1 ring-white">
                                <svg
                                  className="h-3 w-3 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {wardrobeItems.length > 16 && (
                    <button
                      onClick={() => setClothingExpanded(!clothingExpanded)}
                      className="mt-4 flex w-full items-center justify-center gap-2 border border-gray-300 bg-white px-4 py-2 text-xs font-light uppercase tracking-widest text-gray-900 transition-all hover:border-gray-900"
                    >
                      {clothingExpanded ? (
                        <>
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                          {t('generate.collapse')}
                        </>
                      ) : (
                        <>
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                          {t('generate.expandMore')} ({wardrobeItems.length - 16})
                        </>
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* 右侧：选中项展示和结果 - 更紧凑 */}
          <div className="lg:col-span-1 space-y-4">
            {/* 选中项展示 */}
            {(selectedPhotoId || selectedClothingIds.length > 0) && (
              <div className="border border-gray-200 bg-white p-4">
                <h2 className="mb-4 text-xs font-light uppercase tracking-widest text-gray-500">
                  {t('generate.selectedItems') || '已选择'}
                </h2>
                
                <div className="space-y-4">
                  {/* 选中的照片 */}
                  {selectedPhotoId && (() => {
                    const selectedPhoto = userPhotos.find(p => p.id === selectedPhotoId);
                    if (!selectedPhoto) return null;
                    let photoUrl = selectedPhoto.photo_url;
                    if (!photoUrl.startsWith('http')) {
                      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001';
                      if (!photoUrl.startsWith('/')) {
                        photoUrl = `/${photoUrl}`;
                      }
                      photoUrl = `${baseUrl}${photoUrl}`;
                    }
                    return (
                      <div>
                        <p className="mb-2 text-xs font-light uppercase tracking-widest text-gray-500">
                          {t('generate.yourPhoto')}
                        </p>
                        <div className="border border-gray-200">
                          <img
                            src={photoUrl}
                            alt="Selected photo"
                            className="aspect-square w-full object-cover"
                          />
                        </div>
                      </div>
                    );
                  })()}

                  {/* 选中的服装 */}
                  {selectedClothingIds.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-light uppercase tracking-widest text-gray-500">
                        {t('generate.selectedClothing') || '要穿搭的服装'}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedClothingIds.map((id) => {
                          const item = wardrobeItems.find(i => i.id === id);
                          if (!item) return null;
                          const imageUrl = item.image_url.startsWith('http')
                            ? item.image_url
                            : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001'}${item.image_url}`;
                          return (
                            <div key={id} className="border border-gray-200">
                              <img
                                src={imageUrl}
                                alt={item.name || 'Clothing item'}
                                className="aspect-[4/3] w-full object-cover"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* 生成按钮 */}
                <button
                  onClick={handleGenerate}
                  disabled={generating || !selectedPhotoId || selectedClothingIds.length === 0}
                  className="mt-4 w-full border border-gray-900 bg-gray-900 px-6 py-3 text-xs font-light uppercase tracking-widest text-white transition-all hover:bg-white hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('generate.step3')}：{generating ? t('generate.generating') : t('generate.generateButton')}
                </button>
              </div>
            )}

            {/* 生成按钮（当没有选中项时显示） */}
            {(!selectedPhotoId && selectedClothingIds.length === 0) && (
              <button
                onClick={handleGenerate}
                disabled={true}
                className="w-full border border-gray-300 bg-white px-6 py-3 text-xs font-light uppercase tracking-widest text-gray-400 cursor-not-allowed"
              >
                {t('generate.step3')}：{t('generate.generateButton')}
              </button>
            )}

            {/* 结果显示 */}
            <div className="border border-gray-200 bg-white p-4">
              <h2 className="mb-4 text-xs font-light uppercase tracking-widest text-gray-500">{t('generate.result')}</h2>
              {error && (
                <div className="mb-4 border border-gray-300 bg-white p-3">
                  <p className="text-xs font-light text-gray-900">{error}</p>
                </div>
              )}
              {generating ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="mb-4 h-6 w-6 animate-spin border-2 border-gray-200 border-t-gray-900"></div>
                  <p className="text-xs font-light tracking-wide text-gray-500">{t('generate.generatingOutfit')}</p>
                </div>
              ) : result ? (
                <div>
                  <img
                    src={result}
                    alt="Generated outfit"
                    className="w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center py-12 text-gray-500">
                  <p className="text-xs font-light tracking-wide">{t('generate.selectItems')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GenerateOutfitPage() {
  return (
    <ProtectedRoute>
      <GenerateOutfitContent />
    </ProtectedRoute>
  );
}
