import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { Tour, Attraction, Hotel } from '../types';

// Register standard fonts (optional, but good for clarity)
// For Vietnamese support, we might need to register a custom font if standard ones don't work well.
// However, for this "clean and elegant" request, we'll try to use standard ones first.
// Note: Standard PDF fonts like Helvetica/Times-Roman often don't support Vietnamese characters.
// We'll use a Google Font for better Vietnamese support.

// Register Roboto font for full Vietnamese support
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
      fontWeight: 'normal',
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
      fontWeight: 'bold',
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 50,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Roboto',
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    color: '#1C1917', // stone-900
    marginBottom: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 12,
    color: '#78716C', // stone-500
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  clientInfo: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: 10,
    color: '#A8A29E', // stone-400
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 12,
    color: '#44403C', // stone-700
    fontWeight: 'bold',
  },
  daySection: {
    marginBottom: 25,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F4',
  },
  dayLabel: {
    fontSize: 10,
    color: '#EA580C', // orange-600
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginRight: 10,
  },
  dayTitle: {
    fontSize: 16,
    color: '#1C1917',
    fontWeight: 'bold',
  },
  item: {
    marginLeft: 10,
    marginBottom: 20,
    paddingLeft: 20,
    borderLeftWidth: 1,
    borderLeftColor: '#F5F5F4',
  },
  itemTime: {
    fontSize: 9,
    color: '#EA580C', // orange-600
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  itemLocation: {
    fontSize: 13,
    color: '#1C1917',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 10,
    color: '#57534E', // stone-600
    lineHeight: 1.5,
  },
  subItems: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  subItem: {
    fontSize: 8,
    backgroundColor: '#F5F5F4',
    color: '#78716C',
    padding: '2 6',
    borderRadius: 4,
    marginRight: 5,
    marginBottom: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
    textAlign: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#A8A29E',
    textTransform: 'uppercase',
    letterSpacing: 1,
  }
});

interface TourPDFProps {
  tour: Tour;
  attractions: Attraction[];
  hotels: Hotel[];
}

export const TourPDF = ({ tour, attractions, hotels }: TourPDFProps) => {
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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.subtitle}>Lịch Trình Khám Phá</Text>
          <Text style={styles.title}>THƯỢNG HẢI - TÔ CHÂU - Ô TRẤN</Text>
          
          <View style={styles.clientInfo}>
            <View>
              <Text style={styles.infoLabel}>Khách hàng</Text>
              <Text style={styles.infoValue}>{tour.clientName || 'Quý khách'}</Text>
            </View>
            <View style={{ textAlign: 'right' }}>
              <Text style={styles.infoLabel}>Thời gian</Text>
              <Text style={styles.infoValue}>{tour.date || 'Sắp tới'}</Text>
            </View>
          </View>

          {hotelName && (
            <View style={{ marginTop: 15, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F5F5F4' }}>
              <Text style={styles.infoLabel}>Khách sạn lưu trú</Text>
              <Text style={styles.infoValue}>{hotelName}</Text>
            </View>
          )}
        </View>

        {/* Itinerary */}
        {tour.itinerary?.map((day, dIdx) => (
          <View key={dIdx} style={styles.daySection}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayLabel}>NGÀY {day.dayNumber}</Text>
              <Text style={styles.dayTitle}>{day.title || `Lịch trình ngày ${day.dayNumber}`}</Text>
            </View>

            {day.items.map((item, iIdx) => (
              <View key={iIdx} style={styles.item}>
                <Text style={styles.itemTime}>{item.timeBlock}</Text>
                <Text style={styles.itemLocation}>
                  {getLocationName(item.locationId) || item.customLocation}
                </Text>
                {item.details && (
                  <Text style={styles.itemDetails}>{item.details}</Text>
                )}
                {item.subItems && item.subItems.length > 0 && (
                  <View style={styles.subItems}>
                    {item.subItems.map((sub, sIdx) => (
                      <Text key={sIdx} style={styles.subItem}>• {sub}</Text>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Cảm ơn quý khách đã tin tưởng và lựa chọn dịch vụ của chúng tôi.
          </Text>
        </View>
      </Page>
    </Document>
  );
};
