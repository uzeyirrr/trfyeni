'use client';

import { useState, useEffect } from 'react';
import { pb, getCurrentUser, AuthModel } from '@/lib/pocketbase';
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
import { toast } from 'sonner';
import { 
  Truck, 
  Calendar,
  Building,
  Package,
  DollarSign,
  Users,
  TrendingUp,
  CheckCircle,
  Clock
} from 'lucide-react';

interface DeliveryData {
  id: string;
  kg: number;
  user: string;
  user_name?: string;
  factory: string;
  price: number;
  factory_price: number;
  delivery_date: string;
  tamamlandi: boolean;
  odeme_tamamlandi: boolean;
  randiman?: string;
  created: string;
  updated: string;
}

export default function FactoryDashboardPage() {
  const [deliveries, setDeliveries] = useState<DeliveryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser] = useState<AuthModel | null>(getCurrentUser());

  // Fabrikaya ait teslimatları çek
  const fetchFactoryDeliveries = async () => {
    if (!currentUser?.id) return;
    
    setIsLoading(true);
    try {
             const records = await pb.collection('deliveries').getList(1, 100, {
         sort: '-created',
         expand: 'user,price',
         filter: `factory = "${currentUser.id}"`
       });
      
      const processedDeliveries = records.items.map(item => ({
        id: item.id,
        kg: item.kg || 0,
        user: item.user,
        user_name: item.expand?.user?.name || 'Bilinmeyen Kullanıcı',
        factory: item.factory,
                 price: item.expand?.price?.price || 0,
        factory_price: item.factory_price || 0,
        delivery_date: item.delivery_date || item.created,
        tamamlandi: item.tamamlandi || false,
        odeme_tamamlandi: item.odeme_tamamlandi || false,
        randiman: item.randiman || '',
        created: item.created,
        updated: item.updated
      }));
      
      setDeliveries(processedDeliveries);
    } catch (error) {
      console.error('Teslimatlar yüklenirken hata:', error);
      toast.error('Teslimatlar yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFactoryDeliveries();
  }, [currentUser?.id]);

  // İstatistikler
  const totalKg = deliveries.reduce((sum, delivery) => sum + (parseFloat(delivery.kg?.toString() || '0') || 0), 0);
  const totalValue = deliveries.reduce((sum, delivery) => sum + (parseFloat(delivery.factory_price?.toString() || '0') || 0), 0);
  const completedDeliveries = deliveries.filter(d => d.tamamlandi).length;
  const pendingDeliveries = deliveries.filter(d => !d.tamamlandi).length;
  const paidDeliveries = deliveries.filter(d => d.odeme_tamamlandi).length;
  const uniqueUsers = new Set(deliveries.map(d => d.user)).size;
  const averageKg = deliveries.length > 0 ? totalKg / deliveries.length : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fabrika Dashboard</h1>
            <p className="text-gray-600 mt-2">
              {currentUser?.name} - Teslimat Yönetimi
            </p>
          </div>
          <Button onClick={fetchFactoryDeliveries} variant="outline" size="sm">
            <Truck className="mr-2 h-4 w-4" />
            Yenile
          </Button>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Teslimat</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deliveries.length}</div>
              <p className="text-xs text-muted-foreground">Adet teslimat</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Kg</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalKg.toLocaleString()} kg</div>
              <p className="text-xs text-muted-foreground">Toplam ağırlık</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Değer</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₺{totalValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Toplam değer</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktif Müşteri</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uniqueUsers}</div>
              <p className="text-xs text-muted-foreground">Benzersiz müşteri</p>
            </CardContent>
          </Card>
        </div>

        {/* Durum Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tamamlanan</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedDeliveries}</div>
              <p className="text-xs text-muted-foreground">Teslimat tamamlandı</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bekleyen</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingDeliveries}</div>
              <p className="text-xs text-muted-foreground">Teslimat bekliyor</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ödeme Tamamlanan</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{paidDeliveries}</div>
              <p className="text-xs text-muted-foreground">Ödeme yapıldı</p>
            </CardContent>
          </Card>
        </div>

        {/* Teslimat Listesi */}
        <Card>
          <CardHeader>
            <CardTitle>Son Teslimatlar</CardTitle>
            <CardDescription>
              Fabrikaya yapılan son teslimatlar
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
                    <TableHead>Müşteri</TableHead>
                    <TableHead>Kg</TableHead>
                                         <TableHead>Fiyat</TableHead>
                                         <TableHead>Fabrika Fiyatı</TableHead>
                     <TableHead>Durum</TableHead>
                    <TableHead>Ödeme</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveries.slice(0, 20).map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                          {new Date(delivery.delivery_date).toLocaleDateString('tr-TR')}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {delivery.user_name}
                      </TableCell>
                      <TableCell>
                        {delivery.kg.toLocaleString()} kg
                      </TableCell>
                      <TableCell>
                        ₺{delivery.price.toLocaleString()}
                      </TableCell>
                                             <TableCell>
                         ₺{delivery.factory_price.toLocaleString()}
                       </TableCell>
                       <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          delivery.tamamlandi 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {delivery.tamamlandi ? 'Tamamlandı' : 'Bekliyor'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          delivery.odeme_tamamlandi 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {delivery.odeme_tamamlandi ? 'Ödendi' : 'Bekliyor'}
                        </span>
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
    </DashboardLayout>
  );
}
