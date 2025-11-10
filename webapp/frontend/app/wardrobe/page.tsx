'use client';

import { useState, useEffect } from 'react';
import { wardrobeAPI, WardrobeItem } from '@/lib/api';
import ImageUpload from '@/components/ImageUpload';
import { useAuthStore } from '@/store/auth.store';
import { useI18n } from '@/lib/i18n';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useToast } from '@/components/Toast';
import ProgressBar from '@/components/ProgressBar';
import EditItemModal from '@/components/EditItemModal';
import ConfirmDialog from '@/components/ConfirmDialog';

function WardrobeContent() {
  const { initialize } = useAuthStore();
  const { t } = useI18n();
  const { showToast } = useToast();
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ url: string; filename: string }>>([]);
  const [commonFields, setCommonFields] = useState({
    category: '',
    season: '',
    style: '',
  });
  const [isAdding, setIsAdding] = useState(false);
  const [addProgress, setAddProgress] = useState(0);
  const [currentAddingIndex, setCurrentAddingIndex] = useState(0);
  const [editingItem, setEditingItem] = useState<WardrobeItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<WardrobeItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    initialize();
    loadItems();
  }, [initialize]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await wardrobeAPI.getItems();
      setItems(response.data);
    } catch (error) {
      console.error('Failed to load wardrobe items:', error);
      showToast(t('errors.unknownError'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadMultipleSuccess = (files: Array<{ url: string; filename: string }>) => {
    setUploadedFiles(files);
  };

  const handleBatchAddItems = async () => {
    if (uploadedFiles.length === 0) {
      showToast(t('wardrobe.uploadImageFirst'), 'warning');
      return;
    }

    setIsAdding(true);
    setAddProgress(0);
    setCurrentAddingIndex(0);

    try {
      const total = uploadedFiles.length;
      let successCount = 0;
      let failCount = 0;

      // 逐个添加，显示进度
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        setCurrentAddingIndex(i + 1);
        
        try {
          await wardrobeAPI.createItem({
            image_url: file.url,
            category: commonFields.category || undefined,
            season: commonFields.season || undefined,
            style: commonFields.style || undefined,
          });
          successCount++;
        } catch (error: any) {
          console.error(`Failed to add item ${i + 1}:`, error);
          failCount++;
        }

        // 更新进度
        const progress = ((i + 1) / total) * 100;
        setAddProgress(progress);
      }

      // 重置表单
      setShowAddForm(false);
      setUploadedFiles([]);
      setCommonFields({ category: '', season: '', style: '' });
      
      // 重新加载列表
      await loadItems();

      // 显示成功消息
      if (successCount > 0) {
        if (failCount > 0) {
          showToast(
            t('wardrobe.batchAddPartial', { success: successCount.toString(), total: total.toString() }) || 
            `成功添加 ${successCount}/${total} 个物品`,
            'warning'
          );
        } else {
          showToast(
            t('wardrobe.batchAddSuccess', { count: successCount.toString() }) || 
            `成功添加 ${successCount} 个物品`,
            'success'
          );
        }
      } else {
        showToast(t('wardrobe.batchAddFailed') || '添加失败', 'error');
      }
    } catch (error: any) {
      console.error('Batch add error:', error);
      showToast(
        error.response?.data?.error?.message || t('errors.unknownError'),
        'error'
      );
    } finally {
      setIsAdding(false);
      setAddProgress(0);
      setCurrentAddingIndex(0);
    }
  };

  const handleEditItem = (item: WardrobeItem) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  const handleSaveItem = async (id: number, data: {
    name?: string;
    image_url?: string;
    category?: string;
    season?: string;
    style?: string;
  }) => {
    try {
      await wardrobeAPI.updateItem(id, data);
      await loadItems();
      showToast(t('wardrobe.updateSuccess') || '更新成功', 'success');
    } catch (error: any) {
      console.error('Update error:', error);
      showToast(
        error.response?.data?.error?.message || t('errors.unknownError'),
        'error'
      );
      throw error;
    }
  };

  const handleDeleteItem = async (id: number) => {
    const item = items.find(i => i.id === id);
    if (item) {
      setDeleteConfirmItem(item);
      setIsDeleteDialogOpen(true);
    }
  };

  const confirmDeleteItem = async () => {
    if (!deleteConfirmItem) return;
    
    try {
      await wardrobeAPI.deleteItem(deleteConfirmItem.id);
      await loadItems();
      showToast(t('wardrobe.deleteSuccess') || '删除成功', 'success');
    } catch (error: any) {
      console.error('Delete error:', error);
      showToast(
        error.response?.data?.error?.message || t('errors.unknownError'),
        'error'
      );
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteConfirmItem(null);
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
          <h1 className="text-4xl font-light tracking-tight text-gray-900">{t('wardrobe.title')}</h1>
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              if (showAddForm) {
                setUploadedFiles([]);
                setCommonFields({ category: '', season: '', style: '' });
                setIsAdding(false);
                setAddProgress(0);
              }
            }}
            disabled={isAdding}
            className="border border-gray-900 bg-gray-900 px-8 py-3 text-xs font-light uppercase tracking-widest text-white transition-all hover:bg-white hover:text-gray-900 disabled:opacity-50"
          >
            {showAddForm ? t('common.cancel') : t('wardrobe.addItem')}
          </button>
        </div>

        {showAddForm && (
          <div className="mb-12 border border-gray-200 bg-white p-8">
            <h2 className="mb-8 text-xl font-light tracking-wide text-gray-900">{t('wardrobe.addItem')}</h2>
            <div className="space-y-8">
              <ImageUpload
                uploadType="wardrobe"
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
                  
                  {isAdding && (
                    <div className="border border-gray-200 bg-white p-6">
                      <ProgressBar
                        progress={addProgress}
                        label={t('wardrobe.addingItems', { current: currentAddingIndex.toString(), total: uploadedFiles.length.toString() }) || `正在添加 ${currentAddingIndex}/${uploadedFiles.length}`}
                        showPercentage={true}
                      />
                    </div>
                  )}
                  
                  <div className="grid grid-cols-3 gap-6">
                    <input
                      type="text"
                      placeholder={t('wardrobe.category')}
                      value={commonFields.category}
                      onChange={(e) => setCommonFields({ ...commonFields, category: e.target.value })}
                      disabled={isAdding}
                      className="border-b border-gray-300 bg-transparent px-0 py-3 text-sm font-light text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    />
                    <input
                      type="text"
                      placeholder={t('wardrobe.season')}
                      value={commonFields.season}
                      onChange={(e) => setCommonFields({ ...commonFields, season: e.target.value })}
                      disabled={isAdding}
                      className="border-b border-gray-300 bg-transparent px-0 py-3 text-sm font-light text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    />
                    <input
                      type="text"
                      placeholder={t('wardrobe.style')}
                      value={commonFields.style}
                      onChange={(e) => setCommonFields({ ...commonFields, style: e.target.value })}
                      disabled={isAdding}
                      className="border-b border-gray-300 bg-transparent px-0 py-3 text-sm font-light text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    />
                  </div>
                  
                  <p className="text-xs font-light tracking-wide text-gray-500">
                    {t('wardrobe.commonFieldsHint') || '以上信息将应用到所有选中的图片'}
                  </p>
                  
                  <button
                    onClick={handleBatchAddItems}
                    disabled={uploadedFiles.length === 0 || isAdding}
                    className="w-full border border-gray-900 bg-gray-900 px-8 py-4 text-xs font-light uppercase tracking-widest text-white transition-all hover:bg-white hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAdding 
                      ? (t('wardrobe.adding') || '添加中...')
                      : (t('wardrobe.batchAddToWardrobe') || `批量添加到衣柜 (${uploadedFiles.length})`)
                    }
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <div className="border border-gray-200 bg-white p-16 text-center">
            <p className="text-sm font-light tracking-wide text-gray-500">{t('wardrobe.empty')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-px border border-gray-200 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {items.map((item) => {
              const imageUrl = item.image_url.startsWith('http')
                ? item.image_url
                : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001'}${item.image_url}`;

              return (
                <div key={item.id} className="group relative bg-white">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={item.name || t('wardrobe.untitled')}
                      className="h-full w-full object-cover transition-opacity group-hover:opacity-90"
                    />
                  </div>
                  <div className="border-t border-gray-200 p-4">
                    <p className="truncate text-xs font-light text-gray-900">
                      {item.name || t('wardrobe.untitled')}
                    </p>
                    {item.category && (
                      <p className="mt-1 text-xs font-light text-gray-500">{item.category}</p>
                    )}
                  </div>
                  {/* 编辑按钮 */}
                  <button
                    onClick={() => handleEditItem(item)}
                    className="absolute left-2 top-2 bg-white border border-gray-300 p-2 opacity-0 transition-opacity group-hover:opacity-100"
                    title={t('wardrobe.editItem') || '编辑'}
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  {/* 删除按钮 */}
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="absolute right-2 top-2 bg-white border border-gray-300 p-2 opacity-0 transition-opacity group-hover:opacity-100"
                    title={t('wardrobe.deleteItem') || '删除'}
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

      {/* 编辑模态框 */}
      <EditItemModal
        item={editingItem}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
      />

      {/* 删除确认对话框 */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title={t('wardrobe.deleteItem') || '删除物品'}
        message={t('wardrobe.deleteConfirm') || '确定要删除这个物品吗？'}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        onConfirm={confirmDeleteItem}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setDeleteConfirmItem(null);
        }}
        type="danger"
      />
    </div>
  );
}

export default function WardrobePage() {
  return (
    <ProtectedRoute>
      <WardrobeContent />
    </ProtectedRoute>
  );
}

