'use client';

import { useState, useRef, useCallback } from 'react';
import { uploadAPI } from '@/lib/api';
import { useI18n } from '@/lib/i18n';

interface ImageUploadProps {
  onUploadSuccess?: (url: string, filename: string) => void;
  onUploadMultipleSuccess?: (files: Array<{ url: string; filename: string }>) => void;
  onUploadError?: (error: string) => void;
  uploadType?: 'wardrobe' | 'avatar' | 'user-photo' | 'outfit-result';
  maxSize?: number; // in bytes
  className?: string;
  multiple?: boolean; // 是否支持多选
  maxFiles?: number; // 最多选择文件数
}

export default function ImageUpload({
  onUploadSuccess,
  onUploadMultipleSuccess,
  onUploadError,
  uploadType = 'wardrobe',
  maxSize = 10 * 1024 * 1024, // 10MB default
  className = '',
  multiple = false,
  maxFiles = 20,
}: ImageUploadProps) {
  const { t } = useI18n();
  const [previews, setPreviews] = useState<Array<{ url: string; file: File }>>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // 验证文件
  const validateFile = (file: File): string | null => {
    // 检查文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return t('upload.invalidFileType');
    }

    // 检查文件大小
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0);
      return t('upload.fileTooLarge', { size: maxSizeMB });
    }

    return null;
  };

  // 创建预览
  const createPreviews = async (files: File[]) => {
    const previewPromises = files.map(file => {
      return new Promise<{ url: string; file: File }>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            url: reader.result as string,
            file,
          });
        };
        reader.readAsDataURL(file);
      });
    });

    const newPreviews = await Promise.all(previewPromises);
    // 清空之前的预览，设置新的预览（与衣柜页面保持一致）
    setPreviews(newPreviews);
  };

  // 上传单个文件
  const uploadSingleFile = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        if (onUploadError) {
          onUploadError(validationError);
        }
        return;
      }

      setError(null);
      setUploading(true);
      setProgress(0);

      try {
        const response = await uploadAPI.uploadSingle(file, uploadType);
        if (response.success) {
          const { url, filename } = response.data;
          const fullUrl = `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001'}${url}`;
          // 设置预览
          setPreviews([{ url: fullUrl, file }]);
          // 调用成功回调
          if (onUploadSuccess) {
            onUploadSuccess(url, filename);
          }
        }
      } catch (err: any) {
        setPreviews([]);
        const errorMessage =
          err.response?.data?.error?.message || t('upload.uploadFailed');
        setError(errorMessage);
        if (onUploadError) {
          onUploadError(errorMessage);
        }
      } finally {
        setUploading(false);
        setProgress(0);
      }
    },
    [uploadType, maxSize, onUploadSuccess, onUploadError, t]
  );

  // 上传多个文件
  const uploadMultipleFiles = useCallback(
    async (files: File[]) => {
      // 验证所有文件
      const validFiles: File[] = [];
      const errors: string[] = [];

      files.forEach(file => {
        const validationError = validateFile(file);
        if (validationError) {
          errors.push(`${file.name}: ${validationError}`);
        } else {
          validFiles.push(file);
        }
      });

      if (errors.length > 0) {
        setError(errors.join('; '));
        if (onUploadError) {
          onUploadError(errors.join('; '));
        }
      }

      if (validFiles.length === 0) {
        return;
      }

      setError(null);
      setUploading(true);
      setProgress(0);

      // 注意：预览应该在文件选择时已经创建，这里只负责上传

      try {
        const response = await uploadAPI.uploadMultiple(validFiles, uploadType);
        if (response.success) {
          const uploadedFiles = response.data.files.map(f => ({
            url: `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001'}${f.url}`,
            filename: f.filename,
          }));
          
          // 直接更新预览为服务器URL（预览数量应该与上传文件数量一致）
          setPreviews(uploadedFiles.map((f, i) => ({
            url: f.url,
            file: validFiles[i],
          })));

          if (onUploadMultipleSuccess) {
            onUploadMultipleSuccess(response.data.files.map(f => ({
              url: f.url,
              filename: f.filename,
            })));
          }
        }
      } catch (err: any) {
        // 上传失败时不清除预览，让用户可以看到选择的文件
        const errorMessage =
          err.response?.data?.error?.message || t('upload.uploadFailed');
        setError(errorMessage);
        if (onUploadError) {
          onUploadError(errorMessage);
        }
      } finally {
        setUploading(false);
        setProgress(0);
      }
    },
    [uploadType, maxSize, onUploadMultipleSuccess, onUploadError, t]
  );

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (multiple) {
      // 限制文件数量
      if (files.length > maxFiles) {
        setError(t('wardrobe.maxFilesExceeded', { max: maxFiles.toString() }) || `最多只能选择${maxFiles}个文件`);
        return;
      }
      // 立即创建预览，然后上传
      createPreviews(files).then(() => {
        uploadMultipleFiles(files);
      });
    } else {
      // 单文件：立即创建预览，然后上传
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews([{ url: reader.result as string, file }]);
        uploadSingleFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  // 处理点击上传
  const handleClick = (e: React.MouseEvent) => {
    // 不要阻止默认行为，只阻止事件冒泡
    e.stopPropagation();
    
    // 检查是否正在上传
    if (uploading) {
      return;
    }
    
    // 确保文件输入元素存在
    if (fileInputRef.current) {
      // 重置文件输入的值，允许重新选择相同的文件
      fileInputRef.current.value = '';
      // 触发点击事件
      fileInputRef.current.click();
    } else {
      console.error('File input ref is not available');
    }
  };

  // 处理拖拽
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files || []);
    if (files.length === 0) return;

    if (multiple) {
      if (files.length > maxFiles) {
        setError(t('wardrobe.maxFilesExceeded', { max: maxFiles.toString() }) || `最多只能选择${maxFiles}个文件`);
        return;
      }
      // 立即创建预览，然后上传
      createPreviews(files).then(() => {
        uploadMultipleFiles(files);
      });
    } else {
      // 单文件：立即创建预览，然后上传
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews([{ url: reader.result as string, file }]);
        uploadSingleFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  // 清除预览
  const clearPreview = (index?: number) => {
    if (index !== undefined) {
      setPreviews(prev => prev.filter((_, i) => i !== index));
    } else {
      setPreviews([]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      {previews.length === 0 ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          className={`
            relative flex cursor-pointer flex-col items-center justify-center border-2 border-dashed p-12 transition-colors
            ${
              isDragging
                ? 'border-gray-900 bg-gray-50'
                : 'border-gray-300 bg-white hover:border-gray-900'
            }
            ${uploading ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
            multiple={multiple}
            style={{ display: 'none' }}
          />

          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="mb-4 h-8 w-8 animate-spin border-2 border-gray-200 border-t-gray-900"></div>
              <p className="text-xs font-light tracking-wide text-gray-500">{t('upload.uploading')} {progress}%</p>
            </div>
          ) : (
            <>
              <svg
                className="mb-4 h-10 w-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="mb-2 text-xs font-light uppercase tracking-widest text-gray-600">
                {t('upload.clickToUpload')}
              </p>
              <p className="mb-4 text-xs font-light tracking-wide text-gray-400">
                {t('upload.fileTypes')}
                {multiple && ` (${t('wardrobe.multipleFiles') || '支持多选'})`}
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation(); // 只阻止事件冒泡，不阻止默认行为
                  if (!uploading && fileInputRef.current) {
                    fileInputRef.current.value = '';
                    fileInputRef.current.click();
                  }
                }}
                className="border border-gray-300 bg-white px-6 py-2 text-xs font-light uppercase tracking-widest text-gray-900 transition-all hover:border-gray-900"
                disabled={uploading}
              >
                {t('upload.selectFiles') || '选择文件'}
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className={`grid grid-cols-2 gap-px border border-gray-200 sm:grid-cols-3 md:grid-cols-4 ${multiple ? '' : 'grid-cols-1'}`}>
            {previews.map((preview, index) => (
              <div key={index} className="relative bg-white">
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={preview.url}
                    alt={`Preview ${index + 1}`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      console.error('Preview image load error:', preview.url);
                      console.error('Preview data:', preview);
                    }}
                  />
                </div>
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
                    <div className="text-center">
                      <div className="mb-2 h-6 w-6 animate-spin border-2 border-gray-200 border-t-gray-900 mx-auto"></div>
                      <p className="text-xs font-light tracking-wide text-gray-500">{t('upload.uploading')}</p>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => clearPreview(index)}
                  className="absolute right-2 top-2 bg-white border border-gray-300 p-1.5 text-gray-900 transition-colors hover:border-gray-900"
                  type="button"
                  disabled={uploading}
                >
                  <svg
                    className="h-3 w-3"
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
            ))}
          </div>
          {multiple && (
            <button
              onClick={(e) => {
                e.stopPropagation(); // 只阻止事件冒泡，不阻止默认行为
                if (!uploading && fileInputRef.current) {
                  fileInputRef.current.value = ''; // 重置文件输入，允许重新选择相同文件
                  fileInputRef.current.click();
                }
              }}
              type="button"
              className="w-full border border-gray-300 bg-white px-6 py-3 text-xs font-light uppercase tracking-widest text-gray-900 transition-all hover:border-gray-900"
              disabled={uploading}
            >
              {t('wardrobe.addMoreImages') || '添加更多图片'}
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 border border-gray-300 bg-white p-4">
          <p className="text-xs font-light tracking-wide text-gray-900">{error}</p>
        </div>
      )}
    </div>
  );
}
