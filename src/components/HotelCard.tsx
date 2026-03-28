import { useState } from 'react';
import { Hotel } from '../types';
import { motion } from 'motion/react';
import { MapPin, Wallet, Star } from 'lucide-react';

interface HotelCardProps {
  hotel: Hotel;
  onClick?: () => void;
}

export default function HotelCard({ hotel, onClick }: HotelCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      onClick={onClick}
      className="group bg-white rounded-3xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col cursor-pointer"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
        <div className={`absolute inset-0 bg-stone-200 animate-pulse transition-opacity duration-500 ${isLoaded ? 'opacity-0' : 'opacity-100'}`} />
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-orange-600/20 border-t-orange-600 rounded-full animate-spin" />
          </div>
        )}
        <img 
          src={hotel.imageUrl || `https://picsum.photos/seed/${hotel.name}/800/500`} 
          alt={hotel.name}
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {hotel.isNearCenter && (
            <span className="px-3 py-1 bg-orange-500 text-white rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-orange-200 flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              Gần trung tâm
            </span>
          )}
        </div>
      </div>

      <div className="p-6 space-y-4 flex-1 flex flex-col">
        <div className="space-y-1">
          <h3 className="text-xl font-serif italic font-bold tracking-tight group-hover:text-orange-600 transition-colors line-clamp-1">
            {hotel.name}
          </h3>
          <p className="text-sm text-stone-500 line-clamp-2 leading-relaxed h-10">
            {hotel.description}
          </p>
        </div>

        <div className="pt-4 border-t border-stone-50 mt-auto space-y-2">
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <Wallet className="w-3.5 h-3.5 text-orange-400" />
            <span className="font-medium text-stone-600">{hotel.price}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <MapPin className="w-3.5 h-3.5 text-orange-400" />
            <span className="font-medium text-stone-600">{hotel.location}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
