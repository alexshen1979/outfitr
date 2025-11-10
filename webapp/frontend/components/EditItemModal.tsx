'use client';

import { useState, useEffect } from 'react';
import { WardrobeItem } from '@/lib/api';
import ImageUpload from '@/components/ImageUpload';
import { useI18n } from '@/lib/i18n';

interface EditItemModalProps {
  item: WardrobeItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, data: {
    name?: string;
    image_url?: string;
    category?: string;
    season?: string;
    style?: string;
  }) => Promise<void>;
}

export default function EditItemModal({ item, isOpen, onClose, onSave }: EditItemModalProps) {
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    season: '',
    style: '',
  });
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [newImageUploaded, setNewImageUploaded] = useState(false);

  useEffect(() => {
    if (item && isOpen) {
      setFormData({
        name: item.name || '',
        category: item.category || '',
        season: item.season || '',
        style: item.style || '',
      });
      if (item.image_url && item.image_url.trim() !== '') {
        const fullImageUrl = item.image_url.startsWith('http')
          ? item.image_url
          : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001'}${item.image_url}`;
        setImageUrl(fullImageUrl);
      } else {
        setImageUrl('');
      }
      setNewImageUploaded(false);
    }
  }, [item, isOpen]);

  const handleImageUploadSuccess = (url: string, filename?: string) => {
    // url 已经是相对路径（如 /uploads/wardrobe/xxx.png）
    // 需要构建完整URL用于预览
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001';
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
    setImageUrl(fullUrl);
    setNewImageUploaded(true);
  };

  const handleSave = async () => {
    if (!item) return;

    setIsSaving(true);
    try {
      const updateData: any = {
        name: formData.name || undefined,
        category: formData.category || undefined,
        season: formData.season || undefined,
        style: formData.style || undefined,
      };

      // 如果上传了新图片，添加图片URL
      if (newImageUploaded) {
        // imageUrl是完整URL，需要提取相对路径
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001';
        const relativeUrl = imageUrl.startsWith(baseUrl) 
          ? imageUrl.replace(baseUrl, '')
          : imageUrl.startsWith('http')
            ? imageUrl  // 如果是外部URL，直接使用
            : imageUrl; // 如果已经是相对路径，直接使用
        updateData.image_url = relativeUrl;
      }

      await onSave(item.id, updateData);
      onClose();
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !item) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-200 bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-8 py-6 flex-shrink-0">
          <h2 className="text-xl font-light tracking-wide text-gray-900">{t('wardrobe.editItem')}</h2>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="p-2 text-gray-400 transition-colors hover:text-gray-900 disabled:opacity-50"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-8 py-8 overflow-y-auto flex-1">
          <div className="space-y-8">
            {/* 图片预览和上传 */}
            <div>
              <label className="block text-xs font-light uppercase tracking-widest text-gray-500 mb-4">
                {t('wardrobe.image')}
              </label>
              <div className="relative border border-gray-200 overflow-hidden">
                {imageUrl && imageUrl.trim() !== '' && (
                  <img
                    src={imageUrl}
                    alt={formData.name || t('wardrobe.untitled')}
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    style={{ zIndex: 0 }}
                  />
                )}
                <div className="relative" style={{ zIndex: 1 }}>
                  <div className={imageUrl && imageUrl.trim() !== '' ? '[&_div>div]:!bg-transparent [&_div>div]:!border-gray-400/50 [&_div>div]:hover:!border-gray-600 [&_p]:!text-gray-700 [&_p]:!text-opacity-90 [&_button]:!border-gray-600 [&_button]:!text-gray-700 [&_button]:hover:!bg-gray-100 [&_button]:hover:!text-gray-900 [&_svg]:!text-gray-600' : ''}>
                    <ImageUpload
                      uploadType="wardrobe"
                      onUploadSuccess={handleImageUploadSuccess}
                      multiple={false}
                    />
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs font-light tracking-wide text-gray-500">
                {t('wardrobe.changeImageHint') || '上传新图片以替换当前图片'}
              </p>
            </div>

            {/* 名称 */}
            <div>
              <label htmlFor="edit-name" className="block text-xs font-light uppercase tracking-widest text-gray-500 mb-3">
                {t('wardrobe.itemName')}
              </label>
              <input
                id="edit-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isSaving}
                className="w-full border-b border-gray-300 bg-transparent px-0 py-3 text-sm font-light text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                placeholder={t('wardrobe.itemNamePlaceholder') || '物品名称（可选）'}
              />
            </div>

            {/* 分类、季节、风格 */}
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label htmlFor="edit-category" className="block text-xs font-light uppercase tracking-widest text-gray-500 mb-3">
                  {t('wardrobe.category')}
                </label>
                <input
                  id="edit-category"
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  disabled={isSaving}
                  className="w-full border-b border-gray-300 bg-transparent px-0 py-3 text-sm font-light text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  placeholder={t('wardrobe.category')}
                />
              </div>
              <div>
                <label htmlFor="edit-season" className="block text-xs font-light uppercase tracking-widest text-gray-500 mb-3">
                  {t('wardrobe.season')}
                </label>
                <input
                  id="edit-season"
                  type="text"
                  value={formData.season}
                  onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                  disabled={isSaving}
                  className="w-full border-b border-gray-300 bg-transparent px-0 py-3 text-sm font-light text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  placeholder={t('wardrobe.season')}
                />
              </div>
              <div>
                <label htmlFor="edit-style" className="block text-xs font-light uppercase tracking-widest text-gray-500 mb-3">
                  {t('wardrobe.style')}
                </label>
                <input
                  id="edit-style"
                  type="text"
                  value={formData.style}
                  onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                  disabled={isSaving}
                  className="w-full border-b border-gray-300 bg-transparent px-0 py-3 text-sm font-light text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  placeholder={t('wardrobe.style')}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 border-t border-gray-200 px-8 py-6 flex-shrink-0">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="border border-gray-300 bg-white px-8 py-3 text-xs font-light uppercase tracking-widest text-gray-900 transition-all hover:border-gray-900 disabled:opacity-50"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="border border-gray-900 bg-gray-900 px-8 py-3 text-xs font-light uppercase tracking-widest text-white transition-all hover:bg-white hover:text-gray-900 disabled:opacity-50"
          >
            {isSaving ? t('common.saving') || '保存中...' : t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
}

