'use client';

import { useState, useEffect } from 'react';
import { pb } from '@/lib/pocketbase';

interface PriceData {
  id: string;
  price: number;
  type: string;
  created: string;
}

interface PriceTickerProps {
  className?: string;
}

export function PriceTicker({ className = '' }: PriceTickerProps) {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fiyat verilerini çek
  useEffect(() => {
    const fetchLatestPrices = async () => {
      try {
        // Her tipten son eklenen fiyatı getir
        const [doguKaradeniz, batiKaradeniz, giresun] = await Promise.all([
          pb.collection('price').getList(1, 1, {
            filter: 'type = "dogu_karadeniz"',
            sort: '-created'
          }),
          pb.collection('price').getList(1, 1, {
            filter: 'type = "bati_karadeniz"',
            sort: '-created'
          }),
          pb.collection('price').getList(1, 1, {
            filter: 'type = "giresun"',
            sort: '-created'
          })
        ]);

        const latestPrices = [
          ...doguKaradeniz.items,
          ...batiKaradeniz.items,
          ...giresun.items
        ].map(item => ({
          id: item.id,
          price: item.price,
          type: item.type,
          created: item.created
        }));

        setPrices(latestPrices);
      } catch (error) {
        console.error('Fiyat verileri yüklenirken hata:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestPrices();
    
    // Her 30 saniyede bir güncelle
    const interval = setInterval(fetchLatestPrices, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'dogu_karadeniz':
        return 'Doğu Karadeniz';
      case 'bati_karadeniz':
        return 'Batı Karadeniz';
      case 'giresun':
        return 'Giresun';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'dogu_karadeniz':
        return 'text-blue-600';
      case 'bati_karadeniz':
        return 'text-red-600';
      case 'giresun':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-gray-100 py-2 px-4 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="animate-pulse text-sm text-gray-500">
            Fiyat verileri yükleniyor...
          </div>
        </div>
      </div>
    );
  }

  if (prices.length === 0) {
    return (
      <div className={`bg-gray-100 py-2 px-4 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="text-sm text-gray-500">
            Henüz fiyat verisi bulunmuyor
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-green-50 to-blue-50 rounded-lg px-4 py-2 overflow-hidden w-full max-w-2xl ${className}`}>
      <div className="flex items-center space-x-6">
        <span className="font-semibold text-gray-700 whitespace-nowrap text-sm">Güncel Fiyatlar:</span>
        <div className="flex items-center space-x-6 overflow-hidden">
          <div className="flex items-center space-x-6 animate-scroll">
            {/* Ana içerik */}
            {prices.map((price) => (
              <div key={price.id} className="flex items-center space-x-2 whitespace-nowrap">
                <span className={`font-bold ${getTypeColor(price.type)} text-sm`}>
                  {getTypeLabel(price.type)}
                </span>
                <span className="font-bold text-gray-900 text-sm">
                  ₺{price.price.toLocaleString()}
                </span>
                <span className="text-gray-500 text-sm">•</span>
              </div>
            ))}
            {/* Tekrar eden içerik - sürekli döngü için */}
            {prices.map((price) => (
              <div key={`repeat-${price.id}`} className="flex items-center space-x-2 whitespace-nowrap">
                <span className={`font-bold ${getTypeColor(price.type)} text-sm`}>
                  {getTypeLabel(price.type)}
                </span>
                <span className="font-bold text-gray-900 text-sm">
                  ₺{price.price.toLocaleString()}
                </span>
                <span className="text-gray-500 text-sm">•</span>
              </div>
            ))}
            {/* Ek tekrar - daha yumuşak geçiş için */}
            {prices.map((price) => (
              <div key={`repeat2-${price.id}`} className="flex items-center space-x-2 whitespace-nowrap">
                <span className={`font-bold ${getTypeColor(price.type)} text-sm`}>
                  {getTypeLabel(price.type)}
                </span>
                <span className="font-bold text-gray-900 text-sm">
                  ₺{price.price.toLocaleString()}
                </span>
                <span className="text-gray-500 text-sm">•</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
