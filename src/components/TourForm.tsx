import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc, getDocs, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Tour, ItineraryDay, ItineraryItem, Attraction, Hotel } from '../types';
import { X, Save, Calendar, Users, Wallet, Map, Plus, Trash2, ChevronDown, ChevronUp, Clock, MapPin, ListPlus, FileText, FileDown, Hotel as HotelIcon } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { TourPDF } from './TourPDF';

interface TourFormProps {
  tour: Tour | null;
  onClose: () => void;
}

export default function TourForm({ tour, onClose }: TourFormProps) {
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [formData, setFormData] = useState<Partial<Tour>>({
    clientName: '',
    date: '',
    price: '',
    guests: 1,
    planRoute: '',
    hotelId: '',
    customHotel: '',
    itinerary: [],
    status: 'scheduled',
    notes: '',
  });

  const populateFromPDF = () => {
    const pdfItinerary: ItineraryDay[] = [
      {
        dayNumber: 1,
        title: "Thượng Hải: Nanjing Lu & Bến Thượng Hải",
        items: [
          {
            timeBlock: "Sáng - Trưa",
            customLocation: "Nanjing Lu",
            details: "Phố đi bộ Nam Kinh - con đường sầm uất nhất Thượng Hải. Khu phố sầm uất với các nhãn hàng nổi tiếng (ví dụ như cửa hàng Popmart lớn nhất thế giới,...)",
            subItems: [
              "Quán lẩu sa tế",
              "Quán mì xunyuji (nổi tiếng với món mì thịt kho)",
              "Quán mì wei xiang zhai (mì kiểu Thượng Hải, sốt mè)",
              "Tiệm bánh nếp truyền thống Shen Da Cheng",
              "Quán Trang Thi Long Hưng (nổi tiếng với tiểu long bao)",
              "Quán ăn nổi tiếng với món sườn chiên giòn ăn cùng bánh gạo chiên Thượng Hải",
              "Quán Đông Thái Tường nổi tiếng với món bánh bao chiên Thượng Hải",
              "Quán Taotaoju (quán đồ ăn Quảng Đông nổi tiếng)"
            ]
          },
          {
            timeBlock: "Chiều",
            customLocation: "Bến Thượng Hải (Wai Tan)",
            details: "Wai Tan: nơi có các toà nhà hiện đại phong cách Châu Âu lên đèn vào buổi tối cực đẹp. Ngắm các tòa nhà phong cách Châu Âu lên đèn vào buổi tối cực đẹp.",
            subItems: [
              "Quán Renheguan (quán ăn Thượng Hải cổ điển, vị hơi thiên ngọt, được nhiều du khách lựa chọn)",
              "Quán Dexingguan (quán ăn truyền thống local từ năm 1878, mì kiểu truyền thống)",
              "Nhà hàng Gia Yến Bến Thượng Hải (có view ra thẳng Bến Thượng Hải và các món ăn truyền thống)",
              "Mì cua Libaixie (quán có món chuyên về thịt cua vô cùng đầy đặn)"
            ]
          },
          {
            timeBlock: "Tối",
            customLocation: "Lục Gia Thuỷ (Lujiazui)",
            details: "Tham quan khu tài chính hiện đại Lujiazui với các tòa nhà chọc trời rực rỡ ánh đèn."
          }
        ]
      },
      {
        dayNumber: 2,
        title: "Wukang Road & Yu Garden",
        items: [
          {
            timeBlock: "Sáng - Trưa",
            customLocation: "Wukang Road & Anfu Road",
            details: "Đi dạo phố cổ, check-in các quán cafe và tiệm bánh nổi tiếng.",
            subItems: [
              "Quán mì bản bang Hàn Tường (nổi tiếng với món mì lươn,...)",
              "Tiệm bánh ý Apoli",
              "Quán Hải Kim Tư (quán ăn địa phương hơn 30 năm, đồ ăn kiểu bình dân thường ngày)"
            ]
          },
          {
            timeBlock: "Chiều - Tối",
            customLocation: "Yu Garden (Dự Viên)",
            details: "Khu cổ trấn đậm chất kiến trúc Trung Quốc cổ. Có con phố food court Shan Qiu Xiang nằm trong chợ cổ với các quán ăn truyền thống Thượng Hải.",
            subItems: [
              "Phố food court Shan Qiu Xiang",
              "Quán Xiabinhxiejiang (quán có món mì cua đẫm sốt gạch)"
            ]
          }
        ]
      },
      {
        dayNumber: 3,
        title: "Huaihai Road & Xintiandi",
        items: [
          {
            timeBlock: "Sáng",
            customLocation: "Huaihai Road",
            details: "Nơi có cửa hàng Gentle Monster với hai mô hình mặt người cực nổi tiếng.",
          },
          {
            timeBlock: "Chiều",
            customLocation: "Xintiandi",
            details: "Khu trung tâm thương mại shopping nổi tiếng ở Thượng Hải. Gồm Phase 1 (khu chính đông nhất), Phase 2 (hiện đại hơn) và Xintiandi Style (kiểu mall, lifestyle).",
            subItems: [
              "Xintiandi Phase 1",
              "Xintiandi Phase 2",
              "Xintiandi Style Phase 1, 2"
            ]
          },
          {
            timeBlock: "Tối",
            customLocation: "Tianzi Fang",
            details: "Khu hẻm nghệ thuật thích hợp đi cafe, shopping và chụp ảnh. Xung quanh có đa dạng các quán ăn kiểu Tây, Thái, Nhật, Hàn.",
            subItems: [
              "Quán New York Bagelous Museum (bánh bagel cực nổi)",
              "Quán Qungtingchengdu Hot Pot (lẩu tê cay Thành Đô)",
              "Quán Naãnianfmantoudian (chuyên tiểu long bao bánh bao nhỏ có nước súp các vị)"
            ]
          }
        ]
      },
      {
        dayNumber: 4,
        title: "Tô Châu & Ô Trấn",
        items: [
          {
            timeBlock: "Sáng",
            customLocation: "Di chuyển đi Tô Châu",
            details: "Phải dậy sớm đi tàu cao tốc tới Tô Châu.",
          },
          {
            timeBlock: "Cả ngày",
            customLocation: "Full khu phố cổ Ô Trấn",
            details: "Ta sẽ có một ngày để đi full khu phố cổ Ô Trấn. Đi từ ga tàu tới Ô Trấn mất khoảng 1 tiếng rưỡi cho tới 2 tiếng.",
          }
        ]
      }
    ];
    setFormData({ ...formData, itinerary: pdfItinerary });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const attractionsQ = query(collection(db, 'attractions'), orderBy('name', 'asc'));
        const attractionsSnapshot = await getDocs(attractionsQ);
        setAttractions(attractionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Attraction)));

        const hotelsQ = query(collection(db, 'hotels'), orderBy('name', 'asc'));
        const hotelsSnapshot = await getDocs(hotelsQ);
        setHotels(hotelsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Hotel)));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (tour) {
      setFormData({
        ...tour,
        itinerary: tour.itinerary || []
      });
    }
  }, [tour]);

  const addDay = () => {
    const newDay: ItineraryDay = {
      dayNumber: (formData.itinerary?.length || 0) + 1,
      items: []
    };
    setFormData({
      ...formData,
      itinerary: [...(formData.itinerary || []), newDay]
    });
  };

  const removeDay = (index: number) => {
    const newItinerary = [...(formData.itinerary || [])];
    newItinerary.splice(index, 1);
    // Re-number days
    const renumbered = newItinerary.map((day, i) => ({ ...day, dayNumber: i + 1 }));
    setFormData({ ...formData, itinerary: renumbered });
  };

  const addItem = (dayIndex: number) => {
    const newItinerary = [...(formData.itinerary || [])];
    const newItem: ItineraryItem = {
      timeBlock: 'Sáng',
      customLocation: '',
      details: '',
      subItems: []
    };
    newItinerary[dayIndex].items.push(newItem);
    setFormData({ ...formData, itinerary: newItinerary });
  };

  const removeItem = (dayIndex: number, itemIndex: number) => {
    const newItinerary = [...(formData.itinerary || [])];
    newItinerary[dayIndex].items.splice(itemIndex, 1);
    setFormData({ ...formData, itinerary: newItinerary });
  };

  const updateItem = (dayIndex: number, itemIndex: number, field: keyof ItineraryItem, value: any) => {
    const newItinerary = [...(formData.itinerary || [])];
    newItinerary[dayIndex].items[itemIndex] = {
      ...newItinerary[dayIndex].items[itemIndex],
      [field]: value
    };
    setFormData({ ...formData, itinerary: newItinerary });
  };

  const addSubItem = (dayIndex: number, itemIndex: number) => {
    const newItinerary = [...(formData.itinerary || [])];
    const item = newItinerary[dayIndex].items[itemIndex];
    item.subItems = [...(item.subItems || []), ''];
    setFormData({ ...formData, itinerary: newItinerary });
  };

  const updateSubItem = (dayIndex: number, itemIndex: number, subIndex: number, value: string) => {
    const newItinerary = [...(formData.itinerary || [])];
    const item = newItinerary[dayIndex].items[itemIndex];
    if (item.subItems) {
      item.subItems[subIndex] = value;
    }
    setFormData({ ...formData, itinerary: newItinerary });
  };

  const removeSubItem = (dayIndex: number, itemIndex: number, subIndex: number) => {
    const newItinerary = [...(formData.itinerary || [])];
    const item = newItinerary[dayIndex].items[itemIndex];
    if (item.subItems) {
      item.subItems.splice(subIndex, 1);
    }
    setFormData({ ...formData, itinerary: newItinerary });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanData: any = {
      createdAt: tour?.createdAt || new Date().toISOString(),
    };

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
      <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        <div className="p-6 md:p-8 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div>
            <h2 className="text-xl md:text-2xl font-serif italic font-bold text-stone-900">
              {tour ? 'Chỉnh sửa Tour' : 'Tạo Tour mới'}
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mt-1">Quản lý lịch trình chi tiết</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-full transition-colors">
            <X className="w-6 h-6 text-stone-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          {/* Basic Info */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-stone-400 mb-4">
              <Users className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-widest">Thông tin cơ bản</h3>
            </div>
            
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Khách sạn (Từ App)</label>
                <div className="relative">
                  <select
                    value={formData.hotelId || ''}
                    onChange={(e) => setFormData({ ...formData, hotelId: e.target.value, customHotel: '' })}
                    className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all appearance-none"
                  >
                    <option value="">-- Chọn khách sạn --</option>
                    {hotels.map(hotel => (
                      <option key={hotel.id} value={hotel.id}>{hotel.name}</option>
                    ))}
                  </select>
                  <HotelIcon className="w-5 h-5 text-stone-300 absolute left-4 top-1/2 -translate-y-1/2" />
                  <ChevronDown className="w-4 h-4 text-stone-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Khách sạn khác</label>
                <div className="relative">
                  <input
                    value={formData.customHotel || ''}
                    onChange={(e) => setFormData({ ...formData, customHotel: e.target.value, hotelId: '' })}
                    className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                    placeholder="Nếu không có trong danh sách"
                  />
                  <HotelIcon className="w-5 h-5 text-stone-300 absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>
          </section>

          {/* Itinerary Builder */}
          <section className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-stone-400">
                <Map className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-widest">Lịch trình chi tiết</h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={populateFromPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-600 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-stone-200 transition-all"
                >
                  <FileText className="w-4 h-4" /> Mẫu từ PDF
                </button>
                <button
                  type="button"
                  onClick={addDay}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-orange-100 transition-all"
                >
                  <Plus className="w-4 h-4" /> Thêm Ngày
                </button>
              </div>
            </div>

            <div className="space-y-8">
              {formData.itinerary?.map((day, dayIndex) => (
                <div key={dayIndex} className="bg-stone-50/50 rounded-[2rem] border border-stone-100 p-6 space-y-6 relative group/day">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-stone-900 text-white rounded-2xl flex items-center justify-center font-serif italic text-xl">
                        {day.dayNumber}
                      </div>
                      <input
                        value={day.title || ''}
                        onChange={(e) => {
                          const newItinerary = [...(formData.itinerary || [])];
                          newItinerary[dayIndex].title = e.target.value;
                          setFormData({ ...formData, itinerary: newItinerary });
                        }}
                        placeholder="Tiêu đề ngày (VD: Khám phá Thượng Hải)"
                        className="bg-transparent border-b border-stone-200 focus:border-orange-500 outline-none py-1 text-lg font-bold text-stone-900 placeholder:text-stone-300 transition-all"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDay(dayIndex)}
                      className="p-2 text-stone-300 hover:text-red-500 transition-colors opacity-0 group-hover/day:opacity-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {day.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="bg-white rounded-2xl border border-stone-100 p-4 space-y-4 relative group/item">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-stone-400">Thời gian</label>
                            <select
                              value={item.timeBlock}
                              onChange={(e) => updateItem(dayIndex, itemIndex, 'timeBlock', e.target.value)}
                              className="w-full px-3 py-2 bg-stone-50 border border-stone-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-orange-500"
                            >
                              <option value="Sáng">Sáng</option>
                              <option value="Trưa">Trưa</option>
                              <option value="Chiều">Chiều</option>
                              <option value="Tối">Tối</option>
                            </select>
                          </div>
                          
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-stone-400">Địa điểm (Từ App)</label>
                            <select
                              value={item.locationId || ''}
                              onChange={(e) => updateItem(dayIndex, itemIndex, 'locationId', e.target.value)}
                              className="w-full px-3 py-2 bg-stone-50 border border-stone-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-orange-500"
                            >
                              <option value="">-- Chọn địa điểm --</option>
                              {attractions.map(attr => (
                                <option key={attr.id} value={attr.id}>{attr.name}</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-stone-400">Địa điểm khác</label>
                            <input
                              value={item.customLocation || ''}
                              onChange={(e) => updateItem(dayIndex, itemIndex, 'customLocation', e.target.value)}
                              placeholder="Nếu không có trong danh sách"
                              className="w-full px-3 py-2 bg-stone-50 border border-stone-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-orange-500"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-stone-400">Chi tiết hoạt động</label>
                          <textarea
                            rows={2}
                            value={item.details || ''}
                            onChange={(e) => updateItem(dayIndex, itemIndex, 'details', e.target.value)}
                            placeholder="Mô tả hoạt động..."
                            className="w-full px-3 py-2 bg-stone-50 border border-stone-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                          />
                        </div>

                        {/* Sub-items (Restaurants, etc) */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-stone-400">Danh sách phụ (VD: Quán ăn)</label>
                            <button
                              type="button"
                              onClick={() => addSubItem(dayIndex, itemIndex)}
                              className="text-[8px] font-bold uppercase text-orange-600 hover:text-orange-700"
                            >
                              + Thêm mục
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {item.subItems?.map((sub, subIndex) => (
                              <div key={subIndex} className="flex items-center gap-2">
                                <input
                                  value={sub}
                                  onChange={(e) => updateSubItem(dayIndex, itemIndex, subIndex, e.target.value)}
                                  placeholder="Tên quán ăn, lưu ý..."
                                  className="flex-1 px-3 py-1.5 bg-stone-50 border border-stone-100 rounded-lg text-[10px] outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeSubItem(dayIndex, itemIndex, subIndex)}
                                  className="p-1 text-stone-300 hover:text-red-500"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(dayIndex, itemIndex)}
                          className="absolute -top-2 -right-2 p-1.5 bg-white border border-stone-100 text-stone-300 hover:text-red-500 rounded-full shadow-sm opacity-0 group-hover/item:opacity-100 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addItem(dayIndex)}
                      className="w-full py-3 border-2 border-dashed border-stone-200 rounded-2xl text-stone-400 text-[10px] font-bold uppercase tracking-widest hover:border-orange-200 hover:text-orange-600 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Thêm hoạt động
                    </button>
                  </div>
                </div>
              ))}
              {(!formData.itinerary || formData.itinerary.length === 0) && (
                <div className="py-12 text-center bg-stone-50 rounded-[2.5rem] border border-dashed border-stone-200">
                  <p className="text-stone-400 italic text-sm">Chưa có lịch trình chi tiết. Hãy thêm ngày mới!</p>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-stone-400 mb-4">
              <ListPlus className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-widest">Ghi chú & Khác</h3>
            </div>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-none"
              placeholder="Ghi chú riêng về khách hàng..."
            />
          </section>
        </form>

        <div className="p-6 md:p-8 border-t border-stone-100 bg-stone-50/50 flex flex-col md:flex-row gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-8 py-4 bg-white border border-stone-200 text-stone-600 rounded-full font-medium hover:bg-stone-100 transition-all"
          >
            Hủy
          </button>
          
          <PDFDownloadLink
            document={<TourPDF tour={formData as Tour} attractions={attractions} hotels={hotels} />}
            fileName={`Lich_Trinh_Tour_${formData.clientName || 'Khach'}.pdf`}
            className="flex-1 px-8 py-4 bg-orange-50 text-orange-600 rounded-full font-medium hover:bg-orange-100 transition-all flex items-center justify-center gap-2"
          >
            {({ loading }) => (
              <>
                <FileDown className="w-5 h-5" />
                {loading ? 'Đang tạo...' : 'Tải PDF'}
              </>
            )}
          </PDFDownloadLink>

          <button
            onClick={handleSubmit}
            className="flex-1 px-8 py-4 bg-stone-900 text-white rounded-full font-medium hover:bg-stone-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-stone-200"
          >
            <Save className="w-5 h-5" />
            {tour ? 'Cập nhật Tour' : 'Tạo Tour'}
          </button>
        </div>
      </div>
    </div>
  );
}
