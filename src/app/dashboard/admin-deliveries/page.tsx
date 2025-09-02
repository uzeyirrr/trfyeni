'use client';

import { useState, useEffect } from 'react';
import { pb, getCurrentUser, AuthModel } from '@/lib/pocketbase';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Search,
  Filter,
  Edit,
  Save,
  X,
  Calendar,
  Building,
  Package,
  DollarSign,
  User,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface DeliveryData {
  id: string;
  kg: number;
  user: string;
  factory: string;
  price: number;
  factory_price: number;
  delivery_date: string;
  tamamlandi: boolean;
  randiman: number;
  odeme_tamamlandi: string;
  created: string;
  updated: string;
  expand?: {
    user?: { name: string; email: string };
    factory?: { name: string };
    price?: { price: number };
  };
}

interface UserData {
  id: string;
  name: string;
  email: string;
}

export default function AdminDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<DeliveryData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<DeliveryData>>({});
  const [selectedDeliveries, setSelectedDeliveries] = useState<string[]>([]);
  const [bulkEditData, setBulkEditData] = useState<Partial<DeliveryData>>({});
  const [showBulkEdit, setShowBulkEdit] = useState(false);

  const currentUser = getCurrentUser();

  // Admin kontrolü
  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      toast.error('Bu sayfaya erişim yetkiniz yok');
      window.location.href = '/dashboard';
    }
  }, [currentUser]);

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Erişim Reddedildi</h2>
            <p className="text-gray-600">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Tüm teslimatları çek
  const fetchDeliveries = async () => {
    setIsLoading(true);
    try {
      const records = await pb.collection('deliveries').getList(1, 100, {
        sort: '-created',
        expand: 'user,factory,price'
      });
      
      const processedDeliveries = records.items.map(item => ({
        id: item.id,
        kg: item.kg,
        user: item.user,
        factory: item.expand?.factory?.name || item.factory || 'Belirtilmemiş',
        price: item.expand?.price?.price || (typeof item.price === 'number' ? item.price : 0),
        factory_price: item.factory_price || 0,
        delivery_date: item.delivery_date || item.created,
        tamamlandi: item.tamamlandi || false,
        randiman: item.randiman || 0,
        odeme_tamamlandi: item.odeme_tamamlandi || 'bekliyor',
        created: item.created,
        updated: item.updated,
        expand: item.expand
      }));
      
      setDeliveries(processedDeliveries as DeliveryData[]);
    } catch (error) {
      console.error('Teslimatlar yüklenirken hata:', error);
      toast.error('Teslimatlar yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  // Kullanıcıları çek
  const fetchUsers = async () => {
    try {
      const records = await pb.collection('users').getList(1, 100);
      setUsers(records.items.map(item => ({
        id: item.id,
        name: item.name || 'İsimsiz',
        email: item.email
      })));
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata:', error);
    }
  };

  useEffect(() => {
    fetchDeliveries();
    fetchUsers();
  }, []);

  // Düzenleme modunu başlat
  const startEditing = (delivery: DeliveryData) => {
    setEditingId(delivery.id);
    setEditData({
      kg: delivery.kg,
      factory_price: delivery.factory_price,
      tamamlandi: delivery.tamamlandi,
      randiman: delivery.randiman,
      odeme_tamamlandi: delivery.odeme_tamamlandi,
      delivery_date: delivery.delivery_date
    });
  };

  // Düzenlemeyi iptal et
  const cancelEditing = () => {
    setEditingId(null);
    setEditData({});
  };

  // Değişiklikleri kaydet
  const saveChanges = async (id: string) => {
    try {
      await pb.collection('deliveries').update(id, editData);
      toast.success('Teslimat güncellendi');
      setEditingId(null);
      setEditData({});
      fetchDeliveries(); // Listeyi yenile
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      toast.error('Güncelleme başarısız');
    }
  };

  // Toplu güncelleme
  const handleBulkUpdate = async () => {
    if (selectedDeliveries.length === 0) {
      toast.error('Lütfen güncellenecek teslimatları seçin');
      return;
    }

    try {
      const updatePromises = selectedDeliveries.map(id => 
        pb.collection('deliveries').update(id, bulkEditData)
      );
      
      await Promise.all(updatePromises);
      toast.success(`${selectedDeliveries.length} teslimat güncellendi`);
      setSelectedDeliveries([]);
      setBulkEditData({});
      setShowBulkEdit(false);
      fetchDeliveries();
    } catch (error) {
      console.error('Toplu güncelleme hatası:', error);
      toast.error('Toplu güncelleme başarısız');
    }
  };

  // Teslimat seçimi
  const toggleDeliverySelection = (id: string) => {
    setSelectedDeliveries(prev => 
      prev.includes(id) 
        ? prev.filter(deliveryId => deliveryId !== id)
        : [...prev, id]
    );
  };

  // Tümünü seç/kaldır
  const toggleAllDeliveries = () => {
    if (selectedDeliveries.length === filteredDeliveries.length) {
      setSelectedDeliveries([]);
    } else {
      setSelectedDeliveries(filteredDeliveries.map(d => d.id));
    }
  };

  // Filtreleme ve arama
  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = 
      delivery.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.expand?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.expand?.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.factory.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'completed' && delivery.tamamlandi) ||
      (statusFilter === 'pending' && !delivery.tamamlandi);

    const matchesPayment = paymentFilter === 'all' || 
      delivery.odeme_tamamlandi === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  // İstatistikler
  const totalKg = deliveries.reduce((sum, delivery) => sum + (parseFloat(delivery.kg?.toString() || '0') || 0), 0);
  const totalValue = deliveries.reduce((sum, d) => {
    const kg = Number(d.kg) || 0;
    const price = Number(d.factory_price) || 0;
    return sum + (1 * price);
  }, 0);
  const completedDeliveries = filteredDeliveries.filter(d => d.tamamlandi).length;
  const pendingPayments = filteredDeliveries.filter(d => d.odeme_tamamlandi === 'bekliyor').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Teslimat Yönetimi</h1>
            <p className="text-gray-600 mt-2">
              Tüm teslimatları görüntüle, filtrele ve düzenle
            </p>
          </div>
          <Button onClick={fetchDeliveries} variant="outline" size="sm">
            <Truck className="mr-2 h-4 w-4" />
            Yenile
          </Button>
        </div>

        {/* Filtreler */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              Filtreler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium">Arama</label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Teslimat ID, kullanıcı, fabrika..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Durum</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="completed">Tamamlanan</SelectItem>
                    <SelectItem value="pending">Bekleyen</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Ödeme Durumu</label>
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="bekliyor">Bekliyor</SelectItem>
                    <SelectItem value="tamamlandi">Tamamlandı</SelectItem>
                    <SelectItem value="iptal">İptal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setPaymentFilter('all');
                  }}
                  className="w-full"
                >
                  <X className="mr-2 h-4 w-4" />
                  Filtreleri Temizle
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Teslimat</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredDeliveries.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Filtrelenmiş teslimat
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
              <CardTitle className="text-sm font-medium">Tamamlanan</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {completedDeliveries}
              </div>
              <p className="text-xs text-muted-foreground">
                Teslimat sayısı
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bekleyen Ödeme</CardTitle>
              <XCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {pendingPayments}
              </div>
              <p className="text-xs text-muted-foreground">
                Ödeme bekleyen
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

        {/* Toplu Düzenleme */}
        {selectedDeliveries.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Edit className="mr-2 h-4 w-4" />
                Toplu Düzenleme ({selectedDeliveries.length} teslimat seçildi)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium">Durum</label>
                  <Select 
                    value={bulkEditData.tamamlandi?.toString() || ''} 
                    onValueChange={(value) => setBulkEditData({
                      ...bulkEditData,
                      tamamlandi: value === 'true'
                    })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Durum seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Tamamlandı</SelectItem>
                      <SelectItem value="false">Bekliyor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Ödeme Durumu</label>
                  <Select 
                    value={bulkEditData.odeme_tamamlandi || ''} 
                    onValueChange={(value) => setBulkEditData({
                      ...bulkEditData,
                      odeme_tamamlandi: value
                    })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Ödeme durumu seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bekliyor">Bekliyor</SelectItem>
                      <SelectItem value="tamamlandi">Tamamlandı</SelectItem>
                      <SelectItem value="iptal">İptal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Fabrika Fiyatı</label>
                  <Input
                    type="number"
                    placeholder="Fabrika fiyatı"
                    value={bulkEditData.factory_price || ''}
                    onChange={(e) => setBulkEditData({
                      ...bulkEditData,
                      factory_price: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>

                <div className="flex items-end space-x-2">
                  <Button onClick={handleBulkUpdate} className="flex-1">
                    <Save className="mr-2 h-4 w-4" />
                    Toplu Güncelle
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedDeliveries([]);
                      setBulkEditData({});
                    }}
                  >
                    <X className="mr-2 h-4 w-4" />
                    İptal
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Teslimat Listesi */}
        <Card>
          <CardHeader>
            <CardTitle>Teslimat Listesi</CardTitle>
            <CardDescription>
              Tüm teslimatları görüntüle ve düzenle
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : filteredDeliveries.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <input
                          type="checkbox"
                          checked={selectedDeliveries.length === filteredDeliveries.length && filteredDeliveries.length > 0}
                          onChange={toggleAllDeliveries}
                          className="rounded border-gray-300"
                        />
                      </TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Kullanıcı</TableHead>
                      <TableHead>Teslimat Tarihi</TableHead>
                      <TableHead>Kg</TableHead>
                      <TableHead>Fabrika</TableHead>
                      <TableHead>Fiyat</TableHead>
                      <TableHead>Fabrika Fiyatı</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Randıman</TableHead>
                      <TableHead>Ödeme</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                                     <TableBody>
                     {filteredDeliveries.map((delivery) => (
                       <TableRow key={delivery.id}>
                         <TableCell>
                           <input
                             type="checkbox"
                             checked={selectedDeliveries.includes(delivery.id)}
                             onChange={() => toggleDeliverySelection(delivery.id)}
                             className="rounded border-gray-300"
                           />
                         </TableCell>
                         <TableCell className="font-mono text-xs">
                           {delivery.id.slice(0, 8)}...
                         </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {delivery.expand?.user?.name || 'Bilinmiyor'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {delivery.expand?.user?.email || 'Email yok'}
                            </span>
                          </div>
                        </TableCell>
                                                 <TableCell>
                           {editingId === delivery.id ? (
                             <Input
                               type="date"
                               value={editData.delivery_date ? new Date(editData.delivery_date).toISOString().split('T')[0] : ''}
                               onChange={(e) => setEditData({
                                 ...editData,
                                 delivery_date: e.target.value
                               })}
                               className="w-32"
                             />
                           ) : (
                             <div className="flex items-center">
                               <Calendar className="mr-2 h-4 w-4 text-blue-500" />
                               {new Date(delivery.delivery_date).toLocaleDateString('tr-TR')}
                             </div>
                           )}
                         </TableCell>
                                                 <TableCell className="font-medium">
                           {editingId === delivery.id ? (
                             <Input
                               type="number"
                               value={editData.kg || 0}
                               onChange={(e) => setEditData({
                                 ...editData,
                                 kg: parseFloat(e.target.value) || 0
                               })}
                               className="w-20"
                             />
                           ) : (
                             <span>{delivery.kg?.toLocaleString()} kg</span>
                           )}
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
                        <TableCell>
                          {editingId === delivery.id ? (
                            <Input
                              type="number"
                              value={editData.factory_price || 0}
                              onChange={(e) => setEditData({
                                ...editData,
                                factory_price: parseFloat(e.target.value) || 0
                              })}
                              className="w-20"
                            />
                          ) : (
                            <span>₺{(delivery.factory_price || 0).toLocaleString()}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingId === delivery.id ? (
                            <Select 
                              value={editData.tamamlandi?.toString() || 'false'} 
                              onValueChange={(value) => setEditData({
                                ...editData,
                                tamamlandi: value === 'true'
                              })}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">Tamamlandı</SelectItem>
                                <SelectItem value="false">Bekliyor</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              delivery.tamamlandi 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {delivery.tamamlandi ? 'Tamamlandı' : 'Bekliyor'}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingId === delivery.id ? (
                            <Input
                              type="number"
                              step="0.01"
                              value={editData.randiman || 0}
                              onChange={(e) => setEditData({
                                ...editData,
                                randiman: parseFloat(e.target.value) || 0
                              })}
                              className="w-20"
                            />
                          ) : (
                            <span>%{delivery.randiman || 0}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingId === delivery.id ? (
                            <Select 
                              value={editData.odeme_tamamlandi || 'bekliyor'} 
                              onValueChange={(value) => setEditData({
                                ...editData,
                                odeme_tamamlandi: value
                              })}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="bekliyor">Bekliyor</SelectItem>
                                <SelectItem value="tamamlandi">Tamamlandı</SelectItem>
                                <SelectItem value="iptal">İptal</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              delivery.odeme_tamamlandi === 'tamamlandi' 
                                ? 'bg-green-100 text-green-800'
                                : delivery.odeme_tamamlandi === 'iptal'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {delivery.odeme_tamamlandi === 'tamamlandi' ? 'Tamamlandı' :
                               delivery.odeme_tamamlandi === 'iptal' ? 'İptal' : 'Bekliyor'}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingId === delivery.id ? (
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                onClick={() => saveChanges(delivery.id)}
                                className="h-8 px-2"
                              >
                                <Save className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelEditing}
                                className="h-8 px-2"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEditing(delivery)}
                              className="flex items-center space-x-1"
                            >
                              <Edit className="h-3 w-3" />
                              <span>Düzenle</span>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {searchTerm || statusFilter !== 'all' || paymentFilter !== 'all' 
                  ? 'Filtrelere uygun teslimat bulunamadı' 
                  : 'Henüz teslimat bulunmuyor'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
