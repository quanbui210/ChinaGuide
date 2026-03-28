import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Tour } from '../types';
import { X, Save, Calendar, Users, Wallet, Map } from 'lucide-react';

interface TourFormProps {
  tour: Tour | null;
  onClose: () => void;
}

export default function TourForm({ tour, onClose }: TourFormProps) {
  const [formData, setFormData] = useState<Partial<Tour>>({
    clientName: '',
    date: '',
    price: '',
    guests: 1,
    planRoute: '',
    status: 'scheduled',
    notes: '',
  });

  useEffect(() => {
    if (tour) {
      setFormData(tour);
    }
  }, [tour]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create a clean data object without undefined values
    const cleanData: any = {
      createdAt: tour?.createdAt || new Date().toISOString(),
    };

    // Only add non-undefined values from formData
    Object.keys(formData).forEach(key => {
      const value = (formData as any)[key];
      if (value !== undefined) {
        cleanData[key] = value;
      }
    });

    try {
      if (tour) {
        await updateDoc(doc(db, 'tours', tour.id), cleanData);
      } else {
        await addDoc(collection(db, 'tours'), cleanData);
      }
      onClose();
    } catch (error) {
      handleFirestoreError(error, tour ? OperationType.UPDATE : OperationType.CREATE, 'tours');
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 md:p-8 border-b border-stone-100 flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-serif italic font-bold">
            {tour ? 'Chỉnh sửa Tour' : 'Tạo Tour mới'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Tên khách hàng</label>
              <input
                required
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                placeholder="VD: Nguyễn Văn A"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Ngày (VD: 20/03 - 25/03)</label>
              <div className="relative">
                <input
                  required
                  type="text"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  placeholder="20/03 - 25/03"
                />
                <Calendar className="w-5 h-5 text-stone-300 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Giá</label>
              <div className="relative">
                <input
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  placeholder="VD: 500 CNY"
                />
                <Wallet className="w-5 h-5 text-stone-300 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Số lượng khách</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  value={formData.guests}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setFormData({ ...formData, guests: isNaN(val) ? 1 : val });
                  }}
                  className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                />
                <Users className="w-5 h-5 text-stone-300 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Kế hoạch & Lộ trình</label>
            <div className="relative">
              <textarea
                rows={3}
                value={formData.planRoute}
                onChange={(e) => setFormData({ ...formData, planRoute: e.target.value })}
                className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-none"
                placeholder="Mô tả lộ trình..."
              />
              <Map className="w-5 h-5 text-stone-300 absolute left-4 top-4" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Trạng thái</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
            >
              <option value="scheduled">Đã lên lịch</option>
              <option value="completed">Đã hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Ghi chú nội bộ</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-none"
              placeholder="Ghi chú riêng về khách hàng..."
            />
          </div>

          <div className="pt-4 flex flex-col md:flex-row gap-4">
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
              {tour ? 'Cập nhật Tour' : 'Tạo Tour'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
