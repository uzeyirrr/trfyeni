'use client';

import { useState, useEffect } from 'react';
import { pb, getCurrentUser } from '@/lib/pocketbase';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { QRScanner } from '@/components/delivery/qr-scanner';
import { 
  Truck, 
  QrCode,
  CheckCircle,
  XCircle,
  Edit,
  Save,
  Package,
  DollarSign,
  Calculator,
  Search,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react';

interface DeliveryData {
  id: string;
  kg: number;
  user: string;
  factory: string;
  price: number;
  factory_price: number;
  delivery_date: string;
  created: string;
  updated: string;
  tamamlandi: boolean;
  randiman: number;
  expand?: {
    user?: {
      name: string;
      city: string;
    };
    price?: {
      price: number;
    };
  };
}

export default function FactoryDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<DeliveryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingDelivery, setEditingDelivery] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    kg: '',
    factory_price: '',
    randiman: '',
    saglam_ic: '',
    bezik_ic: '',
    numune_agirligi: '',
    tamamlandi: false
  });
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [sortBy, setSortBy] = useState<'created' | 'delivery_date' | 'kg' | 'factory_price'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const currentUser = getCurrentUser();

  // Teslimatları çek
  const fetchDeliveries = async () => {
    setIsLoading(true);
    try {
      const records = await pb.collection('deliveries').getList(1, 100, {
        sort: '-created',
        expand: 'user,price',
        filter: `factory = "${currentUser?.id}"`
      });
      
      const processedDeliveries = records.items.map(item => ({
        id: item.id,
        kg: item.kg,
        user: item.user,
        factory: item.factory,
        price: item.expand?.price?.price || 0,
        factory_price: item.factory_price || 0,
        delivery_date: item.delivery_date || item.created,
        created: item.created,
        updated: item.updated,
        tamamlandi: item.tamamlandi || false,
        randiman: item.randiman || 0,
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

  useEffect(() => {
    fetchDeliveries();
  }, []);

  // Randıman hesaplama fonksiyonu
  const calculateRandiman = (saglamIc: number, bezikIc: number, numuneAgirligi: number) => {
    if (numuneAgirligi === 0) return 0;
    return ((saglamIc + (bezikIc * 0.5)) / numuneAgirligi) * 100;
  };

  // Fabrika fiyatı hesaplama fonksiyonu
  const calculateFactoryPrice = (piyasaFiyati: number, randiman: number, kg: number) => {
    if (piyasaFiyati === 0 || randiman === 0 || kg === 0) return 0;
    return (piyasaFiyati / 50) * randiman * kg;
  };

  // Düzenleme modunu aç
  const handleEdit = (delivery: DeliveryData) => {
    setEditingDelivery(delivery.id);
    setEditForm({
      kg: delivery.kg.toString(),
      factory_price: delivery.factory_price.toString(),
      randiman: delivery.randiman.toString(),
      saglam_ic: '',
      bezik_ic: '',
      numune_agirligi: '',
      tamamlandi: delivery.tamamlandi
    });
  };

  // Randıman hesapla butonuna tıklama
  const handleCalculateRandiman = () => {
    const saglamIc = parseFloat(editForm.saglam_ic) || 0;
    const bezikIc = parseFloat(editForm.bezik_ic) || 0;
    const numuneAgirligi = parseFloat(editForm.numune_agirligi) || 0;
    
    if (numuneAgirligi === 0) {
      toast.error('Numune ağırlığı 0 olamaz');
      return;
    }
    
    const calculatedRandiman = calculateRandiman(saglamIc, bezikIc, numuneAgirligi);
    setEditForm({...editForm, randiman: calculatedRandiman.toFixed(2)});
    toast.success(`Randıman hesaplandı: %${calculatedRandiman.toFixed(2)}`);
  };

  // Fabrika fiyatı hesapla butonuna tıklama
  const handleCalculateFactoryPrice = () => {
    const piyasaFiyati = parseFloat(editForm.kg) ? 
      deliveries.find(d => d.id === editingDelivery)?.price || 0 : 0;
    const randiman = parseFloat(editForm.randiman) || 0;
    const kg = parseFloat(editForm.kg) || 0;
    
    if (piyasaFiyati === 0 || randiman === 0 || kg === 0) {
      toast.error('Piyasa fiyatı, randıman ve kg değerleri gerekli');
      return;
    }
    
    const calculatedFactoryPrice = calculateFactoryPrice(piyasaFiyati, randiman, kg);
    setEditForm({...editForm, factory_price: calculatedFactoryPrice.toFixed(2)});
    toast.success(`Fabrika fiyatı hesaplandı: ₺${calculatedFactoryPrice.toFixed(2)}`);
  };

  // Düzenlemeyi kaydet
  const handleSave = async (deliveryId: string) => {
    try {
      await pb.collection('deliveries').update(deliveryId, {
        kg: parseFloat(editForm.kg),
        factory_price: parseFloat(editForm.factory_price),
        randiman: parseFloat(editForm.randiman),
        tamamlandi: editForm.tamamlandi
      });
      
      toast.success('Teslimat güncellendi');
      setEditingDelivery(null);
      fetchDeliveries();
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      toast.error('Güncelleme başarısız');
    }
  };

  // Düzenlemeyi iptal et
  const handleCancel = () => {
    setEditingDelivery(null);
  };

  // QR kod ile teslimat bul
  const handleQRScan = (qrData: string) => {
    const delivery = deliveries.find(d => d.id === qrData);
    if (delivery) {
      // Teslimatı bul ve düzenleme moduna geç
      handleEdit(delivery);
      setQrScannerOpen(false);
      toast.success('Teslimat bulundu');
    } else {
      toast.error('Teslimat bulunamadı');
    }
  };

  // Filtreleri temizle
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSortBy('created');
    setSortOrder('desc');
  };

  // Filtreleme ve sıralama
  const filteredAndSortedDeliveries = deliveries
    .filter(delivery => {
      // Arama filtresi
      const searchMatch = searchTerm === '' || 
        delivery.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.expand?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.expand?.user?.city?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Durum filtresi
      const statusMatch = statusFilter === 'all' || 
        (statusFilter === 'completed' && delivery.tamamlandi) ||
        (statusFilter === 'pending' && !delivery.tamamlandi);
      
      return searchMatch && statusMatch;
    })
    .sort((a, b) => {
      let aValue: number, bValue: number;
      
      switch (sortBy) {
        case 'created':
          aValue = new Date(a.created).getTime();
          bValue = new Date(b.created).getTime();
          break;
        case 'delivery_date':
          aValue = new Date(a.delivery_date).getTime();
          bValue = new Date(b.delivery_date).getTime();
          break;
        case 'kg':
          aValue = a.kg;
          bValue = b.kg;
          break;
        case 'factory_price':
          aValue = a.factory_price;
          bValue = b.factory_price;
          break;
        default:
          aValue = new Date(a.created).getTime();
          bValue = new Date(b.created).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

// İstatistikler
const totalDeliveries = deliveries.length;
const completedDeliveries = deliveries.filter(d => d.tamamlandi).length;
const totalKg = deliveries.reduce((sum, d) => {
    const kg = Number(d.kg) || 0;
    return sum + kg;
  }, 0);
// Toplam Değer (kg * fabrika fiyatı)
const totalValue = deliveries.reduce((sum, d) => {
    const kg = Number(d.kg) || 0;
    const price = Number(d.factory_price) || 0;
    return sum + (1 * price);
  }, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fabrika Teslimatları</h1>
            <p className="text-gray-600 mt-2">
              Gelen teslimatları yönetin ve güncelleyin
            </p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={fetchDeliveries} variant="outline" size="sm">
              <Truck className="mr-2 h-4 w-4" />
              Yenile
            </Button>
            <Button 
              onClick={() => setQrScannerOpen(true)} 
              variant="outline" 
              size="sm"
            >
              <QrCode className="mr-2 h-4 w-4" />
              QR Oku
            </Button>
          </div>
        </div>

        {/* Arama ve Filtreleme */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Arama */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Teslimat ID, gönderen adı veya şehir..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Durum Filtresi */}
              <Select value={statusFilter} onValueChange={(value: 'all' | 'completed' | 'pending') => setStatusFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Durum seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="completed">Tamamlanan</SelectItem>
                  <SelectItem value="pending">Bekleyen</SelectItem>
                </SelectContent>
              </Select>

              {/* Sıralama Alanı */}
              <Select value={sortBy} onValueChange={(value: 'created' | 'delivery_date' | 'kg' | 'factory_price') => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sıralama alanı" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created">Oluşturulma Tarihi</SelectItem>
                  <SelectItem value="delivery_date">Teslimat Tarihi</SelectItem>
                  <SelectItem value="kg">Kg</SelectItem>
                  <SelectItem value="factory_price">Fabrika Fiyatı</SelectItem>
                </SelectContent>
              </Select>

              {/* Sıralama Yönü */}
              <div className="flex space-x-2">
                <Button
                  variant={sortOrder === 'asc' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortOrder('asc')}
                  className="flex-1"
                >
                  <SortAsc className="mr-2 h-4 w-4" />
                  Artan
                </Button>
                <Button
                  variant={sortOrder === 'desc' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortOrder('desc')}
                  className="flex-1"
                >
                  <SortDesc className="mr-2 h-4 w-4" />
                  Azalan
                </Button>
              </div>
            </div>
            
            {/* Filtreleri Temizle */}
            {(searchTerm || statusFilter !== 'all') && (
              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="text-gray-600"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filtreleri Temizle
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Teslimat</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDeliveries}</div>
              <p className="text-xs text-muted-foreground">Adet teslimat</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tamamlanan</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedDeliveries}</div>
              <p className="text-xs text-muted-foreground">Onaylanan teslimat</p>
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
              <p className="text-xs text-muted-foreground">Fabrika fiyatı ile</p>
            </CardContent>
          </Card>
        </div>

        {/* Teslimat Listesi */}
        <Card>
          <CardHeader>
            <CardTitle>Gelen Teslimatlar</CardTitle>
            <CardDescription>
              Size gelen tüm teslimatlar
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : filteredAndSortedDeliveries.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Gönderen</TableHead>
                    <TableHead>Kg</TableHead>
                    <TableHead>Piyasa Fiyatı</TableHead>
                    <TableHead>Fabrika Fiyatı</TableHead>
                    <TableHead>Randıman</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedDeliveries.map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell>
                        {new Date(delivery.delivery_date).toLocaleDateString('tr-TR')}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{delivery.expand?.user?.name || 'Bilinmiyor'}</div>
                          <div className="text-sm text-gray-500">{delivery.expand?.user?.city || 'Bilinmiyor'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {editingDelivery === delivery.id ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={editForm.kg}
                            onChange={(e) => setEditForm({...editForm, kg: e.target.value})}
                            className="w-20"
                          />
                        ) : (
                          <span className="font-medium">{delivery.kg.toLocaleString()} kg</span>
                        )}
                      </TableCell>
                      <TableCell>
                        ₺{delivery.price.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {editingDelivery === delivery.id ? (
                          <div className="space-y-2 min-w-[200px]">
                            <div className="flex items-center space-x-2">
                              <Input
                                type="number"
                                step="0.01"
                                value={editForm.factory_price}
                                onChange={(e) => setEditForm({...editForm, factory_price: e.target.value})}
                                className="w-32"
                                placeholder="₺"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCalculateFactoryPrice}
                                className="h-8 px-2 text-xs"
                              >
                                <Calculator className="h-3 w-3 mr-1" />
                                Hesapla
                              </Button>
                            </div>
                            <div className="text-xs text-gray-500">
                              Formül: (Piyasa ÷ 50) × Randıman × Kg
                            </div>
                          </div>
                        ) : (
                          <span className="font-medium">₺{delivery.factory_price.toLocaleString()}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingDelivery === delivery.id ? (
                          <div className="space-y-3 min-w-[400px]">
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <Label className="text-xs text-gray-600">Sağlam İç</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="Gram"
                                  value={editForm.saglam_ic}
                                  onChange={(e) => setEditForm({...editForm, saglam_ic: e.target.value})}
                                  className="w-full"
                                />
                              </div>
                              <div>
                                <Label className="text-xs text-gray-600">Bezik İç</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="Gram"
                                  value={editForm.bezik_ic}
                                  onChange={(e) => setEditForm({...editForm, bezik_ic: e.target.value})}
                                  className="w-full"
                                />
                              </div>
                              <div>
                                <Label className="text-xs text-gray-600">Numune</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="Gram"
                                  value={editForm.numune_agirligi}
                                  onChange={(e) => setEditForm({...editForm, numune_agirligi: e.target.value})}
                                  className="w-full"
                                />
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCalculateRandiman}
                                className="h-8 px-3 text-sm"
                              >
                                <Calculator className="h-4 w-4 mr-2" />
                                Randıman Hesapla
                              </Button>
                              <div className="flex items-center space-x-2">
                                <Label className="text-sm font-medium">Sonuç:</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={editForm.randiman}
                                  onChange={(e) => setEditForm({...editForm, randiman: e.target.value})}
                                  className="w-20 text-center font-medium"
                                  placeholder="%"
                                />
                                <span className="text-sm text-gray-500">%</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="font-medium">{delivery.randiman}%</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingDelivery === delivery.id ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`tamamlandi-${delivery.id}`}
                              checked={editForm.tamamlandi}
                              onChange={(e) => setEditForm({...editForm, tamamlandi: e.target.checked})}
                              className="rounded"
                            />
                            <Label htmlFor={`tamamlandi-${delivery.id}`}>
                              {editForm.tamamlandi ? 'Tamamlandı' : 'Bekliyor'}
                            </Label>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            {delivery.tamamlandi ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <XCircle className="h-5 w-5 text-yellow-600" />
                            )}
                            <span className={delivery.tamamlandi ? 'text-green-600' : 'text-yellow-600'}>
                              {delivery.tamamlandi ? 'Tamamlandı' : 'Bekliyor'}
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingDelivery === delivery.id ? (
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              onClick={() => handleSave(delivery.id)}
                              className="h-8 px-2"
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancel}
                              className="h-8 px-2"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(delivery)}
                            className="h-8 px-2"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : searchTerm || statusFilter !== 'all' ? (
              <div className="text-center py-8 text-gray-500">
                Arama kriterlerine uygun teslimat bulunamadı
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Henüz teslimat bulunmuyor
              </div>
            )}
          </CardContent>
        </Card>
      </div>

            {/* QR Scanner Modal */}
      <QRScanner
        isOpen={qrScannerOpen}
        onClose={() => setQrScannerOpen(false)}
        onScan={handleQRScan}
      />
    </DashboardLayout>
  );
}
