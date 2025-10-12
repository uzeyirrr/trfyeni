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
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
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
  created: string;
  updated: string;
}

export default function PricesPage() {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    price: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === 'admin';
  const isFactory = currentUser?.role === 'factory';
  const canManagePrices = isAdmin || isFactory;

  // Fiyat verilerini çek
  const fetchPrices = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fabrika kullanıcısı ise sadece kendi fiyatlarını getir
      const filter = isFactory ? `factory = "${currentUser?.id}"` : '';
      
      const records = await pb.collection('price').getList(1, 50, {
        sort: '-created',
        filter: filter,
        expand: 'factory',
      });
      setPrices(records.items as unknown as PriceData[]);
    } catch (error) {
      console.error('Fiyatlar yüklenirken hata:', error);
      toast.error('Fiyatlar yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  }, [isFactory, currentUser?.id]);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  // Grafik için veri hazırla
  const chartData = prices
    .slice(0, 20) // Son 20 veri
    .reverse()
    .map(price => ({
      date: new Date(price.created).toLocaleDateString('tr-TR'),
      price: price.price,
    }));

  // İstatistikler
  const latestPrice = prices[0];
  const averagePrice = prices.length > 0 
    ? prices.reduce((sum, price) => sum + price.price, 0) / prices.length 
    : 0;
  const priceChange = prices.length > 1 
    ? ((prices[0].price - prices[1].price) / prices[1].price) * 100 
    : 0;



  // Yeni fiyat ekle
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const data: { price: number; factory?: string } = {
        price: parseFloat(formData.price),
      };
      
      // Fabrika kullanıcısı ise factory alanını otomatik ekle
      if (isFactory && currentUser?.id) {
        data.factory = currentUser.id;
      }
      
      await pb.collection('price').create(data);
      
      toast.success('Fiyat başarıyla eklendi');
      setFormData({ price: '' });
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <CardTitle className="text-sm font-medium">Fabrika Adı</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentUser?.name || 'Bilinmeyen Kullanıcı'}
              </div>
              <p className="text-xs text-muted-foreground">
                Kullanıcı adı
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

        

        {/* Grafik */}
        <Card>
          <CardHeader>
            <CardTitle>Fiyat Trendi</CardTitle>
            <CardDescription>
              Son 20 fiyat kaydının trend grafiği
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `₺${value.toLocaleString()}`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`₺${value.toLocaleString()}`, 'Fiyat']}
                    labelFormatter={(label) => `Tarih: ${label}`}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#2563eb"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                Henüz fiyat verisi bulunmuyor
              </div>
            )}
          </CardContent>
        </Card>

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
            ) : prices.length > 0 ? (
              <Table>
                                 <TableHeader>
                   <TableRow>
                     <TableHead>Tarih</TableHead>
                     <TableHead>Fiyat</TableHead>
                     <TableHead>Değişim</TableHead>
                   </TableRow>
                 </TableHeader>
                <TableBody>
                  {prices.slice(0, 10).map((price, index) => {
                    const prevPrice = prices[index + 1]?.price;
                    const change = prevPrice ? ((price.price - prevPrice) / prevPrice) * 100 : 0;
                    
                    return (
                      <TableRow key={price.id}>
                                                 <TableCell>
                           <div className="flex items-center">
                             <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                             {new Date(price.created).toLocaleDateString('tr-TR')}
                           </div>
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
