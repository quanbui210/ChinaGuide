import React from 'react';
import { Reminder } from '../types';
import { X, ExternalLink, Info } from 'lucide-react';
import Markdown from 'react-markdown';

interface ReminderDialogProps {
  reminder: Reminder;
  onClose: () => void;
}

export default function ReminderDialog({ reminder, onClose }: ReminderDialogProps) {
  return (
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 md:p-8 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-xl text-orange-600">
              <Info className="w-5 h-5" />
            </div>
            <h2 className="text-xl md:text-2xl font-serif italic font-bold tracking-tight">
              Hướng dẫn
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-full transition-colors">
            <X className="w-6 h-6 text-stone-500" />
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-6 overflow-y-auto">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-stone-900">{reminder.text}</h3>
            <div className="h-1 w-12 bg-orange-500 rounded-full" />
          </div>

          {reminder.detailedGuidance ? (
            <div className="prose prose-stone max-w-none">
              <div className="text-stone-600 leading-relaxed whitespace-pre-wrap">
                <Markdown>{reminder.detailedGuidance}</Markdown>
              </div>
            </div>
          ) : (
            <p className="text-stone-500 italic">Không có hướng dẫn chi tiết cho mục này.</p>
          )}

          {reminder.link && (
            <div className="pt-4">
              <a
                href={reminder.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-stone-900 text-white rounded-full font-medium hover:bg-stone-800 transition-all group"
              >
                Xem tài liệu
                <ExternalLink className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </a>
            </div>
          )}
        </div>

        <div className="p-6 bg-stone-50 border-t border-stone-100">
          <button
            onClick={onClose}
            className="w-full py-3 text-stone-500 font-medium hover:text-stone-900 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
