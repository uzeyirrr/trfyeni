'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, pb } from '@/lib/pocketbase';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Package, 
  TrendingUp, 
  DollarSign,
  Activity,
  ShoppingCart,
  Truck,
  Factory,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  UserCheck,
  Building2,
  BarChart3,
  FileText,
  Download
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalUsers: number;
  totalDeliveries: number;
  totalFactories: number;
  totalRevenue: number;
  pendingDeliveries: number;
  completedDeliveries: number;
  pendingPayments: number;
  completedPayments: number;
}

interface RecentDelivery {
  id: string;
  kg: number;
  user: string;
  factory: string;
  delivery_date: string;
  tamamlandi: boolean;
  odeme_tamamlandi: boolean;
  created: string;
}

interface RecentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  city?: string;
  created: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name?: string; email?: string; role?: string } | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalDeliveries: 0,
    totalFactories: 0,
    totalRevenue: 0,
    pendingDeliveries: 0,
    completedDeliveries: 0,
    pendingPayments: 0,
    completedPayments: 0,
  });
  const [recentDeliveries, setRecentDeliveries] = useState<RecentDelivery[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    
    // Rol bazlı yönlendirme
    if (currentUser?.role === 'user') {
      router.push('/dashboard/user-dashboard');
      return;
    } else if (currentUser?.role === 'factory') {
      router.push('/dashboard/factory-dashboard');
      return;
    }
    
    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      // Kullanıcı istatistikleri
      const usersResponse = await pb.collection('users').getList(1, 1);
      const totalUsers = usersResponse.totalItems;

      // Teslimat istatistikleri
      const deliveriesResponse = await pb.collection('deliveries').getList(1, 1000);
      const deliveries = deliveriesResponse.items;
      
      const totalDeliveries = deliveries.length;
      const pendingDeliveries = deliveries.filter(d => !d.tamamlandi).length;
      const completedDeliveries = deliveries.filter(d => d.tamamlandi).length;
      const pendingPayments = deliveries.filter(d => d.tamamlandi && !d.odeme_tamamlandi).length;
      const completedPayments = deliveries.filter(d => d.odeme_tamamlandi).length;

              // Toplam gelir hesaplama (tamamlanan teslimatlar)
        const totalRevenue = deliveries
          .filter(d => d.tamamlandi)
          .reduce((sum, d) => sum + (1 * (d.factory_price || 0)), 0);

      // Fabrika sayısı
      const factoriesResponse = await pb.collection('users').getList(1, 1000, {
        filter: 'role = "factory"'
      });
      const totalFactories = factoriesResponse.totalItems;

      setStats({
        totalUsers,
        totalDeliveries,
        totalFactories,
        totalRevenue,
        pendingDeliveries,
        completedDeliveries,
        pendingPayments,
        completedPayments,
      });

      // Son teslimatlar
      const recentDeliveriesData = deliveries
        .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
        .slice(0, 5)
        .map(d => ({
          id: d.id,
          kg: d.kg,
          user: d.user || 'Bilinmeyen',
          factory: d.factory || 'Bilinmeyen',
          delivery_date: d.delivery_date,
          tamamlandi: d.tamamlandi,
          odeme_tamamlandi: d.odeme_tamamlandi,
          created: d.created,
        }));

      setRecentDeliveries(recentDeliveriesData);

      // Son kullanıcılar
      const recentUsersResponse = await pb.collection('users').getList(1, 5, {
        sort: '-created'
      });
      
      const recentUsersData = recentUsersResponse.items.map(u => ({
        id: u.id,
        name: u.name || 'İsimsiz',
        email: u.email,
        role: u.role || 'user',
        city: u.city,
        created: u.created,
      }));

      setRecentUsers(recentUsersData);
      setLoading(false);
    } catch (error) {
      console.error('Dashboard verisi yüklenirken hata:', error);
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { label: 'Admin', variant: 'destructive' as const, color: 'text-red-600' },
      user: { label: 'Kullanıcı', variant: 'default' as const, color: 'text-blue-600' },
      factory: { label: 'Fabrika', variant: 'secondary' as const, color: 'text-green-600' },
    };

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.user;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Dashboard yükleniyor...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                Hoş geldiniz, {user?.name || user?.email}!
              </h1>
              <p className="text-blue-100 mt-2">
                {user?.role === 'admin' ? 'Yönetici Paneli' : 
                 user?.role === 'factory' ? 'Fabrika Paneli' : 'Kullanıcı Paneli'}
              </p>
              <p className="text-blue-100 mt-1">
                Bugün nasıl gidiyor? İşte genel bakışınız.
              </p>
            </div>
            <div className="hidden md:block">
              <div className="text-right">
                <p className="text-2xl font-bold">{formatDate(new Date().toISOString())}</p>
                <p className="text-blue-100">Güncel Tarih</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Toplam Kullanıcı
              </CardTitle>
              <div className="p-2 rounded-lg bg-blue-100">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
              <p className="text-xs text-gray-500 mt-1">
                Sistemdeki aktif kullanıcılar
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Toplam Teslimat
              </CardTitle>
              <div className="p-2 rounded-lg bg-green-100">
                <Truck className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.totalDeliveries}</div>
              <p className="text-xs text-gray-500 mt-1">
                {stats.completedDeliveries} tamamlanan
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Toplam Gelir
              </CardTitle>
              <div className="p-2 rounded-lg bg-purple-100">
                <DollarSign className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(stats.totalRevenue)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Tamamlanan teslimatlar
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Fabrikalar
              </CardTitle>
              <div className="p-2 rounded-lg bg-orange-100">
                <Factory className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.totalFactories}</div>
              <p className="text-xs text-gray-500 mt-1">
                Aktif fabrika sayısı
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats for Admin */}
        {user?.role === 'admin' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-l-4 border-l-yellow-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Bekleyen Teslimatlar
                </CardTitle>
                <div className="p-2 rounded-lg bg-yellow-100">
                  <Clock className="h-4 w-4 text-yellow-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pendingDeliveries}</div>
                <p className="text-xs text-gray-500 mt-1">
                  Tamamlanmayı bekleyen
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Bekleyen Ödemeler
                </CardTitle>
                <div className="p-2 rounded-lg bg-red-100">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.pendingPayments}</div>
                <p className="text-xs text-gray-500 mt-1">
                  Ödeme bekleyen teslimatlar
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-emerald-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Tamamlanan Ödemeler
                </CardTitle>
                <div className="p-2 rounded-lg bg-emerald-100">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">{stats.completedPayments}</div>
                <p className="text-xs text-gray-500 mt-1">
                  Ödemesi tamamlanan
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Deliveries */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Son Teslimatlar</CardTitle>
                  <CardDescription>
                    Sistemdeki son teslimatları görüntüleyin
                  </CardDescription>
                </div>
                <Link href="/dashboard/deliveries">
                  <Button variant="outline" size="sm">
                    Tümünü Gör
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentDeliveries.length > 0 ? (
                  recentDeliveries.map((delivery) => (
                    <div key={delivery.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${delivery.tamamlandi ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                        <div>
                          <p className="text-sm font-medium">
                            {delivery.kg} kg - {delivery.user}
                          </p>
                          <p className="text-xs text-gray-500">
                            Fabrika: {delivery.factory} • {formatDate(delivery.delivery_date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {delivery.tamamlandi && (
                          <Badge variant={delivery.odeme_tamamlandi ? "default" : "secondary"}>
                            {delivery.odeme_tamamlandi ? 'Ödendi' : 'Ödeme Bekliyor'}
                          </Badge>
                        )}
                        <span className="text-xs text-gray-400">
                          {formatDate(delivery.created)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Henüz teslimat bulunmuyor</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions & Recent Users */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Hızlı İşlemler</CardTitle>
                <CardDescription>
                  Sık kullanılan işlemlerinize hızlı erişim
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/dashboard/deliveries">
                  <Button className="w-full justify-start" variant="outline">
                    <Truck className="mr-2 h-4 w-4" />
                    Teslimat Ekle
                  </Button>
                </Link>
                
                {user?.role === 'admin' && (
                  <>
                    <Link href="/dashboard/users">
                      <Button className="w-full justify-start" variant="outline">
                        <Users className="mr-2 h-4 w-4" />
                        Kullanıcı Yönetimi
                      </Button>
                    </Link>
                    <Link href="/dashboard/admin-deliveries">
                      <Button className="w-full justify-start" variant="outline">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Tüm Teslimatlar
                      </Button>
                    </Link>
                  </>
                )}

                {user?.role === 'factory' && (
                  <Link href="/dashboard/factory-deliveries">
                    <Button className="w-full justify-start" variant="outline">
                      <Factory className="mr-2 h-4 w-4" />
                      Fabrika Teslimatları
                    </Button>
                  </Link>
                )}

                <Link href="/dashboard/prices">
                  <Button className="w-full justify-start" variant="outline">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Fındık Fiyatları
                  </Button>
                </Link>

                <Link href="/dashboard/payments">
                  <Button className="w-full justify-start" variant="outline">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Ödemeler
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Users (Admin only) */}
            {user?.role === 'admin' && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Son Kullanıcılar</CardTitle>
                      <CardDescription>
                        Sisteme son kayıt olan kullanıcılar
                      </CardDescription>
                    </div>
                    <Link href="/dashboard/users">
                      <Button variant="outline" size="sm">
                        Tümünü Gör
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentUsers.map((user) => (
                      <div key={user.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="" alt={user.name} />
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                            {user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{user.name}</p>
                          <div className="flex items-center space-x-2">
                            {getRoleBadge(user.role)}
                            {user.city && (
                              <span className="text-xs text-gray-500 flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {user.city}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>Sistem Durumu</CardTitle>
            <CardDescription>
              Platform genel durumu ve performans bilgileri
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">Sistem Aktif</p>
                  <p className="text-xs text-green-600">Tüm servisler çalışıyor</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <Activity className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Performans</p>
                  <p className="text-xs text-blue-600">Yüksek hız ve güvenilirlik</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <UserCheck className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-purple-800">Güvenlik</p>
                  <p className="text-xs text-purple-600">SSL korumalı bağlantı</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
