import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage, handleFirestoreError, OperationType } from '../lib/firebase';
import { Attraction, Category } from '../types';
import { X, Save, Image as ImageIcon, Upload, Loader2, Sparkles } from 'lucide-react';
import { generateLocationDetails } from '../lib/gemini';
import { compressImage } from '../lib/imageUtils';

interface AdminFormProps {
  attraction: Attraction | null;
  onClose: () => void;
}

export default function AdminForm({ attraction, onClose }: AdminFormProps) {
  const [formData, setFormData] = useState<Partial<Attraction>>({
    name: '',
    description: '',
    price: '',
    hours: '',
    imageUrl: '',
    category: 'visit',
    city: 'shanghai',
    isSignature: false,
    latitude: 31.2304,
    longitude: 121.4737,
    longDescription: '',
    galleryImages: [],
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [galleryUrlInput, setGalleryUrlInput] = useState('');
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);

  useEffect(() => {
    if (attraction) {
      setFormData(prev => ({ ...prev, ...attraction }));
    }
  }, [attraction]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    console.log('Storage config:', (storage as any)._bucket);
    console.log('Starting image upload for file:', file.name, 'size:', file.size);
    try {
      const storageRef = ref(storage, `attractions/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      const downloadURL = await new Promise<string>((resolve, reject) => {
        // Remove manual timeout to allow Firebase to report its own errors
        // const timeout = setTimeout(() => {
        //   uploadTask.cancel();
        //   reject(new Error('Upload timed out after 60 seconds. Please check your connection or try a smaller file.'));
        // }, 60000);

        uploadTask.on('state_changed', 
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done', 'state:', snapshot.state);
          }, 
          (error) => {
            // clearTimeout(timeout);
            console.error('Firebase Storage upload error (full):', error);
            reject(error);
          }, 
          async () => {
            // clearTimeout(timeout);
            console.log('Upload completed successfully');
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(url);
          }
        );
      });
      
      setFormData({ ...formData, imageUrl: downloadURL });
    } catch (error) {
      console.error('Error in handleImageUpload:', error);
      alert('Không thể tải ảnh lên. Lỗi: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingGallery(true);
    console.log('Starting gallery image upload for file:', file.name, 'size:', file.size);
    try {
      const storageRef = ref(storage, `attractions/gallery/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      const downloadURL = await new Promise<string>((resolve, reject) => {
        // Remove manual timeout to allow Firebase to report its own errors
        // const timeout = setTimeout(() => {
        //   uploadTask.cancel();
        //   reject(new Error('Upload timed out after 60 seconds.'));
        // }, 60000);

        uploadTask.on('state_changed', 
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Gallery upload is ' + progress + '% done', 'state:', snapshot.state);
          }, 
          (error) => {
            // clearTimeout(timeout);
            console.error('Firebase Storage gallery upload error (full):', error);
            reject(error);
          }, 
          async () => {
            // clearTimeout(timeout);
            console.log('Gallery upload completed successfully');
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(url);
          }
        );
      });
      
      setFormData(prev => ({
        ...prev,
        galleryImages: [...(prev.galleryImages || []), downloadURL]
      }));
    } catch (error) {
      console.error('Error in handleGalleryImageUpload:', error);
      alert('Không thể tải ảnh gallery lên. Lỗi: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsUploadingGallery(false);
    }
  };

  const handleAddGalleryUrl = () => {
    if (!galleryUrlInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      galleryImages: [...(prev.galleryImages || []), galleryUrlInput.trim()]
    }));
    setGalleryUrlInput('');
  };

  const handleAIGenerate = async () => {
    if (!formData.name) {
      alert('Vui lòng nhập tên địa điểm trước!');
      return;
    }

    setIsGenerating(true);
    try {
      const details = await generateLocationDetails(formData.name, 'attraction', formData.city || 'shanghai');
      setFormData(prev => ({
        ...prev,
        description: details.description || prev.description,
        longDescription: details.longDescription || prev.longDescription,
        galleryImages: details.galleryImages || prev.galleryImages,
        hours: details.hours || prev.hours,
        price: details.price || prev.price,
        imageUrl: details.galleryImages?.[0] || prev.imageUrl,
      }));
    } catch (error) {
      console.error('Error generating with AI:', error);
      alert('Lỗi khi tạo nội dung bằng AI. Vui lòng thử lại.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create a clean data object without undefined values
    const cleanData: any = {
      createdAt: attraction?.createdAt || new Date().toISOString(),
    };

    // Only add non-undefined values from formData
    Object.keys(formData).forEach(key => {
      const value = (formData as any)[key];
      if (value !== undefined) {
        cleanData[key] = value;
      }
    });

    try {
      if (attraction) {
        await updateDoc(doc(db, 'attractions', attraction.id), cleanData);
      } else {
        await addDoc(collection(db, 'attractions'), cleanData);
      }
      onClose();
    } catch (error) {
      handleFirestoreError(error, attraction ? OperationType.UPDATE : OperationType.CREATE, 'attractions');
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-serif italic font-bold">
              {attraction ? 'Chỉnh sửa địa điểm' : 'Thêm địa điểm mới'}
            </h2>
            <button
              type="button"
              onClick={handleAIGenerate}
              disabled={isGenerating || !formData.name}
              className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-600 rounded-full text-sm font-bold hover:bg-orange-200 transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Tạo bằng AI
            </button>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Tên</label>
              <input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                placeholder="VD: Bến Thượng Hải"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Danh mục</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
              >
                <option value="visit">Tham quan</option>
                <option value="food">Ẩm thực</option>
                <option value="drink">Đồ uống</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Thành phố</label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value as any })}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
              >
                <option value="shanghai">Thượng Hải (Shanghai)</option>
                <option value="hangzhou">Hàng Châu (Hangzhou)</option>
                <option value="wuzhen">Ô Trấn (Wuzhen)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-2xl border border-orange-100">
            <input
              type="checkbox"
              id="isSignature"
              checked={formData.isSignature}
              onChange={(e) => setFormData({ ...formData, isSignature: e.target.checked })}
              className="w-5 h-5 rounded border-orange-300 text-orange-600 focus:ring-orange-500"
            />
            <label htmlFor="isSignature" className="text-sm font-bold text-orange-900 cursor-pointer">
              Đánh dấu là địa điểm Biểu tượng (Signature)
            </label>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Mô tả ngắn</label>
            <textarea
              required
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-none"
              placeholder="Mô tả ngắn gọn về địa điểm này..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Mô tả chi tiết (AI generated)</label>
            <textarea
              rows={5}
              value={formData.longDescription}
              onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-none"
              placeholder="Mô tả chi tiết sẽ xuất hiện khi người dùng nhấn vào thẻ..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Thông tin giá</label>
              <input
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                placeholder="VD: Miễn phí hoặc ~180 CNY"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Giờ mở cửa</label>
              <input
                value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                placeholder="VD: 09:00 - 21:00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Vĩ độ (Latitude)</label>
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                name="latitude"
                value={formData.latitude ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || /^-?\d*\.?\d*$/.test(val)) {
                    setFormData({ ...formData, latitude: val === '' ? undefined : parseFloat(val) });
                  }
                }}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                placeholder="31.2304"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Kinh độ (Longitude)</label>
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                name="longitude"
                value={formData.longitude ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || /^-?\d*\.?\d*$/.test(val)) {
                    setFormData({ ...formData, longitude: val === '' ? undefined : parseFloat(val) });
                  }
                }}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                placeholder="121.4737"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Hình ảnh</label>
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <input
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                    placeholder="Dán URL hình ảnh tại đây..."
                  />
                  <ImageIcon className="w-5 h-5 text-stone-300 absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
                
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="image-upload"
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl border border-stone-100 bg-stone-50 text-stone-600 font-medium cursor-pointer hover:bg-stone-100 transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isUploading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Upload className="w-5 h-5" />
                    )}
                    Tải lên từ máy
                  </label>
                </div>
              </div>

              {formData.imageUrl && (
                <div className="relative w-32 h-32 rounded-2xl overflow-hidden border border-stone-100">
                  <img src={formData.imageUrl || null} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <button 
                    type="button"
                    onClick={() => setFormData({ ...formData, imageUrl: '' })}
                    className="absolute top-1 right-1 p-1 bg-white/80 backdrop-blur-sm rounded-full text-stone-500 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="space-y-4 pt-4 border-t border-stone-100">
                <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Bộ sưu tập ảnh</label>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <input
                      value={galleryUrlInput}
                      onChange={(e) => setGalleryUrlInput(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                      placeholder="Dán URL ảnh bộ sưu tập..."
                    />
                    <ImageIcon className="w-5 h-5 text-stone-300 absolute left-4 top-1/2 -translate-y-1/2" />
                    <button
                      type="button"
                      onClick={handleAddGalleryUrl}
                      disabled={!galleryUrlInput.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-stone-900 text-white text-xs font-bold rounded-xl hover:bg-stone-800 transition-all disabled:opacity-50"
                    >
                      Thêm
                    </button>
                  </div>
                  
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleGalleryImageUpload}
                      className="hidden"
                      id="gallery-upload"
                      disabled={isUploadingGallery}
                    />
                    <label
                      htmlFor="gallery-upload"
                      className={`flex items-center gap-2 px-6 py-3 rounded-2xl border border-stone-100 bg-stone-50 text-stone-600 font-medium cursor-pointer hover:bg-stone-100 transition-all ${isUploadingGallery ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isUploadingGallery ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Upload className="w-5 h-5" />
                      )}
                      Tải lên
                    </label>
                  </div>
                </div>

                {formData.galleryImages && formData.galleryImages.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.galleryImages.map((url, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-stone-100 group">
                        <img src={url || null} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <button 
                          type="button"
                          onClick={() => setFormData({ 
                            ...formData, 
                            galleryImages: formData.galleryImages?.filter((_, i) => i !== idx) 
                          })}
                          className="absolute top-1 right-1 p-1 bg-white/80 backdrop-blur-sm rounded-full text-stone-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-8 py-4 bg-stone-100 text-stone-600 rounded-full font-medium hover:bg-stone-200 transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-8 py-4 bg-stone-900 text-white rounded-full font-medium hover:bg-stone-800 transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {attraction ? 'Cập nhật' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
