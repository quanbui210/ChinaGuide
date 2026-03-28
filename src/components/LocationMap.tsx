import GoogleMapReact from 'google-map-react';
import { Hotel, Attraction } from '../types';
import { MapPin, Hotel as HotelIcon, X, Utensils, GlassWater, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

interface LocationMapProps {
  hotels: Hotel[];
  attractions: Attraction[];
  onClose: () => void;
}

type MapItem = (Hotel | Attraction) & { type: 'hotel' | 'attraction' };

const Marker = ({ item, onClick }: { item: MapItem; onClick: () => void; lat: number; lng: number }) => {
  const getIcon = () => {
    if (item.type === 'hotel') return <HotelIcon className="w-4 h-4" />;
    const attraction = item as Attraction;
    if (attraction.category === 'food') return <Utensils className="w-4 h-4" />;
    if (attraction.category === 'drink') return <GlassWater className="w-4 h-4" />;
    return <MapPin className="w-4 h-4" />;
  };

  const isSignature = item.type === 'attraction' && (item as Attraction).isSignature;

  return (
    <div 
      className={`absolute -translate-x-1/2 -translate-y-full cursor-pointer group hover:z-50 ${isSignature ? 'z-20' : 'z-10'}`}
      style={{ width: '40px', height: '48px' }}
      onClick={onClick}
    >
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 flex items-center justify-center rounded-full shadow-2xl border-2 border-white transition-all duration-300 group-hover:scale-125 ${
          item.type === 'hotel' ? 'bg-orange-600' : isSignature ? 'bg-amber-500' : 'bg-stone-800'
        } text-white`}>
          {getIcon()}
        </div>
        <div className={`w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] -mt-1 shadow-sm ${
          item.type === 'hotel' ? 'border-t-orange-600' : isSignature ? 'border-t-amber-500' : 'border-t-stone-800'
        }`} />
      </div>
    </div>
  );
};

export default function LocationMap({ hotels, attractions, onClose }: LocationMapProps) {
  const [selectedItem, setSelectedItem] = useState<MapItem | null>(null);

  const items: MapItem[] = [
    ...hotels
      .filter(h => typeof h.latitude === 'number' && !isNaN(h.latitude) && typeof h.longitude === 'number' && !isNaN(h.longitude))
      .map(h => ({ ...h, type: 'hotel' as const })),
    ...attractions
      .filter(a => typeof a.latitude === 'number' && !isNaN(a.latitude) && typeof a.longitude === 'number' && !isNaN(a.longitude))
      .map(a => ({ ...a, type: 'attraction' as const }))
  ];

  const defaultProps = {
    center: {
      lat: 31.2304,
      lng: 121.4737
    },
    zoom: 13
  };

  const apiKey = (import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY || '';

  return (
    <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-6xl h-[80vh] rounded-[2.5rem] overflow-hidden relative shadow-2xl border border-stone-100">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-3 bg-white/90 backdrop-blur shadow-lg rounded-2xl hover:bg-white transition-all border border-stone-200"
        >
          <X className="w-6 h-6 text-stone-900" />
        </button>

        <div className="absolute top-6 left-6 z-10 bg-white/90 backdrop-blur p-4 rounded-2xl shadow-lg border border-stone-200 max-w-xs">
          <h2 className="text-xl font-serif italic font-bold text-stone-900">Bản đồ du lịch</h2>
          <p className="text-xs font-bold uppercase tracking-widest text-stone-400">Khám phá các địa điểm</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-tighter">
              <div className="w-2 h-2 rounded-full bg-orange-600" /> Khách sạn
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-tighter">
              <div className="w-2 h-2 rounded-full bg-amber-500" /> Biểu tượng
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-tighter">
              <div className="w-2 h-2 rounded-full bg-stone-800" /> Tham quan
            </div>
          </div>
        </div>

        <div className="w-full h-full">
          {apiKey ? (
            <GoogleMapReact
              bootstrapURLKeys={{ key: apiKey }}
              defaultCenter={defaultProps.center}
              defaultZoom={defaultProps.zoom}
              options={{
                styles: [
                  { "featureType": "administrative", "elementType": "all", "stylers": [{ "saturation": "-100" }] },
                  { "featureType": "landscape", "elementType": "all", "stylers": [{ "saturation": -100 }, { "lightness": 65 }, { "visibility": "on" }] },
                  { "featureType": "poi", "elementType": "all", "stylers": [{ "saturation": -100 }, { "lightness": "50" }, { "visibility": "simplified" }] },
                  { "featureType": "road", "elementType": "all", "stylers": [{ "saturation": "-100" }] },
                  { "featureType": "transit", "elementType": "all", "stylers": [{ "saturation": "-100" }] },
                  { "featureType": "water", "elementType": "all", "stylers": [{ "visibility": "on" }, { "lightness": 30 }, { "saturation": -100 }] }
                ]
              }}
            >
              {items.map((item) => (
                <Marker
                  key={`${item.type}-${item.id}`}
                  lat={item.latitude!}
                  lng={item.longitude!}
                  item={item}
                  onClick={() => setSelectedItem(item)}
                />
              ))}
            </GoogleMapReact>
          ) : (
            <div className="w-full h-full bg-stone-100 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-[2rem] flex items-center justify-center mb-6">
                <MapPin className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-2xl font-serif italic font-bold text-stone-900 mb-2">Chưa cấu hình Google Maps</h3>
              <p className="text-stone-500 max-w-md mb-8">
                Vui lòng thêm <code>VITE_GOOGLE_MAPS_API_KEY</code> vào cài đặt môi trường để hiển thị bản đồ.
              </p>
            </div>
          )}
        </div>

        <AnimatePresence>
          {selectedItem && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-4"
            >
              <div className="bg-white rounded-3xl shadow-2xl border border-stone-100 overflow-hidden flex">
                <img 
                  src={selectedItem.imageUrl || `https://picsum.photos/seed/${selectedItem.name}/100/100`} 
                  className="w-32 h-32 object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="p-4 flex-1 relative">
                  <button 
                    onClick={() => setSelectedItem(null)}
                    className="absolute top-2 right-2 p-1 text-stone-400 hover:text-stone-900"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-stone-900 line-clamp-1">{selectedItem.name}</h3>
                    {selectedItem.type === 'attraction' && (selectedItem as Attraction).isSignature && (
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-stone-500 line-clamp-2 mb-2">{selectedItem.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-orange-600">{selectedItem.price}</span>
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${selectedItem.latitude},${selectedItem.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors"
                    >
                      Mở trong Google Maps
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
