import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Reminder } from '../types';
import { X, Save } from 'lucide-react';

interface ReminderFormProps {
  reminder: Reminder | null;
  onClose: () => void;
}

export default function ReminderForm({ reminder, onClose }: ReminderFormProps) {
  const [formData, setFormData] = useState({
    text: '',
    link: '',
    detailedGuidance: '',
  });

  useEffect(() => {
    if (reminder) {
      setFormData({
        text: reminder.text,
        link: reminder.link || '',
        detailedGuidance: reminder.detailedGuidance || '',
      });
    }
  }, [reminder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create a clean data object without undefined values
    const cleanData: any = {
      createdAt: reminder?.createdAt || new Date().toISOString(),
    };

    // Only add non-undefined values from formData
    Object.keys(formData).forEach(key => {
      const value = (formData as any)[key];
      if (value !== undefined) {
        cleanData[key] = value;
      }
    });

    try {
      if (reminder) {
        await updateDoc(doc(db, 'reminders', reminder.id), cleanData);
      } else {
        await addDoc(collection(db, 'reminders'), cleanData);
      }
      onClose();
    } catch (error) {
      handleFirestoreError(error, reminder ? OperationType.UPDATE : OperationType.CREATE, 'reminders');
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 md:p-8 border-b border-stone-100 flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-serif italic font-bold">
            {reminder ? 'Chỉnh sửa lời nhắc' : 'Thêm lời nhắc'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 overflow-y-auto">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Tóm tắt ngắn</label>
            <input
              required
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
              placeholder="VD: Tải Alipay"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Liên kết ngoài (Tùy chọn)</label>
            <input
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Hướng dẫn chi tiết (Hỗ trợ Markdown)</label>
            <textarea
              rows={5}
              value={formData.detailedGuidance}
              onChange={(e) => setFormData({ ...formData, detailedGuidance: e.target.value })}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-none"
              placeholder="Cung cấp hướng dẫn từng bước..."
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
              {reminder ? 'Cập nhật' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
