import React, { useState } from 'react';
import { db, storage, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { City, CityId } from '../types';
import { X, Upload, Loader2 } from 'lucide-react';
import { compressImage } from '../lib/imageUtils';

interface CityFormProps {
  city?: City;
  onClose: () => void;
  onSuccess: () => void;
}

const CityForm: React.FC<CityFormProps> = ({ city, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cityId: city?.cityId || 'shanghai' as CityId,
    name: city?.name || '',
    description: city?.description || '',
    imageUrl: city?.imageUrl || '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalImageUrl = formData.imageUrl;

      if (imageFile) {
        console.log('Storage config:', (storage as any)._bucket);
        console.log('Starting upload for:', imageFile.name, 'size:', imageFile.size);
        
        const storageRef = ref(storage, `cities/${Date.now()}_${imageFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`);
        const uploadTask = uploadBytesResumable(storageRef, imageFile);

        finalImageUrl = await new Promise((resolve, reject) => {
          // Remove manual timeout to allow Firebase to report its own errors
          // const timeout = setTimeout(() => {
          //   uploadTask.cancel();
          //   reject(new Error('Upload timed out after 60 seconds. Please check your connection or use a smaller file.'));
          // }, 60000); // 60 seconds timeout

          uploadTask.on('state_changed', 
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              console.log('City upload is ' + progress + '% done', 'state:', snapshot.state);
              setUploadProgress(progress);
            }, 
            (error) => {
              // clearTimeout(timeout);
              console.error('City upload failed (full):', error);
              reject(error);
            }, 
            async () => {
              // clearTimeout(timeout);
              console.log('City upload completed successfully');
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            }
          );
        });
      }

      // Create a clean data object without undefined values
      const cleanData: any = {
        imageUrl: finalImageUrl,
        updatedAt: new Date().toISOString(),
      };

      // Only add non-undefined values from formData
      Object.keys(formData).forEach(key => {
        const value = (formData as any)[key];
        if (value !== undefined) {
          cleanData[key] = value;
        }
      });

      if (city) {
        await updateDoc(doc(db, 'cities', city.id), cleanData);
      } else {
        await addDoc(collection(db, 'cities'), {
          ...cleanData,
          createdAt: new Date().toISOString(),
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Submit error:', error);
      handleFirestoreError(error, city ? OperationType.UPDATE : OperationType.CREATE, city ? `cities/${city.id}` : 'cities');
      alert('Có lỗi xảy ra khi lưu thông tin thành phố: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
      setUploadProgress(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-6 border-bottom flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {city ? 'Chỉnh sửa thành phố' : 'Thêm thành phố mới'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mã thành phố (City ID)</label>
            <select
              value={formData.cityId}
              onChange={(e) => setFormData({ ...formData, cityId: e.target.value as CityId })}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              required
            >
              <option value="shanghai">Thượng Hải (Shanghai)</option>
              <option value="hangzhou">Hàng Châu (Hangzhou)</option>
              <option value="wuzhen">Ô Trấn (Wuzhen)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên hiển thị</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              placeholder="VD: Hàng Châu"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none h-24 resize-none"
              placeholder="Mô tả về thành phố..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh bìa</label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all group">
                  <Upload size={20} className="text-gray-400 group-hover:text-blue-500" />
                  <span className="text-sm text-gray-500 group-hover:text-blue-600">
                    {imageFile ? imageFile.name : 'Tải ảnh lên'}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      console.log('Selected file:', file);
                      setImageFile(file);
                    }}
                    className="hidden"
                  />
                </label>
              </div>
              {formData.imageUrl && !imageFile && (
                <div className="relative rounded-xl overflow-hidden h-32">
                  <img src={formData.imageUrl || null} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-medium">Ảnh hiện tại</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  {isCompressing ? 'Đang nén ảnh...' : (uploadProgress !== null ? `Đang tải ${Math.round(uploadProgress)}%` : 'Đang lưu...')}
                </>
              ) : (
                'Lưu thay đổi'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CityForm;
