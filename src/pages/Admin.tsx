import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, addDoc, setDoc, where, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Attraction, Reminder, UserProfile, Tour, Hotel, City, CityId } from '../types';
import { Navigate } from 'react-router-dom';
import { Plus, Trash2, Edit2, LayoutDashboard, MapPin, BellRing, CalendarDays, Users, ShieldCheck, Hotel as HotelIcon, Globe, ChevronDown, ChevronUp, FileDown, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { TourPDF } from '../components/TourPDF';
import AdminForm from '../components/AdminForm';
import ReminderForm from '../components/ReminderForm';
import TourForm from '../components/TourForm';
import HotelForm from '../components/HotelForm';
import CityForm from '../components/CityForm';

interface AdminProps {
  userProfile: UserProfile | null;
}

interface TourCardProps {
  tour: Tour;
  attractions: Attraction[];
  hotels: Hotel[];
  onEdit: (tour: Tour) => void;
  onDelete: (id: string) => void;
}

interface ActionMenuProps {
  onEdit: () => void;
  onDelete: () => void;
  deleteLabel?: string;
}

function ActionMenu({ onEdit, onDelete, deleteLabel = "Xóa" }: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className="p-2 text-stone-400 hover:text-stone-900 transition-colors rounded-full hover:bg-stone-100"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 5 }}
              className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-stone-100 py-1.5 z-20"
            >
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit(); setIsOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-stone-600 hover:bg-stone-50 transition-colors text-left"
              >
                <Edit2 className="w-3.5 h-3.5 text-orange-500" />
                Chỉnh sửa
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(); setIsOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors text-left"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {deleteLabel}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function TourCard({ tour, attractions, hotels, onEdit, onDelete }: TourCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const getLocationName = (id?: string) => {
    if (!id) return null;
    return attractions.find(a => a.id === id)?.name;
  };

  const getHotelName = () => {
    if (tour.hotelId) {
      return hotels.find(h => h.id === tour.hotelId)?.name;
    }
    return tour.customHotel;
  };

  const hotelName = getHotelName();
  const hasItinerary = tour.itinerary && tour.itinerary.length > 0;

  return (
    <div className="p-6 bg-white rounded-[2.5rem] border border-stone-100 shadow-sm space-y-6 group relative hover:border-orange-200 transition-all">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-stone-900">{tour.clientName}</h3>
          <div className="flex flex-wrap items-center gap-3 text-[10px] text-stone-400 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {tour.date}</span>
            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {tour.guests} Khách</span>
            {hotelName && (
              <span className="flex items-center gap-1 text-orange-600">
                <HotelIcon className="w-3 h-3" /> {hotelName}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[9px] font-bold uppercase px-2.5 py-1 rounded-full whitespace-nowrap ${
            tour.status === 'scheduled' ? 'bg-blue-50 text-blue-600' : 
            tour.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}>
            {tour.status === 'scheduled' ? 'Đã lên lịch' : 
             tour.status === 'completed' ? 'Đã hoàn thành' : 'Đã hủy'}
          </span>
          <div className="relative">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="p-2 text-stone-400 hover:text-stone-900 transition-colors rounded-full hover:bg-stone-100"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            <AnimatePresence>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-stone-100 py-2 z-20"
                  >
                    <PDFDownloadLink
                      document={<TourPDF tour={tour} attractions={attractions} hotels={hotels} />}
                      fileName={`Lich_Trinh_Tour_${tour.clientName || 'Khach'}.pdf`}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50 transition-colors"
                      onClick={() => setShowMenu(false)}
                    >
                      <FileDown className="w-4 h-4 text-orange-500" />
                      Xuất PDF
                    </PDFDownloadLink>
                    <button 
                      onClick={() => { onEdit(tour); setShowMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50 transition-colors text-left"
                    >
                      <Edit2 className="w-4 h-4 text-orange-500" />
                      Chỉnh sửa
                    </button>
                    <div className="h-px bg-stone-50 my-1 mx-2" />
                    <button 
                      onClick={() => { onDelete(tour.id); setShowMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <Trash2 className="w-4 h-4" />
                      Xóa Tour
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {hasItinerary ? (
        <div className="space-y-4">
          <div 
            onClick={() => setIsExpanded(!isExpanded)}
            className={`space-y-4 cursor-pointer transition-all ${!isExpanded ? 'max-h-48 overflow-hidden relative' : ''}`}
          >
            {tour.itinerary?.map((day, dIdx) => (
              <div key={dIdx} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-stone-900 text-white text-[10px] font-bold rounded-lg flex items-center justify-center">
                    {day.dayNumber}
                  </span>
                  <span className="text-xs font-bold text-stone-900">{day.title || `Ngày ${day.dayNumber}`}</span>
                </div>
                <div className="ml-3 pl-5 border-l border-stone-100 space-y-4">
                  {day.items.map((item, iIdx) => (
                    <div key={iIdx} className="relative space-y-1">
                      <div className="absolute -left-[25px] top-1 w-2 h-2 rounded-full bg-stone-200 border-2 border-white" />
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold uppercase text-stone-400 w-10">{item.timeBlock}</span>
                        <span className="text-[11px] font-bold text-stone-800">
                          {getLocationName(item.locationId) || item.customLocation}
                        </span>
                      </div>
                      {item.details && (
                        <p className="text-[10px] text-stone-500 ml-12 leading-relaxed">{item.details}</p>
                      )}
                      {item.subItems && item.subItems.length > 0 && (
                        <div className="ml-12 flex flex-wrap gap-2 pt-1">
                          {item.subItems.map((sub, sIdx) => (
                            <span key={sIdx} className="text-[9px] bg-stone-50 text-stone-400 px-2 py-0.5 rounded-md border border-stone-100">
                              {sub}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {!isExpanded && (
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none" />
            )}
          </div>
          
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-widest text-orange-600 hover:text-orange-700 transition-colors py-2 bg-stone-50 rounded-2xl border border-stone-100/50"
          >
            {isExpanded ? (
              <>Thu gọn <ChevronUp className="w-3 h-3" /></>
            ) : (
              <>Xem lịch trình chi tiết <ChevronDown className="w-3 h-3" /></>
            )}
          </button>
        </div>
      ) : tour.planRoute ? (
        <div className="space-y-2">
          <div 
            onClick={() => setIsExpanded(!isExpanded)}
            className={`text-xs text-stone-600 bg-stone-50/50 p-4 rounded-2xl border border-stone-100/50 transition-all cursor-pointer hover:bg-stone-50 ${!isExpanded ? 'line-clamp-4' : ''}`}
          >
            <p className="font-bold text-[9px] uppercase tracking-widest text-stone-400 mb-2">Lịch trình dự kiến</p>
            <div className="whitespace-pre-wrap leading-relaxed">
              {tour.planRoute}
            </div>
          </div>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-widest text-orange-600 hover:text-orange-700 transition-colors py-1"
          >
            {isExpanded ? (
              <>Thu gọn <ChevronUp className="w-3 h-3" /></>
            ) : (
              <>Xem chi tiết <ChevronDown className="w-3 h-3" /></>
            )}
          </button>
        </div>
      ) : null}

      {tour.notes && (
        <div className="pt-2 border-t border-stone-50">
          <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-1">Ghi chú nội bộ</p>
          <p className="text-[11px] text-stone-500 italic">{tour.notes}</p>
        </div>
      )}
    </div>
  );
}

export default function Admin({ userProfile }: AdminProps) {
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [editingAttraction, setEditingAttraction] = useState<Attraction | null>(null);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [showAttractionForm, setShowAttractionForm] = useState(false);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [showTourForm, setShowTourForm] = useState(false);
  const [showHotelForm, setShowHotelForm] = useState(false);
  const [showCityForm, setShowCityForm] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [activeTab, setActiveTab] = useState<'locations' | 'reminders' | 'tours' | 'cities'>('locations');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<CityId | 'all'>('all');
  const [showAddDropdown, setShowAddDropdown] = useState(false);

  if (!userProfile || userProfile.role !== 'admin') {
    return <Navigate to="/admin-auth" />;
  }

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
    const q = query(collection(db, 'tours'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTours(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tour)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'tours');
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
      console.log('Cities snapshot received:', snapshot.size, 'docs');
      setCities(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as City)));
    }, (error) => {
      console.error('Cities snapshot error:', error);
      handleFirestoreError(error, OperationType.GET, 'cities');
    });
    return () => unsubscribe();
  }, []);

  const handleDeleteAttraction = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'attractions', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `attractions/${id}`);
    }
  };

  const handleDeleteReminder = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'reminders', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `reminders/${id}`);
    }
  };

  const handleDeleteTour = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tours', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `tours/${id}`);
    }
  };

  const handleDeleteHotel = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'hotels', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `hotels/${id}`);
    }
  };

  const handleDeleteCity = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'cities', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `cities/${id}`);
    }
  };

  const filteredAttractions = attractions.filter(a => {
    const matchesCategory = categoryFilter === 'all' || a.category === categoryFilter;
    const matchesCity = cityFilter === 'all' || a.city === cityFilter;
    return matchesCategory && matchesCity;
  });

  const filteredHotels = hotels.filter(h => {
    return cityFilter === 'all' || h.city === cityFilter;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-8 border-b border-stone-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-orange-600">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Bảng Quản Trị</span>
          </div>
          <h1 className="text-4xl font-serif italic font-bold text-stone-900">Bảng điều khiển</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={() => setShowAddDropdown(!showAddDropdown)}
              className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-full text-sm font-bold hover:bg-stone-800 transition-all shadow-xl shadow-stone-200"
            >
              <Plus className="w-4 h-4" />
              Thêm mới
            </button>

            {showAddDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowAddDropdown(false)} />
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-3xl shadow-2xl border border-stone-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <button 
                    onClick={() => { setShowAttractionForm(true); setEditingAttraction(null); setShowAddDropdown(false); }}
                    className="w-full flex items-center gap-3 px-5 py-3 text-sm text-stone-700 hover:bg-stone-50 transition-colors text-left"
                  >
                    <MapPin className="w-4 h-4 text-orange-500" />
                    Địa điểm
                  </button>
                  <button 
                    onClick={() => { setShowHotelForm(true); setEditingHotel(null); setShowAddDropdown(false); }}
                    className="w-full flex items-center gap-3 px-5 py-3 text-sm text-stone-700 hover:bg-stone-50 transition-colors text-left"
                  >
                    <HotelIcon className="w-4 h-4 text-orange-500" />
                    Khách sạn
                  </button>
                  <button 
                    onClick={() => { setShowReminderForm(true); setEditingReminder(null); setShowAddDropdown(false); }}
                    className="w-full flex items-center gap-3 px-5 py-3 text-sm text-stone-700 hover:bg-stone-50 transition-colors text-left"
                  >
                    <BellRing className="w-4 h-4 text-orange-500" />
                    Lời nhắc
                  </button>
                  <button 
                    onClick={() => { setShowCityForm(true); setEditingCity(null); setShowAddDropdown(false); }}
                    className="w-full flex items-center gap-3 px-5 py-3 text-sm text-stone-700 hover:bg-stone-50 transition-colors text-left"
                  >
                    <Globe className="w-4 h-4 text-orange-500" />
                    Thành phố
                  </button>
                  <div className="h-px bg-stone-100 my-2 mx-4" />
                  <button 
                    onClick={() => { setShowTourForm(true); setEditingTour(null); setShowAddDropdown(false); }}
                    className="w-full flex items-center gap-3 px-5 py-3 text-sm text-orange-600 hover:bg-orange-50 transition-colors text-left font-bold"
                  >
                    <CalendarDays className="w-4 h-4" />
                    Tạo Tour mới
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Navigation Tabs */}
      <div className="overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        <nav className="flex items-center gap-1 p-1 bg-stone-100 rounded-2xl w-max sm:w-fit min-w-full sm:min-w-0">
          {[
            { id: 'locations', label: 'Địa điểm & Khách sạn', icon: MapPin },
            { id: 'reminders', label: 'Lời nhắc', icon: BellRing },
            { id: 'tours', label: 'Quản lý Tour', icon: CalendarDays },
            { id: 'cities', label: 'Thành phố', icon: Globe },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-white text-stone-900 shadow-sm' 
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5 sm:w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="pt-4">
        {activeTab === 'locations' && (
          <div className="space-y-10">
            {/* City Sub-tabs */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                <button
                  onClick={() => setCityFilter('all')}
                  className={`px-6 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.1em] transition-all whitespace-nowrap border-2 ${
                    cityFilter === 'all' 
                      ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-100' 
                      : 'bg-white border-stone-100 text-stone-500 hover:border-stone-200'
                  }`}
                >
                  Tất cả thành phố
                </button>
                {cities.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => setCityFilter(city.cityId)}
                    className={`px-6 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.1em] transition-all whitespace-nowrap border-2 ${
                      cityFilter === city.cityId 
                        ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-100' 
                        : 'bg-white border-stone-100 text-stone-500 hover:border-stone-200'
                    }`}
                  >
                    {city.name}
                  </button>
                ))}
              </div>

              {cityFilter !== 'all' && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 whitespace-nowrap">Lọc danh mục:</span>
                  {['all', 'visit', 'food', 'drink', 'shopping'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                        categoryFilter === cat 
                          ? 'bg-stone-900 text-white shadow-md' 
                          : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                      }`}
                    >
                      {cat === 'all' ? 'Tất cả' : cat === 'visit' ? 'Tham quan' : cat === 'food' ? 'Ăn uống' : cat === 'drink' ? 'Đồ uống' : 'Mua sắm'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-16">
              {cities.filter(c => cityFilter === 'all' || c.cityId === cityFilter).map(city => {
                const cityAttractions = filteredAttractions.filter(a => a.city === city.cityId);
                const cityHotels = filteredHotels.filter(h => h.city === city.cityId);
                
                if (cityAttractions.length === 0 && cityHotels.length === 0 && cityFilter === 'all') return null;

                return (
                  <div key={city.id} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-lg flex-shrink-0">
                        <img src={city.imageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="space-y-1">
                        <h2 className="text-3xl font-serif italic font-bold text-stone-900">{city.name}</h2>
                        <p className="text-xs text-stone-400 font-medium uppercase tracking-widest">
                          {cityAttractions.length} địa điểm • {cityHotels.length} khách sạn
                        </p>
                      </div>
                      <div className="h-px flex-1 bg-stone-100" />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                      {/* City Attractions */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Địa điểm tham quan & Ăn uống</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          {cityAttractions.map((attraction) => (
                            <div key={attraction.id} className="flex items-center justify-between p-3 bg-white rounded-2xl border border-stone-100 shadow-sm group hover:border-orange-200 transition-all">
                              <div className="flex items-center gap-4">
                                <img src={attraction.imageUrl || `https://picsum.photos/seed/${attraction.name}/100/100`} className="w-12 h-12 rounded-xl object-cover" referrerPolicy="no-referrer" />
                                <div>
                                  <h4 className="text-sm font-bold text-stone-900">{attraction.name}</h4>
                                  <div className="flex items-center gap-2">
                                    <p className="text-[9px] text-stone-500 uppercase tracking-wider font-bold">{attraction.category}</p>
                                    {attraction.isSignature && <span className="text-[8px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-bold uppercase">Đặc trưng</span>}
                                  </div>
                                </div>
                              </div>
                              <ActionMenu 
                                onEdit={() => { setEditingAttraction(attraction); setShowAttractionForm(true); }}
                                onDelete={() => handleDeleteAttraction(attraction.id)}
                              />
                            </div>
                          ))}
                          {cityAttractions.length === 0 && (
                            <div className="py-8 text-center bg-stone-50/50 rounded-2xl border border-dashed border-stone-200">
                              <p className="text-xs text-stone-400 italic">Không tìm thấy địa điểm nào</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* City Hotels */}
                      <div className="space-y-4">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Khách sạn & Lưu trú</h3>
                        <div className="grid grid-cols-1 gap-3">
                          {cityHotels.map((hotel) => (
                            <div key={hotel.id} className="flex items-center justify-between p-3 bg-white rounded-2xl border border-stone-100 shadow-sm group hover:border-orange-200 transition-all">
                              <div className="flex items-center gap-4">
                                <img src={hotel.imageUrl || `https://picsum.photos/seed/${hotel.name}/100/100`} className="w-12 h-12 rounded-xl object-cover" referrerPolicy="no-referrer" />
                                <div>
                                  <h4 className="text-sm font-bold text-stone-900">{hotel.name}</h4>
                                  <div className="flex items-center gap-2">
                                    <p className="text-[9px] text-stone-500 uppercase tracking-wider font-bold">{hotel.location}</p>
                                    {hotel.isNearCenter && <span className="text-[8px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-bold uppercase">Gần trung tâm</span>}
                                  </div>
                                </div>
                              </div>
                              <ActionMenu 
                                onEdit={() => { setEditingHotel(hotel); setShowHotelForm(true); }}
                                onDelete={() => handleDeleteHotel(hotel.id)}
                              />
                            </div>
                          ))}
                          {cityHotels.length === 0 && (
                            <div className="py-8 text-center bg-stone-50/50 rounded-2xl border border-dashed border-stone-200">
                              <p className="text-xs text-stone-400 italic">Chưa có khách sạn nào</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Uncategorized Section - Only for Hotels */}
              {cityFilter === 'all' && cities.length > 0 && filteredHotels.some(h => !cities.some(c => c.cityId === h.city)) && (
                <div className="space-y-8 pt-12 border-t border-stone-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center flex-shrink-0">
                      <Globe className="w-8 h-8 text-stone-400" />
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-3xl font-serif italic font-bold text-stone-900">Khách sạn chưa phân loại</h2>
                      <p className="text-xs text-stone-400 font-medium uppercase tracking-widest">
                        Khách sạn chưa được gán thành phố
                      </p>
                    </div>
                    <div className="h-px flex-1 bg-stone-100" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredHotels.filter(h => !cities.some(c => c.cityId === h.city)).map((hotel) => (
                      <div key={hotel.id} className="flex items-center justify-between p-3 bg-white rounded-2xl border border-stone-100 shadow-sm group hover:border-orange-200 transition-all">
                        <div className="flex items-center gap-4">
                          <img src={hotel.imageUrl || `https://picsum.photos/seed/${hotel.name}/100/100`} className="w-12 h-12 rounded-xl object-cover" referrerPolicy="no-referrer" />
                          <div>
                            <h4 className="text-sm font-bold text-stone-900">{hotel.name}</h4>
                            <p className="text-[9px] text-stone-500 uppercase tracking-wider font-bold">{hotel.location}</p>
                          </div>
                        </div>
                        <ActionMenu 
                          onEdit={() => { setEditingHotel(hotel); setShowHotelForm(true); }}
                          onDelete={() => handleDeleteHotel(hotel.id)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'reminders' && (
          <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 text-stone-400">
              <BellRing className="w-5 h-5" />
              <h2 className="text-lg font-bold uppercase tracking-widest text-stone-900">Quản lý Lời nhắc</h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {reminders.map((reminder) => (
                <div key={reminder.id} className="p-6 bg-white rounded-3xl border border-stone-100 shadow-sm group relative hover:border-orange-200 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-stone-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <BellRing className="w-5 h-5 text-stone-400" />
                    </div>
                    <div className="space-y-1 pr-20">
                      <p className="text-stone-700 leading-relaxed">{reminder.text}</p>
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{reminder.category}</span>
                    </div>
                  </div>
                  <div className="absolute top-6 right-6">
                    <ActionMenu 
                      onEdit={() => { setEditingReminder(reminder); setShowReminderForm(true); }}
                      onDelete={() => handleDeleteReminder(reminder.id)}
                    />
                  </div>
                </div>
              ))}
              {reminders.length === 0 && (
                <div className="py-12 text-center bg-stone-50 rounded-[2.5rem] border border-dashed border-stone-200">
                  <p className="text-stone-400 italic">Chưa có lời nhắc nào</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'tours' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 text-stone-400">
              <CalendarDays className="w-5 h-5" />
              <h2 className="text-lg font-bold uppercase tracking-widest text-stone-900">Theo dõi Tour</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {tours.map((tour) => (
                <TourCard 
                  key={tour.id} 
                  tour={tour} 
                  attractions={attractions}
                  hotels={hotels}
                  onEdit={(t) => { setEditingTour(t); setShowTourForm(true); }} 
                  onDelete={handleDeleteTour} 
                />
              ))}
              {tours.length === 0 && (
                <div className="col-span-full py-12 text-center bg-stone-50 rounded-[2.5rem] border border-dashed border-stone-200">
                  <p className="text-stone-400 italic">Chưa có tour nào được lên lịch</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'cities' && (
          <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 text-stone-400">
              <Globe className="w-5 h-5" />
              <h2 className="text-lg font-bold uppercase tracking-widest text-stone-900">Cấu hình Thành phố</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {cities.map((city) => (
                <div key={city.id} className="flex items-center justify-between p-4 bg-white rounded-3xl border border-stone-100 shadow-sm group hover:border-orange-200 transition-all">
                  <div className="flex items-center gap-4">
                    <img src={city.imageUrl || `https://picsum.photos/seed/${city.name}/100/100`} className="w-16 h-16 rounded-2xl object-cover" referrerPolicy="no-referrer" />
                    <div>
                      <h3 className="font-bold text-stone-900">{city.name}</h3>
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">{city.cityId}</p>
                    </div>
                  </div>
                  <ActionMenu 
                    onEdit={() => { setEditingCity(city); setShowCityForm(true); }}
                    onDelete={() => handleDeleteCity(city.id)}
                  />
                </div>
              ))}
              {cities.length === 0 && (
                <div className="col-span-full py-12 text-center bg-stone-50 rounded-[2.5rem] border border-dashed border-stone-200">
                  <p className="text-stone-400 italic">Chưa có thành phố nào được cấu hình</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAttractionForm && (
        <AdminForm 
          attraction={editingAttraction} 
          onClose={() => setShowAttractionForm(false)} 
        />
      )}
      {showReminderForm && (
        <ReminderForm 
          reminder={editingReminder} 
          onClose={() => setShowReminderForm(false)} 
        />
      )}
      {showTourForm && (
        <TourForm 
          tour={editingTour} 
          onClose={() => setShowTourForm(false)} 
        />
      )}
      {showHotelForm && (
        <HotelForm 
          hotel={editingHotel} 
          onClose={() => setShowHotelForm(false)} 
        />
      )}
      {showCityForm && (
        <CityForm 
          city={editingCity || undefined} 
          onClose={() => setShowCityForm(false)} 
          onSuccess={() => setShowCityForm(false)}
        />
      )}
    </div>
  );
}
