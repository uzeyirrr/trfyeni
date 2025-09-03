'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Package, 
  Truck, 
  DollarSign, 
  TrendingUp,
  Calendar,
  BarChart3,
  CheckCircle,
  Clock,
  AlertCircle,
  MapPin,
  Weight,
  Eye
} from 'lucide-react';
import { getCurrentUser, type AuthModel } from '@/lib/pocketbase';
import { pb } from '@/lib/pocketbase';

interface Delivery {
  id: string;
  created: string;
  updated: string;
  user: string;
  factory: string;
  kg: number;
  price: string;
  delivery_date: string;
  tamamlandi: boolean;
  odeme_tamamlandi: boolean;
  factory_price: number;
  factory_name?: string;
}

export default function UserDashboardPage() {
  const [user, setUser] = useState<AuthModel | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDeliveries: 0,
    totalWeight: 0,
    totalEarnings: 0,
    pendingDeliveries: 0,
    completedDeliveries: 0,
    monthlyEarnings: 0
  });

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      fetchUserDeliveries(currentUser.id);
    }
  }, []);

  const fetchUserDeliveries = async (userId: string) => {
    try {
      setLoading(true);
             const records = await pb.collection('deliveries').getList(1, 50, {
         filter: `user = "${userId}"`,
         expand: 'factory',
         sort: '-created'
       });

               const deliveriesData = records.items.map((item: Record<string, any>) => ({
         id: item.id,
         created: item.created,
         updated: item.updated,
         user: item.user,
         factory: item.factory,
         kg: item.kg || 0,
         price: item.price || '',
         delivery_date: item.delivery_date,
         tamamlandi: item.tamamlandi || false,
         odeme_tamamlandi: item.odeme_tamamlandi || false,
         factory_price: item.factory_price || 0,
         factory_name: item.expand?.factory?.name || 'Bilinmeyen Fabrika'
       }));

      setDeliveries(deliveriesData);
      calculateStats(deliveriesData);
    } catch (error) {
      console.error('Teslimatlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (deliveriesData: Delivery[]) => {
    const totalDeliveries = deliveriesData.length;
    const totalWeight = deliveriesData.reduce((sum, d) => sum + (parseFloat(d.kg?.toString() || '0') || 0), 0);
    const totalEarnings = deliveriesData.reduce((sum, d) => sum + ( 1 * (d.factory_price || 0)), 0);
    const pendingDeliveries = deliveriesData.filter(d => !d.tamamlandi).length;
    const completedDeliveries = deliveriesData.filter(d => d.tamamlandi).length;
    
    // Bu ayki kazanç
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyEarnings = deliveriesData
      .filter(d => {
        const deliveryDate = new Date(d.delivery_date);
        return deliveryDate.getMonth() === currentMonth && 
               deliveryDate.getFullYear() === currentYear;
      })
      .reduce((sum, d) => sum + (d.factory_price || 0), 0);

    setStats({
      totalDeliveries,
      totalWeight,
      totalEarnings,
      pendingDeliveries,
      completedDeliveries,
      monthlyEarnings
    });
  };

  const getStatusBadge = (tamamlandi: boolean, odeme_tamamlandi: boolean) => {
    if (tamamlandi && odeme_tamamlandi) {
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Tamamlandı</Badge>;
    } else if (tamamlandi && !odeme_tamamlandi) {
      return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />Ödeme Bekliyor</Badge>;
    } else {
      return <Badge className="bg-yellow-100 text-yellow-800"><Truck className="w-3 h-3 mr-1" />İşlemde</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const formatCurrency = (amount: number) => {
    if (!amount || isNaN(amount)) return '₺0,00';
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Yükleniyor...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hoş Geldin, {user?.name || 'Kullanıcı'}!</h1>
          <p className="text-gray-600 mt-2">
            Teslimat istatistiklerin ve genel bakış
          </p>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Teslimat</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDeliveries}</div>
              <p className="text-xs text-muted-foreground">
                Tüm zamanlar
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Ağırlık</CardTitle>
              <Weight className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalWeight.toLocaleString('tr-TR')} kg</div>
              <p className="text-xs text-muted-foreground">
                Toplam teslim edilen
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Kazanç</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalEarnings)}</div>
              <p className="text-xs text-muted-foreground">
                Tüm zamanlar
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bu Ay</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.monthlyEarnings)}</div>
              <p className="text-xs text-muted-foreground">
                Bu ayki kazanç
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Teslimat Durumu */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Teslimat Durumu</CardTitle>
              <CardDescription>
                Güncel teslimat durumlarınız
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Tamamlanan</span>
                </div>
                <span className="text-lg font-bold text-green-600">{stats.completedDeliveries}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm font-medium">Bekleyen</span>
                </div>
                <span className="text-lg font-bold text-yellow-600">{stats.pendingDeliveries}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hızlı İşlemler</CardTitle>
              <CardDescription>
                Sık kullanılan işlemler
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline" asChild>
                <a href="/dashboard/deliveries">
                  <Package className="mr-2 h-4 w-4" />
                  Yeni Teslimat
                </a>
              </Button>
              
              <Button className="w-full justify-start" variant="outline" asChild>
                <a href="/dashboard/profile">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Profil Güncelle
                </a>
              </Button>
              
              <Button className="w-full justify-start" variant="outline" asChild>
                <a href="/dashboard/prices">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Fiyat Bilgileri
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Son Teslimatlar Tablosu */}
        <Card>
          <CardHeader>
            <CardTitle>Son Teslimatlar</CardTitle>
            <CardDescription>
              Son yapılan teslimatlarınızın listesi
            </CardDescription>
          </CardHeader>
          <CardContent>
            {deliveries.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Henüz teslimat bulunmuyor</p>
                <Button className="mt-4" asChild>
                  <a href="/dashboard/deliveries">İlk Teslimatınızı Yapın</a>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Fabrika</TableHead>
                    <TableHead>Ağırlık</TableHead>
                    <TableHead>Tutar</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>İşlem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                                     {deliveries.slice(0, 10).map((delivery) => (
                     <TableRow key={delivery.id}>
                       <TableCell>{formatDate(delivery.delivery_date)}</TableCell>
                       <TableCell>{delivery.factory_name}</TableCell>
                       <TableCell>{(delivery.kg || 0).toLocaleString('tr-TR')} kg</TableCell>
                                               <TableCell>{formatCurrency(delivery.factory_price || 0)}</TableCell>
                       <TableCell>{getStatusBadge(delivery.tamamlandi, delivery.odeme_tamamlandi)}</TableCell>
                       <TableCell>
                         <Button variant="ghost" size="sm" asChild>
                           <a href={`/dashboard/deliveries/${delivery.id}`}>
                             <Eye className="h-4 w-4" />
                           </a>
                         </Button>
                       </TableCell>
                     </TableRow>
                   ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}


