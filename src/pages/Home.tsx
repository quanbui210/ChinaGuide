import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Attraction, Reminder, Category, Hotel, CityId, City } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, MapPin, Utensils, GlassWater, Star, Info, Hotel as HotelIcon, Map as MapIcon, ArrowLeft, ChevronRight, Globe } from 'lucide-react';
import AttractionCard from '../components/AttractionCard';
import HotelCard from '../components/HotelCard';
import LocationMap from '../components/LocationMap';
import ReminderDialog from '../components/ReminderDialog';
import DetailModal from '../components/DetailModal';

const CITIES: { id: CityId; name: string; description: string; image: string }[] = [
  {
    id: 'shanghai',
    name: 'Thượng Hải',
    description: 'Hòn ngọc Viễn Đông hiện đại và sôi động.',
    image: 'https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'hangzhou',
    name: 'Hàng Châu',
    description: 'Thiên đường hạ giới với Tây Hồ thơ mộng.',
    image: 'https://images.unsplash.com/photo-1599571234389-bb3755102489?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'wuzhen',
    name: 'Ô Trấn',
    description: 'Thị trấn nước cổ kính nghìn năm tuổi.',
    image: 'https://images.unsplash.com/photo-1523731407965-2430cd12f5e4?auto=format&fit=crop&w=1200&q=80'
  }
];

function CityCard({ city, idx, onClick }: { city: any, idx: number, onClick: () => void }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.1 }}
      whileHover={{ y: -10 }}
      onClick={onClick}
      className="group relative h-[500px] rounded-[2.5rem] overflow-hidden shadow-2xl text-left w-full"
    >
      <div className={`absolute inset-0 bg-stone-200 animate-pulse transition-opacity duration-500 ${isLoaded ? 'opacity-0' : 'opacity-100'}`} />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-orange-600/20 border-t-orange-600 rounded-full animate-spin" />
        </div>
      )}
      <img 
        src={city.image} 
        alt={city.name} 
        onLoad={() => setIsLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-8 space-y-2">
        <h3 className="text-3xl font-serif italic font-bold text-white">{city.name}</h3>
        <p className="text-stone-300 text-sm line-clamp-2">{city.description}</p>
        <div className="pt-4 flex items-center gap-2 text-orange-400 font-bold text-sm uppercase tracking-widest">
          Khám phá ngay <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </motion.button>
  );
}

