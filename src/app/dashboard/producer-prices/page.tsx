'use client';

import { useState, useEffect, useCallback } from 'react';
import { pb, getCurrentUser } from '@/lib/pocketbase';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
} from 'recharts'; // PieChart ve Pie kaldırıldı
import { toast } from 'sonner';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  RefreshCw,
  MapPin,
  Building,
  Filter,
  X,
  Mail,
  Phone
} from 'lucide-react';

interface PriceData {
  id: string;
  price: number;
  created: string;
  updated: string;
  factory: string;
  expand?: {
    factory?: {
      id: string;
      name: string;
      city: string;
    };
  };
}

// averagePrice kaldırıldı
interface FactoryData {
  id: string;
  name: string;
  city: string;
  latestPrice: number;
  priceCount: number;
  lastUpdate: string;
  email?: string;
  phone?: string;
  address?: string;
}

type Cities = {
  [key: string]: string;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

/**
 * Sayısal bir değeri Türk Lirası formatında biçimlendirir.
 * Örn: 1234.56 -> ₺1.234,56
 */
const formatTL = (value: number) => {
  if (value === null || value === undefined || isNaN(value) || value <= 0) return '₺0,00';
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};


export default function ProducerPricesPage() {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [factories, setFactories] = useState<FactoryData[]>([]);
  const [cities, setCities] = useState<Cities>({});
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  // 'pie' seçeneği kaldırıldığı için tür sadece line veya bar
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [selectedFactory, setSelectedFactory] = useState<FactoryData | null>(null);
  const [showFactoryModal, setShowFactoryModal] = useState(false);

  const currentUser = getCurrentUser();

  // Şehirleri yükle
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch('/iller.json');
        const data = await response.json();
        setCities(data);
      } catch (error) {
        console.error('Şehirler yüklenirken hata:', error);
      }
    };
    fetchCities();
  }, []);

  // Tüm fabrika fiyatlarını çek
  const fetchAllFactoryPrices = useCallback(async () => {
    setIsLoading(true);
    try {
      const records = await pb.collection('price').getList(1, 200, {
        sort: '-created',
        expand: 'factory',
        fields: 'id,price,created,updated,factory,expand.factory.id,expand.factory.name,expand.factory.city,expand.factory.email,expand.factory.phone,expand.factory.address',
      });

      const priceData = records.items as unknown as PriceData[];
      setPrices(priceData);

      // Fabrika bazında verileri grupla (Ortalama fiyat hesaplaması yok)
        const factoryMap = new Map<string, {
          name: string;
          city: string;
          email: string;
          phone: string;
          address: string;
          prices: number[];
          lastUpdate: string;
        }>();

        priceData.forEach(price => {
          const factory = price.expand?.factory;
          if (factory) {
            if (!factoryMap.has(factory.id)) {
              factoryMap.set(factory.id, {
                name: factory.name,
                city: factory.city,
                email: factory.email || '',
                phone: factory.phone || '',
                address: factory.address || '',
                prices: [],
                lastUpdate: price.created
              });
            }

            const factoryData = factoryMap.get(factory.id)!;
            factoryData.prices.push(price.price);
            if (new Date(price.created) > new Date(factoryData.lastUpdate)) {
              factoryData.lastUpdate = price.created;
            }
          }
        });

      const factoryDataArray: FactoryData[] = Array.from(factoryMap.entries()).map(([id, data]) => ({
        id,
        name: data.name,
        city: data.city,
        email: data.email,
        phone: data.phone,
        address: data.address,
        latestPrice: data.prices[0] || 0,
        priceCount: data.prices.length,
        lastUpdate: data.lastUpdate
      }));

      setFactories(factoryDataArray);
    } catch (error) {
      console.error('Fiyatlar yüklenirken hata:', error);
      toast.error('Fiyatlar yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllFactoryPrices();
  }, [fetchAllFactoryPrices]);

  // Filtrelenmiş fabrikalar
  const filteredFactories = selectedCity === 'all'
    ? factories
    : factories.filter(factory => factory.city === selectedCity);

  // Fabrika Karşılaştırma Grafik verilerini hazırla (Sadece Güncel Fiyat kullanılıyor)
  const chartData = filteredFactories.map(factory => ({
    name: factory.name,
    'Fiyat': factory.latestPrice, 
    'Fiyat Sayısı': factory.priceCount,
  }));

  // Şehir bazında EN YÜKSEK fiyatları hesapla (Yatay Çubuk Grafik için)
  const cityHighestPriceData = Object.keys(cities)
    .map(cityId => cities[cityId])
    .filter(cityName => factories.some(f => f.city === cityName))
    .map(cityName => {
        const cityFactories = factories.filter(f => f.city === cityName);
        const maxPrice = cityFactories.length > 0 
          ? Math.max(...cityFactories.map(f => f.latestPrice)) 
          : 0;

        return {
            name: cityName,
            value: maxPrice, // En yüksek fiyat (Value olarak kullanılıyor)
        };
    })
    .filter(item => item.value > 0) 
    .sort((a, b) => b.value - a.value); // Fiyata göre büyükten küçüğe sırala


  // İstatistikler (Sadece Fabrika Sayısı, En Yüksek ve En Düşük Fiyat)
  const totalFactories = filteredFactories.length;
  const highestPrice = filteredFactories.length > 0
    ? Math.max(...filteredFactories.map(f => f.latestPrice))
    : 0;
  const lowestPrice = filteredFactories.length > 0
    ? Math.min(...filteredFactories.map(f => f.latestPrice))
    : 0;

  const statCards = (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6"> 
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Toplam Fabrika</CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalFactories}</div>
          <p className="text-xs text-muted-foreground">
            {selectedCity === 'all' ? 'Tüm şehirler' : selectedCity}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">En Yüksek Fiyat</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatTL(highestPrice)}
          </div>
          <p className="text-xs text-muted-foreground">
            En yüksek güncel fiyat
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">En Düşük Fiyat</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatTL(lowestPrice)}
          </div>
          <p className="text-xs text-muted-foreground">
            En düşük güncel fiyat
          </p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fabrika Fiyatları</h1>
            <p className="text-gray-600 mt-2">
              Tüm fabrikaların güncel fındık fiyatları ve karşılaştırma
            </p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={fetchAllFactoryPrices} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Yenile
            </Button>
          </div>
        </div>

        {/* Filtreler */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Filtreler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Şehir Filtresi</label>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Şehir seçiniz" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] overflow-y-auto">
                    <SelectItem value="all">Tüm Şehirler</SelectItem>
                    {Object.entries(cities).map(([cityId, cityName]) => (
                      <SelectItem key={cityId} value={cityName}>
                        {cityName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Grafik Türü</label>
                <Select value={chartType} onValueChange={(value: 'line' | 'bar') => setChartType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Grafik türü seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line">Çizgi Grafiği</SelectItem>
                    <SelectItem value="bar">Sütun Grafiği</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* İstatistik Kartları */}
        {statCards}

        {/* Grafikler */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fabrika Güncel Fiyat Dağılım Grafiği (LİNUX/BAR) */}
          <Card>
            <CardHeader>
              <CardTitle>Fabrika Güncel Fiyat Dağılımı</CardTitle>
              <CardDescription>
                {selectedCity === 'all' ? 'Tüm fabrikalar' : selectedCity} - Son fiyatlar
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
                </div>
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  {chartType === 'line' ? (
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => formatTL(value)} />
                      <Tooltip formatter={(value: number) => [formatTL(value), 'Fiyat']} />
                      <Legend />
                      <Line type="monotone" dataKey="Fiyat" stroke="#2563eb" strokeWidth={2} />
                    </LineChart>
                  ) : ( // chartType === 'bar'
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => formatTL(value)} />
                      <Tooltip formatter={(value: number) => [formatTL(value), 'Fiyat']} />
                      <Legend />
                      <Bar dataKey="Fiyat" fill="#2563eb" />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-500">
                  Veri bulunamadı
                </div>
              )}
            </CardContent>
          </Card>

          {/* Şehir Bazında En Yüksek Fiyatlar Grafiği (YATAY SÜTUN GRAFİK) */}
          <Card>
            <CardHeader>
              <CardTitle>Şehir Bazında En Yüksek Fiyatlar</CardTitle>
              <CardDescription>
                Veri girişi olan şehirlere göre en yüksek güncel fiyat analizi
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
                </div>
              ) : cityHighestPriceData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={cityHighestPriceData} layout="horizontal" margin={{ right: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      type="number" 
                      tick={{ fontSize: 12 }} 
                      tickFormatter={(value) => formatTL(value)} 
                    />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      tick={{ fontSize: 12 }} 
                      width={100} 
                    />
                    <Tooltip formatter={(value: number) => [formatTL(value), 'En Yüksek Fiyat']} />
                    <Legend />
                    <Bar dataKey="value" name="En Yüksek Fiyat" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-500">
                  Şehir bazında fiyat verisi bulunamadı
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Fabrika Detay Tablosu */}
        <Card>
          <CardHeader>
            <CardTitle>Fabrika Detayları</CardTitle>
            <CardDescription>
              Tüm fabrikaların detaylı güncel fiyat bilgileri
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : filteredFactories.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fabrika Adı</TableHead>
                    <TableHead>Şehir</TableHead>
                    <TableHead>Güncel Fiyat</TableHead>
                    <TableHead>Fiyat Sayısı</TableHead>
                    <TableHead>Son Güncelleme</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFactories.map((factory) => (
                    <TableRow key={factory.id} className="cursor-pointer hover:bg-gray-50" onClick={() => {
                      setSelectedFactory(factory);
                      setShowFactoryModal(true);
                    }}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Building className="mr-2 h-4 w-4 text-gray-500" />
                          {factory.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <MapPin className="mr-2 h-4 w-4 text-gray-500" />
                          {factory.city}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatTL(factory.latestPrice)}
                      </TableCell>
                      <TableCell>
                        {factory.priceCount}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                          {new Date(factory.lastUpdate).toLocaleDateString('tr-TR')}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {selectedCity === 'all' ? 'Henüz fabrika verisi bulunmuyor' : `${selectedCity} şehrinde fabrika bulunamadı`}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fabrika Detay Modal */}
        {showFactoryModal && selectedFactory && (
          <div className="fixed inset-0 backdrop-blur-md flex items-center bg-black justify-center bg-opacity-75 z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedFactory.name}</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFactoryModal(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Fabrika Bilgileri */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Fabrika Bilgileri</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Building className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Fabrika Adı</p>
                          <p className="text-gray-600">{selectedFactory.name}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <MapPin className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Şehir</p>
                          <p className="text-gray-600">{selectedFactory.city}</p>
                        </div>
                      </div>

                      {selectedFactory.address && (
                        <div className="flex items-start space-x-3">
                          <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Tam Adres</p>
                            <p className="text-gray-600">{selectedFactory.address}</p>
                          </div>
                        </div>
                      )}

                      {selectedFactory.phone && (
                        <div className="flex items-center space-x-3">
                          <Phone className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Telefon</p>
                            <p className="text-gray-600">{selectedFactory.phone}</p>
                          </div>
                        </div>
                      )}

                      {selectedFactory.email && (
                        <div className="flex items-center space-x-3">
                          <Mail className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">E-posta</p>
                            <p className="text-gray-600">{selectedFactory.email}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Fiyat Bilgileri */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Fiyat Bilgileri</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-900">Güncel Fiyat</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatTL(selectedFactory.latestPrice)}
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-900">Fiyat Sayısı</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {selectedFactory.priceCount}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-900">Son Güncelleme</p>
                      <p className="text-gray-600">
                        {new Date(selectedFactory.lastUpdate).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <Button 
                    onClick={() => setShowFactoryModal(false)}
                    className="w-full"
                  >
                    Kapat
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}