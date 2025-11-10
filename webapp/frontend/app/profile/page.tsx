'use client';

import { useState, useEffect } from 'react';
import { userPhotoAPI, UserPhoto } from '@/lib/api';
import ImageUpload from '@/components/ImageUpload';
import { useAuthStore } from '@/store/auth.store';
import { useI18n } from '@/lib/i18n';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useToast } from '@/components/Toast';
import ProgressBar from '@/components/ProgressBar';
import ConfirmDialog from '@/components/ConfirmDialog';

function ProfileContent() {
  const { initialize } = useAuthStore();
  const { t } = useI18n();
  const { showToast } = useToast();
  const [photos, setPhotos] = useState<UserPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ url: string; filename: string }>>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);
  const [currentSavingIndex, setCurrentSavingIndex] = useState(0);
  const [deleteConfirmPhoto, setDeleteConfirmPhoto] = useState<UserPhoto | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    initialize();
    loadPhotos();
  }, [initialize]);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      const response = await userPhotoAPI.getPhotos('body');
      setPhotos(response.data);
    } catch (error) {
      console.error('Failed to load photos:', error);
      showToast(t('errors.unknownError'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadMultipleSuccess = (files: Array<{ url: string; filename: string }>) => {
    setUploadedFiles(files);
  };

  const handleSavePhotos = async () => {
    if (uploadedFiles.length === 0) {
      showToast(t('profile.uploadImageFirst') || '请先上传图片', 'warning');
      return;
    }

    setIsSaving(true);
    setSaveProgress(0);
    setCurrentSavingIndex(0);

    try {
      const total = uploadedFiles.length;
      let successCount = 0;
      let failCount = 0;

      // 逐个保存照片
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        setCurrentSavingIndex(i + 1);

        try {
          // 确保只保存相对路径，不包含完整URL
          let photoUrl = file.url;
          // 如果URL包含完整路径，提取相对路径
          if (photoUrl.startsWith('http')) {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001';
            if (photoUrl.startsWith(baseUrl)) {
              photoUrl = photoUrl.replace(baseUrl, '');
            }
          }
          // 确保以 / 开头
          if (!photoUrl.startsWith('/')) {
            photoUrl = `/${photoUrl}`;
          }
          
          await userPhotoAPI.createPhoto(photoUrl, 'body');
          successCount++;
        } catch (error: any) {
          console.error(`Failed to save photo ${i + 1}:`, error);
          failCount++;
        }

        // 更新进度
        const progress = ((i + 1) / total) * 100;
        setSaveProgress(progress);
      }

      // 重置表单
      setShowAddForm(false);
      setUploadedFiles([]);
      
      // 重新加载列表
      await loadPhotos();

      // 显示成功消息
      if (successCount > 0) {
        if (failCount > 0) {
          showToast(
            t('profile.batchAddPartial', { success: successCount.toString(), total: total.toString() }) || 
            `成功添加 ${successCount}/${total} 张照片`,
            'warning'
          );
        } else {
          showToast(
            t('profile.batchAddSuccess', { count: successCount.toString() }) || 
            `成功添加 ${successCount} 张照片`,
            'success'
          );
        }
      } else {
        showToast(t('profile.batchAddFailed') || '添加失败', 'error');
      }
    } catch (error: any) {
      console.error('Save photos error:', error);
      showToast(
        error.response?.data?.error?.message || t('errors.unknownError'),
        'error'
      );
    } finally {
      setIsSaving(false);
      setSaveProgress(0);
      setCurrentSavingIndex(0);
    }
  };

  const handleDeletePhoto = async (id: number) => {
    const photo = photos.find(p => p.id === id);
    if (photo) {
      setDeleteConfirmPhoto(photo);
      setIsDeleteDialogOpen(true);
    }
  };

  const confirmDeletePhoto = async () => {
    if (!deleteConfirmPhoto) return;

    try {
      await userPhotoAPI.deletePhoto(deleteConfirmPhoto.id);
      await loadPhotos();
      showToast(t('profile.deleteSuccess') || '照片删除成功', 'success');
    } catch (error: any) {
      console.error('Delete error:', error);
      showToast(
        error.response?.data?.error?.message || t('errors.unknownError'),
        'error'
      );
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteConfirmPhoto(null);
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
    <div className="min-h-screen bg-white py-12">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        <div className="mb-12 flex items-center justify-between border-b border-gray-200 pb-6">
          <h1 className="text-4xl font-light tracking-tight text-gray-900">{t('profile.title')}</h1>
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              if (showAddForm) {
                setUploadedFiles([]);
                setIsSaving(false);
                setSaveProgress(0);
              }
            }}
            disabled={isSaving}
            className="border border-gray-900 bg-gray-900 px-8 py-3 text-xs font-light uppercase tracking-widest text-white transition-all hover:bg-white hover:text-gray-900 disabled:opacity-50"
          >
            {showAddForm ? t('common.cancel') : t('profile.addPhoto')}
          </button>
        </div>

        {showAddForm && (
          <div className="mb-12 border border-gray-200 bg-white p-8">
            <h2 className="mb-8 text-xl font-light tracking-wide text-gray-900">{t('profile.addPhoto')}</h2>
            <div className="space-y-8">
              <ImageUpload
                uploadType="user-photo"
                onUploadMultipleSuccess={handleUploadMultipleSuccess}
                className="mb-4"
                multiple={true}
                maxFiles={20}
              />
              
              {uploadedFiles.length > 0 && (
                <>
                  <div className="border border-gray-200 bg-white p-4">
                    <p className="text-xs font-light tracking-wide text-gray-600">
                      {t('wardrobe.selectedFiles') || '已选择'} {uploadedFiles.length} {t('wardrobe.files') || '个文件'}
                    </p>
                  </div>
                  
                  {isSaving && (
                    <div className="border border-gray-200 bg-white p-6">
                      <ProgressBar
                        progress={saveProgress}
                        label={t('profile.addingPhotos', { current: currentSavingIndex.toString(), total: uploadedFiles.length.toString() }) || `正在保存 ${currentSavingIndex}/${uploadedFiles.length}`}
                        showPercentage={true}
                      />
                    </div>
                  )}
                  
                  <button
                    onClick={handleSavePhotos}
                    disabled={uploadedFiles.length === 0 || isSaving}
                    className="w-full border border-gray-900 bg-gray-900 px-8 py-4 text-xs font-light uppercase tracking-widest text-white transition-all hover:bg-white hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving 
                      ? (t('profile.saving') || '保存中...')
                      : (t('profile.batchAddPhotos') || `批量保存照片 (${uploadedFiles.length})`)
                    }
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {photos.length === 0 ? (
          <div className="border border-gray-200 bg-white p-16 text-center">
            <p className="text-sm font-light tracking-wide text-gray-500">{t('profile.empty')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-px border border-gray-200 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {photos.map((photo) => {
              const imageUrl = photo.photo_url.startsWith('http')
                ? photo.photo_url
                : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001'}${photo.photo_url}`;

              return (
                <div key={photo.id} className="group relative bg-white">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={imageUrl}
                      alt="User photo"
                      className="h-full w-full object-cover transition-opacity group-hover:opacity-90"
                      onError={(e) => {
                        console.error('Image load error:', imageUrl);
                        console.error('Photo data:', photo);
                      }}
                    />
                  </div>
                  {/* 删除按钮 */}
                  <button
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="absolute right-2 top-2 bg-white border border-gray-300 p-2 opacity-0 transition-opacity group-hover:opacity-100"
                    title={t('profile.deletePhoto') || '删除'}
                  >
                    <svg
                      className="h-4 w-4 text-gray-900"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 删除确认对话框 */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title={t('profile.deletePhoto') || '删除照片'}
        message={t('profile.deleteConfirm') || '确定要删除这张照片吗？'}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        onConfirm={confirmDeletePhoto}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setDeleteConfirmPhoto(null);
        }}
        type="danger"
      />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

