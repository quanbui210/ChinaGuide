import { motion, AnimatePresence } from 'motion/react';
import { X, Facebook, Instagram, Phone, Mail, MessageCircle } from 'lucide-react';
import { useState } from 'react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [isImageFullSize, setIsImageFullSize] = useState(false);
  const avatarUrl = "https://yktlmsllixuijqnqlsny.supabase.co/storage/v1/object/public/shanghaifood/nhi.jpg";

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden relative p-8 text-center space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="space-y-4">
                <button 
                  onClick={() => setIsImageFullSize(true)}
                  className="w-24 h-24 bg-stone-100 rounded-full mx-auto flex items-center justify-center border-4 border-white shadow-lg overflow-hidden hover:scale-105 transition-transform cursor-zoom-in"
                >
                  <img 
                    src={avatarUrl} 
                    alt="Hoàng Phương Nhi"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </button>
                <div className="space-y-1">
                  <h2 className="text-2xl font-serif italic font-bold text-stone-900">Hoàng Phương Nhi</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-4">
                <a 
                  href="tel:0866569207" 
                  className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-100 hover:bg-stone-100 transition-colors group"
                >
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Phone className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Điện thoại</p>
                    <p className="font-bold text-stone-900">0866569207</p>
                  </div>
                </a>

                <a 
                  href="mailto:p.nhi551974@gmail.com" 
                  className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-100 hover:bg-stone-100 transition-colors group"
                >
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Mail className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Email</p>
                    <p className="font-bold text-stone-900">p.nhi551974@gmail.com</p>
                  </div>
                </a>

                <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-100 group">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Zalo</p>
                    <p className="font-bold text-stone-900">0866569207</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-4 pt-4">
                <a 
                  href="https://www.facebook.com/phuongnhi.hoang.34" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-3 bg-stone-900 text-white rounded-2xl hover:bg-stone-800 transition-all shadow-lg shadow-stone-200"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a 
                  href="https://www.instagram.com/huafnger?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-3 bg-stone-900 text-white rounded-2xl hover:bg-stone-800 transition-all shadow-lg shadow-stone-200"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isImageFullSize && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-950/90 backdrop-blur-xl z-[300] flex items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setIsImageFullSize(false)}
          >
            <motion.button
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-8 right-8 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              onClick={() => setIsImageFullSize(false)}
            >
              <X className="w-8 h-8" />
            </motion.button>
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              src={avatarUrl}
              alt="Hoàng Phương Nhi Full Size"
              className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain"
              onClick={(e) => e.stopPropagation()}
              referrerPolicy="no-referrer"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
