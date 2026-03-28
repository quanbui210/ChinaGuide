import { Attraction, Hotel } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, Clock, Wallet, Star, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { useState } from 'react';

interface DetailModalProps {
  item: Attraction | Hotel;
  onClose: () => void;
}

export default function DetailModal({ item, onClose }: DetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const isHotel = 'location' in item;
  
  const images = (item.galleryImages && item.galleryImages.filter(img => !!img).length > 0)
    ? item.galleryImages.filter(img => !!img)
    : [item.imageUrl || `https://picsum.photos/seed/${item.name}/1200/800`].filter(img => !!img);

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-stone-900/60 backdrop-blur-md z-[150] flex items-center justify-center p-4 md:p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: Image Gallery */}
        <div className="relative w-full md:w-1/2 h-64 md:h-auto bg-stone-100 overflow-hidden group">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImageIndex}
              src={images[currentImageIndex]}
              alt={item.name}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </AnimatePresence>
          
          {images.length > 1 && (
            <>
              <button 
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all ${i === currentImageIndex ? 'w-8 bg-white' : 'w-1.5 bg-white/40'}`} 
                  />
                ))}
              </div>
            </>
          )}
          
          <button 
            onClick={onClose}
            className="absolute top-6 left-6 p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all md:hidden"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Right: Content */}
        <div className="flex-1 p-8 md:p-12 overflow-y-auto space-y-8">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  {isHotel ? 'Khách sạn' : (item as Attraction).category}
                </span>
                {'isSignature' in item && item.isSignature && (
                  <span className="px-3 py-1 bg-stone-900 text-white rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                    <Star className="w-3 h-3 fill-orange-400 text-orange-400" />
                    Biểu tượng
                  </span>
                )}
              </div>
              <h2 className="text-4xl md:text-5xl font-serif italic font-bold tracking-tight text-stone-900">
                {item.name}
              </h2>
            </div>
            <button 
              onClick={onClose}
              className="hidden md:flex p-3 hover:bg-stone-100 rounded-full transition-colors text-stone-400"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-stone-50 rounded-3xl border border-stone-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                <Wallet className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Giá cả</p>
                <p className="font-bold text-stone-900">{item.price || 'Miễn phí'}</p>
              </div>
            </div>
            <div className="p-4 bg-stone-50 rounded-3xl border border-stone-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                {isHotel ? <MapPin className="w-5 h-5 text-orange-500" /> : <Clock className="w-5 h-5 text-orange-500" />}
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  {isHotel ? 'Khu vực' : 'Giờ mở cửa'}
                </p>
                <p className="font-bold text-stone-900">
                  {isHotel ? (item as Hotel).location : (item as Attraction).hours || 'Luôn mở cửa'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-stone-900">
              <Info className="w-5 h-5 text-orange-500" />
              <h3 className="font-bold uppercase tracking-widest text-xs">
                {(!isHotel && ((item as Attraction).category === 'food' || (item as Attraction).category === 'drink')) 
                  ? 'Món nên thử & Thông tin' 
                  : 'Thông tin chi tiết'}
              </h3>
            </div>
            <div className="prose prose-stone max-w-none">
              <p className="text-stone-600 leading-relaxed whitespace-pre-line text-lg">
                {item.longDescription || item.description}
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-stone-100">
            <button 
              onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name)}`, '_blank')}
              className="w-full py-4 bg-stone-900 text-white rounded-full font-bold hover:bg-stone-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-stone-200"
            >
              <MapPin className="w-5 h-5" />
              Xem đường đi trên Google Maps
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