export default function Home() {
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<CityId | null>(null);
  const [filter, setFilter] = useState<Category | 'all' | 'signature'>('all');
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [selectedItem, setSelectedItem] = useState<Attraction | Hotel | null>(null);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'attractions'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAttractions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Attraction)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'attractions');
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'reminders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReminders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reminder)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'reminders');
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'hotels'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setHotels(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Hotel)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'hotels');
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'cities'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCities(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as City)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'cities');
    });
    return () => unsubscribe();
  }, []);

  const mergedCities = useMemo(() => {
    return CITIES.map(defaultCity => {
      const dbCity = cities.find(c => c.cityId === defaultCity.id);
      if (dbCity) {
        return {
          ...defaultCity,
          name: dbCity.name,
          description: dbCity.description,
          image: dbCity.imageUrl || defaultCity.image
        };
      }
      return defaultCity;
    });
  }, [cities]);

  const cityAttractions = attractions.filter(a => a.city === selectedCity || (!a.city && selectedCity === 'shanghai'));
  const cityHotels = hotels.filter(h => h.city === selectedCity || (!h.city && selectedCity === 'shanghai'));

  const visitAttractions = cityAttractions.filter(a => a.category === 'visit');
  const foodDrinkAttractions = cityAttractions.filter(a => a.category === 'food' || a.category === 'drink');

  const filteredAttractions = (filter === 'all' 
    ? cityAttractions 
    : filter === 'signature'
      ? cityAttractions.filter(a => a.isSignature)
      : cityAttractions.filter(a => a.category === filter)
  ).sort((a, b) => {
    if (a.isSignature && !b.isSignature) return -1;
    if (!a.isSignature && b.isSignature) return 1;
    return 0;
  });

  const categories: { id: Category | 'all' | 'signature', label: string, icon: any }[] = [
    { id: 'all', label: 'Tất cả', icon: MapPin },
    { id: 'signature', label: 'Biểu tượng', icon: Star },
    { id: 'visit', label: 'Tham quan', icon: MapPin },
    { id: 'food', label: 'Ẩm thực', icon: Utensils },
    { id: 'drink', label: 'Đồ uống', icon: GlassWater },
  ];

  if (!selectedCity) {
    return (
      <div className="space-y-12 py-12">
        <section className="text-center space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-serif italic font-bold tracking-tighter"
          >
            Chọn <span className="text-orange-600">Điểm Đến</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-stone-500 max-w-2xl mx-auto text-lg"
          >
            Khám phá vẻ đẹp của Trung Hoa qua những thành phố biểu tượng.
          </motion.p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          {mergedCities.map((city, idx) => (
            <CityCard 
              key={city.id} 
              city={city} 
              idx={idx} 
              onClick={() => setSelectedCity(city.id)} 
            />
          ))}
        </div>
      </div>
    );
  }

  const currentCity = mergedCities.find(c => c.id === selectedCity);

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="relative py-12">
        <button 
          onClick={() => setSelectedCity(null)}
          className="absolute left-0 top-0 flex items-center gap-2 text-stone-500 hover:text-orange-600 transition-colors font-bold text-sm uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>
        
        <div className="text-center space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-serif italic font-bold tracking-tighter"
          >
            Khám Phá <span className="text-orange-600">{currentCity?.name}</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-stone-500 max-w-2xl mx-auto text-lg"
          >
            {currentCity?.description}
          </motion.p>
        </div>
      </section>

      {/* Filters */}
      <div className="flex flex-wrap justify-center gap-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
              filter === cat.id 
                ? 'bg-stone-900 text-white' 
                : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-400'
            }`}
          >
            <cat.icon className="w-4 h-4" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="space-y-16 p-4 md:p-8 bg-white rounded-3xl shadow-sm border border-stone-100">
        {/* Reminders Section */}
        {reminders.length > 0 && selectedCity === 'shanghai' && (
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
              <CheckCircle2 className="w-6 h-6 text-orange-600" />
              <h2 className="text-2xl font-serif italic font-bold">Danh sách chuẩn bị</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {reminders.map((reminder) => (
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  key={reminder.id} 
                  onClick={() => setSelectedReminder(reminder)}
                  className="flex items-center justify-between gap-3 p-5 bg-stone-50 rounded-2xl border border-stone-100 hover:border-orange-200 hover:bg-white transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-400 shrink-0" />
                    <p className="text-stone-700 font-medium">{reminder.text}</p>
                  </div>
                  <Info className="w-4 h-4 text-stone-300 group-hover:text-orange-500 transition-colors" />
                </motion.button>
              ))}
            </div>
          </section>
        )}

        {/* Hotels Section */}
        {cityHotels.length > 0 && (
          <section className="space-y-8">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-3">
                <HotelIcon className="w-6 h-6 text-orange-600" />
                <h2 className="text-2xl font-serif italic font-bold">Khách sạn gợi ý</h2>
              </div>
              <button 
                onClick={() => setShowMap(true)}
                className="flex items-center gap-2 text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors"
              >
                <MapIcon className="w-4 h-4" />
                Xem trên bản đồ
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cityHotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} onClick={() => setSelectedItem(hotel)} />
              ))}
            </div>
          </section>
        )}

        {/* Dynamic Sections Based on Filter */}
        {filter === 'all' ? (
          <>
            {/* Visit Section */}
            {visitAttractions.length > 0 && (
              <section className="space-y-8">
                <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
                  <MapPin className="w-6 h-6 text-orange-600" />
                  <h2 className="text-2xl font-serif italic font-bold">Địa điểm tham quan</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {visitAttractions.map((attraction) => (
                    <AttractionCard key={attraction.id} attraction={attraction} onClick={() => setSelectedItem(attraction)} />
                  ))}
                </div>
              </section>
            )}

            {/* Food & Drink Section */}
            {foodDrinkAttractions.length > 0 && (
              <section className="space-y-8">
                <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
                  <Utensils className="w-6 h-6 text-orange-600" />
                  <h2 className="text-2xl font-serif italic font-bold">Ẩm thực & Đồ uống</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {foodDrinkAttractions.map((attraction) => (
                    <AttractionCard key={attraction.id} attraction={attraction} onClick={() => setSelectedItem(attraction)} />
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          /* Filtered Grid */
          <section className="space-y-8">
            <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
              {filter === 'signature' ? <Star className="w-6 h-6 text-orange-600" /> :
               filter === 'visit' ? <MapPin className="w-6 h-6 text-orange-600" /> :
               filter === 'food' ? <Utensils className="w-6 h-6 text-orange-600" /> :
               <GlassWater className="w-6 h-6 text-orange-600" />}
              <h2 className="text-2xl font-serif italic font-bold">
                {categories.find(c => c.id === filter)?.label}
              </h2>
            </div>
            {filteredAttractions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                  {filteredAttractions.map((attraction) => (
                    <div key={attraction.id}>
                      <AttractionCard attraction={attraction} onClick={() => setSelectedItem(attraction)} />
                    </div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-20 bg-stone-50 rounded-[2.5rem] border border-dashed border-stone-200">
                <p className="text-stone-400 font-serif italic">Chưa có địa điểm nào được cập nhật cho danh mục này.</p>
              </div>
            )}
          </section>
        )}

        {/* Suggested Day Trips (Cross-promotion) */}
        <section className="pt-12 border-t border-stone-100">
          <div className="bg-stone-900 rounded-[3rem] p-8 md:p-12 text-white overflow-hidden relative">
            <div className="relative z-10 space-y-6 max-w-xl">
              <h2 className="text-3xl md:text-4xl font-serif italic font-bold">Khám phá thêm các thành phố lân cận?</h2>
              <p className="text-stone-400">Từ {currentCity?.name}, bạn có thể dễ dàng di chuyển đến các thành phố tuyệt đẹp khác bằng tàu cao tốc.</p>
              <div className="flex flex-wrap gap-4">
                {mergedCities.filter(c => c.id !== selectedCity).map(city => (
                  <button
                    key={city.id}
                    onClick={() => {
                      setSelectedCity(city.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-full text-sm font-bold hover:bg-white/20 transition-all border border-white/10"
                  >
                    Đến {city.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
              <img 
                src="https://images.unsplash.com/photo-1493934558415-9d19f0b2b4d2?auto=format&fit=crop&w=800&q=80" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </section>
      </div>

      {/* Modals */}
      {selectedReminder && (
        <ReminderDialog 
          reminder={selectedReminder} 
          onClose={() => setSelectedReminder(null)} 
        />
      )}
      <AnimatePresence>
        {showMap && (
          <LocationMap 
            hotels={cityHotels} 
            attractions={cityAttractions}
            onClose={() => setShowMap(false)} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedItem && (
          <DetailModal 
            item={selectedItem} 
            onClose={() => setSelectedItem(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
