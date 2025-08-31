'use client';

import { useState, useEffect } from 'react';
import { pb, getCurrentUser, AuthModel } from '@/lib/pocketbase';
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
import { toast } from 'sonner';
import { 
  Truck, 
  Plus, 
  X,
  Calendar,
  User,
  Building,
  Package,
  DollarSign
} from 'lucide-react';

interface DeliveryData {
  id: string;
  kg: number;
  user: string;
  factory: string; // Artık fabrika adı olacak
  price: number;
  created: string;
  updated: string;
}

interface FactoryUser {
  id: string;
  name: string;
  city: string;
  role: string;
}

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<DeliveryData[]>([]);
  const [factories, setFactories] = useState<FactoryUser[]>([]);
  const [latestPrice, setLatestPrice] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    kg: '',
    factory: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentUser = getCurrentUser();

  // Teslimatları çek
  const fetchDeliveries = async () => {
    setIsLoading(true);
    try {
      const records = await pb.collection('deliveries').getList(1, 50, {
        sort: '-created',
        expand: 'user,factory,price',
        filter: `user = "${currentUser?.id}"`
      });
      
      // Expand edilmiş verileri düzgün şekilde işle
      const processedDeliveries = records.items.map(item => ({
        id: item.id,
        kg: item.kg,
        user: item.user,
        factory: item.expand?.factory?.name || item.factory || 'Belirtilmemiş',
        price: item.expand?.price?.price || (typeof item.price === 'number' ? item.price : 0),
        created: item.created,
        updated: item.updated
      }));
      
      setDeliveries(processedDeliveries as DeliveryData[]);
    } catch (error) {
      console.error('Teslimatlar yüklenirken hata:', error);
      toast.error('Teslimatlar yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  // Fabrikaları çek
  const fetchFactories = async () => {
    try {
      const records = await pb.collection('users').getList(1, 200, {
        filter: 'role = "factory"'
      });
      
      const factoryUsers = records.items as unknown as FactoryUser[];
      
      // Kullanıcının şehri ile aynı şehirdeki fabrikaları filtrele
      if (currentUser?.city) {
        const sameCityFactories = factoryUsers.filter(factory => 
          factory.city === currentUser.city
        );
        
        if (sameCityFactories.length > 0) {
          setFactories(sameCityFactories);
        } else {
          // Aynı şehirde fabrika yoksa tüm fabrikaları göster
          setFactories(factoryUsers);
        }
      } else {
        // Kullanıcının şehri yoksa tüm fabrikaları göster
        setFactories(factoryUsers);
      }
    } catch (error) {
      console.error('Fabrikalar yüklenirken hata:', error);
    }
  };

  // Son fiyatı çek
  const fetchLatestPrice = async () => {
    try {
      const records = await pb.collection('price').getList(1, 1, {
        sort: '-created',
      });
      if (records.items.length > 0) {
        setLatestPrice(records.items[0].price);
      }
    } catch (error) {
      console.error('Son fiyat yüklenirken hata:', error);
    }
  };

  useEffect(() => {
    fetchDeliveries();
    fetchFactories();
    fetchLatestPrice();
  }, []);

  // Yeni teslimat ekle
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Son fiyatı tekrar çek (güncel olması için)
      const priceRecords = await pb.collection('price').getList(1, 1, {
        sort: '-created',
      });
      const currentPrice = priceRecords.items.length > 0 ? priceRecords.items[0].price : 0;
      
      await pb.collection('deliveries').create({
        kg: parseFloat(formData.kg),
        user: currentUser?.id,
        factory: formData.factory,
        price: currentPrice
      });
      
      toast.success('Teslimat başarıyla eklendi');
      setFormData({ kg: '', factory: '' });
      setShowForm(false);
      fetchDeliveries(); // Listeyi yenile
    } catch (error) {
      console.error('Teslimat eklenirken hata:', error);
      toast.error('Teslimat eklenemedi');
    } finally {
      setIsSubmitting(false);
    }
  };

  // İstatistikler
  const totalKg = deliveries.reduce((sum, delivery) => sum + (parseFloat(delivery.kg?.toString() || '0') || 0), 0);
  const totalValue = deliveries.reduce((sum, delivery) => sum + ((parseFloat(delivery.kg?.toString() || '0') || 0) * (delivery.price || 0)), 0);
  const averageKg = deliveries.length > 0 ? totalKg / deliveries.length : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Teslimatlar</h1>
            <p className="text-gray-600 mt-2">
              Fındık teslimat yönetimi
            </p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={fetchDeliveries} variant="outline" size="sm">
              <Truck className="mr-2 h-4 w-4" />
              Yenile
            </Button>
            <Button onClick={() => setShowForm(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Yeni Teslimat
            </Button>
          </div>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Teslimat</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {deliveries.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Adet teslimat
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Kg</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalKg.toLocaleString()} kg
              </div>
              <p className="text-xs text-muted-foreground">
                Toplam ağırlık
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ortalama Kg</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {averageKg.toFixed(1)} kg
              </div>
              <p className="text-xs text-muted-foreground">
                Teslimat başına
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Değer</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₺{totalValue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Toplam değer
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Teslimat Listesi */}
        <Card>
          <CardHeader>
            <CardTitle>Son Teslimatlar</CardTitle>
            <CardDescription>
              En son yapılan teslimatlar
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : deliveries.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Kg</TableHead>
                    <TableHead>Fabrika</TableHead>
                    <TableHead>Fiyat</TableHead>
                    <TableHead>Toplam</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveries.slice(0, 10).map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                          {new Date(delivery.created).toLocaleDateString('tr-TR')}
                        </div>
                      </TableCell>
                                             <TableCell className="font-medium">
                         {(parseFloat(delivery.kg?.toString() || '0') || 0).toLocaleString()} kg
                       </TableCell>
                                               <TableCell>
                          <div className="flex items-center">
                            <Building className="mr-2 h-4 w-4 text-gray-500" />
                            {delivery.factory}
                          </div>
                        </TableCell>
                       <TableCell>
                         ₺{(delivery.price || 0).toLocaleString()}
                       </TableCell>
                       <TableCell className="font-bold">
                         ₺{((parseFloat(delivery.kg?.toString() || '0') || 0) * (delivery.price || 0)).toLocaleString()}
                       </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Henüz teslimat bulunmuyor
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Yeni Teslimat Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Yeni Teslimat Ekle</h2>
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
                  Kg
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.kg}
                  onChange={(e) => setFormData({...formData, kg: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Fabrika
                </label>
                <Select
                  value={formData.factory}
                  onValueChange={(value) => setFormData({...formData, factory: value})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Fabrika seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {factories.map((factory) => (
                      <SelectItem key={factory.id} value={factory.id}>
                        {factory.name} - {factory.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-gray-50 p-3 rounded-md">
                                 <p className="text-sm text-gray-600">
                   <strong>Son Fiyat:</strong> ₺{(latestPrice || 0).toLocaleString()}
                 </p>
                 <p className="text-sm text-gray-600">
                   <strong>Tahmini Toplam:</strong> ₺{formData.kg ? (parseFloat(formData.kg) * (latestPrice || 0)).toLocaleString() : '0'}
                 </p>
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
