'use client';

import { useState, useEffect, useCallback } from 'react';
import { pb, getCurrentUser } from '@/lib/pocketbase';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { toast } from 'sonner';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  RefreshCw,
  Plus,
  X
} from 'lucide-react';

interface PriceData {
  id: string;
  price: number;
  type: string;
  created: string;
  updated: string;
}

export default function PricesPage() {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    price: '',
    type: 'dogu_karadeniz'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState('all');

  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === 'admin';
  const canManagePrices = isAdmin;

  // Fiyat verilerini çek
  const fetchPrices = useCallback(async () => {
    setIsLoading(true);
    try {
      const records = await pb.collection('price').getList(1, 50, {
        sort: '-created',
      });
      setPrices(records.items as unknown as PriceData[]);
    } catch (error) {
      console.error('Fiyatlar yüklenirken hata:', error);
      toast.error('Fiyatlar yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  // Filtrelenmiş fiyatlar
  const filteredPrices = selectedType === 'all' 
    ? prices 
    : prices.filter(price => price.type === selectedType);

  // Grafik için veri hazırla - tip bazında gruplama
  const prepareChartData = () => {
    // Son 30 veriyi al ve tarihe göre sırala
    const sortedPrices = prices
      .slice(0, 30)
      .sort((a, b) => new Date(a.created).getTime() - new Date(b.created).getTime());

    // Her tip için ayrı veri setleri oluştur
    const doguData = sortedPrices
      .filter(p => p.type === 'dogu_karadeniz')
      .map(p => ({
        date: new Date(p.created).toLocaleDateString('tr-TR'),
        price: p.price,
        type: 'Doğu Karadeniz'
      }));

    const batiData = sortedPrices
      .filter(p => p.type === 'bati_karadeniz')
      .map(p => ({
        date: new Date(p.created).toLocaleDateString('tr-TR'),
        price: p.price,
        type: 'Batı Karadeniz'
      }));

    const giresunData = sortedPrices
      .filter(p => p.type === 'giresun')
      .map(p => ({
        date: new Date(p.created).toLocaleDateString('tr-TR'),
        price: p.price,
        type: 'Giresun'
      }));

    return { doguData, batiData, giresunData };
  };

  const { doguData, batiData, giresunData } = prepareChartData();

  // İstatistikler
  const latestPrice = filteredPrices[0];
  const priceChange = filteredPrices.length > 1 
    ? ((filteredPrices[0].price - filteredPrices[1].price) / filteredPrices[1].price) * 100 
    : 0;



  // Yeni fiyat ekle
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const data: { price: number; type: string } = {
        price: parseFloat(formData.price),
        type: formData.type,
      };
      
      await pb.collection('price').create(data);
      
      toast.success('Fiyat başarıyla eklendi');
      setFormData({ price: '', type: 'dogu_karadeniz' });
      setShowForm(false);
      fetchPrices(); // Listeyi yenile
    } catch (error) {
      console.error('Fiyat eklenirken hata:', error);
      toast.error('Fiyat eklenemedi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fındık Fiyatları</h1>
            <p className="text-gray-600 mt-2">
              Güncel fındık fiyatları ve trend analizi
            </p>
          </div>
          <div className="flex space-x-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tüm Tipler</option>
              <option value="dogu_karadeniz">Doğu Karadeniz</option>
              <option value="bati_karadeniz">Batı Karadeniz</option>
              <option value="giresun">Giresun</option>
            </select>
            <Button onClick={fetchPrices} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Yenile
            </Button>
            {canManagePrices && (
              <Button onClick={() => setShowForm(true)} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Yeni Fiyat
              </Button>
            )}
          </div>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Son Fiyat</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {latestPrice ? `₺${latestPrice.price.toLocaleString()}` : '₺0'}
              </div>
                             <p className="text-xs text-muted-foreground">
                 Son eklenen fiyat
               </p>
            </CardContent>
          </Card>


          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fiyat Değişimi</CardTitle>
              {priceChange >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Son iki kayıt arasında
              </p>
            </CardContent>
          </Card>
        </div>

        

        {/* Grafik - 3 Ayrı Grafik */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Doğu Karadeniz Grafiği */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                Doğu Karadeniz
              </CardTitle>
              <CardDescription>
                Son {doguData.length} fiyat kaydı
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : doguData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={doguData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      tick={{ fontSize: 10 }}
                      tickFormatter={(value) => `₺${value.toLocaleString()}`}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`₺${value.toLocaleString()}`, 'Fiyat']}
                      labelFormatter={(label) => `Tarih: ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#2563eb', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Doğu Karadeniz verisi bulunmuyor
                </div>
              )}
            </CardContent>
          </Card>

          {/* Batı Karadeniz Grafiği */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                Batı Karadeniz
              </CardTitle>
              <CardDescription>
                Son {batiData.length} fiyat kaydı
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                </div>
              ) : batiData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={batiData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      tick={{ fontSize: 10 }}
                      tickFormatter={(value) => `₺${value.toLocaleString()}`}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`₺${value.toLocaleString()}`, 'Fiyat']}
                      labelFormatter={(label) => `Tarih: ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#dc2626"
                      strokeWidth={3}
                      dot={{ fill: '#dc2626', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#dc2626', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Batı Karadeniz verisi bulunmuyor
                </div>
              )}
            </CardContent>
          </Card>

          {/* Giresun Grafiği */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                Giresun
              </CardTitle>
              <CardDescription>
                Son {giresunData.length} fiyat kaydı
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                </div>
              ) : giresunData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={giresunData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      tick={{ fontSize: 10 }}
                      tickFormatter={(value) => `₺${value.toLocaleString()}`}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`₺${value.toLocaleString()}`, 'Fiyat']}
                      labelFormatter={(label) => `Tarih: ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#16a34a"
                      strokeWidth={3}
                      dot={{ fill: '#16a34a', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#16a34a', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Giresun verisi bulunmuyor
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Fiyat Listesi */}
        <Card>
          <CardHeader>
            <CardTitle>Son Eklenen Fiyatlar</CardTitle>
            <CardDescription>
              En son eklenen fiyat kayıtları
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : filteredPrices.length > 0 ? (
              <Table>
                                 <TableHeader>
                   <TableRow>
                     <TableHead>Tarih</TableHead>
                     <TableHead>Tip</TableHead>
                     <TableHead>Fiyat</TableHead>
                     <TableHead>Değişim</TableHead>
                   </TableRow>
                 </TableHeader>
                <TableBody>
                  {filteredPrices.slice(0, 10).map((price, index) => {
                    const prevPrice = filteredPrices[index + 1]?.price;
                    const change = prevPrice ? ((price.price - prevPrice) / prevPrice) * 100 : 0;
                    
                    return (
                      <TableRow key={price.id}>
                                                 <TableCell>
                           <div className="flex items-center">
                             <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                             {new Date(price.created).toLocaleDateString('tr-TR')}
                           </div>
                         </TableCell>
                         <TableCell>
                           <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                             {price.type === 'dogu_karadeniz' ? 'Doğu Karadeniz' :
                              price.type === 'bati_karadeniz' ? 'Batı Karadeniz' :
                              price.type === 'giresun' ? 'Giresun' : price.type}
                           </span>
                         </TableCell>
                                                 <TableCell className="font-medium">
                           ₺{price.price.toLocaleString()}
                         </TableCell>
                         <TableCell>
                          <div className={`flex items-center ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {change >= 0 ? (
                              <TrendingUp className="mr-1 h-4 w-4" />
                            ) : (
                              <TrendingDown className="mr-1 h-4 w-4" />
                            )}
                            {change !== 0 ? `${change >= 0 ? '+' : ''}${change.toFixed(1)}%` : '-'}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Henüz fiyat verisi bulunmuyor
              </div>
            )}
          </CardContent>
                 </Card>
       </div>

       {/* Yeni Fiyat Form Modal */}
       {showForm && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white rounded-lg p-6 w-full max-w-md">
             <div className="flex justify-between items-center mb-4">
               <h2 className="text-xl font-bold">Yeni Fiyat Ekle</h2>
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={() => setShowForm(false)}
               >
                 <X className="h-4 w-4" />
               </Button>
             </div>
             
                           <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Fiyat Tipi
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="dogu_karadeniz">Doğu Karadeniz</option>
                    <option value="bati_karadeniz">Batı Karadeniz</option>
                    <option value="giresun">Giresun</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Fiyat (₺)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
               
               <div className="flex space-x-2 pt-4">
                 <Button
                   type="button"
                   variant="outline"
                   onClick={() => setShowForm(false)}
                   className="flex-1"
                 >
                   İptal
                 </Button>
                 <Button
                   type="submit"
                   disabled={isSubmitting}
                   className="flex-1"
                 >
                   {isSubmitting ? 'Ekleniyor...' : 'Ekle'}
                 </Button>
               </div>
             </form>
           </div>
         </div>
       )}
     </DashboardLayout>
   );
 }