'use client';

import { useState, useEffect } from 'react';
import { pb, getCurrentUser, AuthModel } from '@/lib/pocketbase';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
  DollarSign, 
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Calendar,
  Building,
  Package,
  User,
  Receipt,
  Download,
  Printer,
  X,
  Mail,
  Phone,
  MapPin,
  CreditCard
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
  odeme_tamamlandi: boolean;
  created: string;
  updated: string;
  expand?: {
    user?: { 
      name: string; 
      email: string; 
      phone?: string; 
      city?: string; 
      address?: string; 
      iban?: string; 
    };
    factory?: { name: string };
    price?: { price: number };
  };
}

export default function PaymentsPage() {
  const [deliveries, setDeliveries] = useState<DeliveryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryData | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  const currentUser = getCurrentUser();

  // Tüm teslimatları çek (sadece tamamlandı olanlar)
  const fetchDeliveries = async () => {
    setIsLoading(true);
    try {
      const records = await pb.collection('deliveries').getList(1, 100, {
        sort: '-created',
        expand: 'user,factory,price',
        filter: 'tamamlandi = true',
        fields: 'id,kg,user,factory,price,factory_price,delivery_date,tamamlandi,randiman,odeme_tamamlandi,created,updated,expand.user.id,expand.user.name,expand.user.email,expand.user.phone,expand.user.city,expand.user.address,expand.user.iban,expand.factory.name,expand.price.price'
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
        odeme_tamamlandi: item.odeme_tamamlandi || false,
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

  useEffect(() => {
    fetchDeliveries();
  }, []);

  // Ödeme durumunu toggle yap
  const togglePaymentStatus = async (deliveryId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      await pb.collection('deliveries').update(deliveryId, {
        odeme_tamamlandi: newStatus
      });
      
      toast.success(`Ödeme durumu ${newStatus ? 'tamamlandı' : 'bekliyor'} olarak güncellendi`);
      fetchDeliveries(); // Listeyi yenile
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      toast.error('Güncelleme başarısız');
    }
  };

  // Fiş gösterme
  const handleShowReceipt = (delivery: DeliveryData) => {
    if (!delivery.odeme_tamamlandi) {
      toast.error('Ödeme tamamlanmadan fiş görüntülenemez');
      return;
    }
    setSelectedDelivery(delivery);
    setShowReceipt(true);
  };

  // Fiş yazdır
  const handlePrintReceipt = () => {
    if (!selectedDelivery) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Ödeme Fişi</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 20px; }
              .title { font-size: 24px; font-weight: bold; }
              .info { margin: 10px 0; }
              .label { font-weight: bold; }
              .value { margin-left: 10px; }
              .total { font-size: 18px; font-weight: bold; border-top: 1px solid #000; padding-top: 20px; margin-top: 20px; }
              .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="title">TÜRKİYE FINDIK</div>
              <div>Ödeme Fişi</div>
            </div>
            
            <div class="info">
              <span class="label">Teslimat ID:</span>
              <span class="value">${selectedDelivery.id}</span>
            </div>
            
            <div class="info">
              <span class="label">Kullanıcı:</span>
              <span class="value">${selectedDelivery.expand?.user?.name || 'Bilinmiyor'}</span>
            </div>
            
            <div class="info">
              <span class="label">Email:</span>
              <span class="value">${selectedDelivery.expand?.user?.email || 'Email yok'}</span>
            </div>
            
            <div class="info">
              <span class="label">Fabrika:</span>
              <span class="value">${selectedDelivery.factory}</span>
            </div>
            
            <div class="info">
              <span class="label">Teslimat Tarihi:</span>
              <span class="value">${new Date(selectedDelivery.delivery_date).toLocaleDateString('tr-TR')}</span>
            </div>
            
            <div class="info">
              <span class="label">Fındık Kilosu:</span>
              <span class="value">${selectedDelivery.kg?.toLocaleString()} kg</span>
            </div>
            
            <div class="info">
              <span class="label">Randıman:</span>
              <span class="value">%${selectedDelivery.randiman || 0}</span>
            </div>
            
            <div class="info">
              <span class="label">Fabrika Fiyatı:</span>
              <span class="value">₺${(selectedDelivery.factory_price || 0).toLocaleString()}</span>
            </div>
            
            <div class="total">
              <span class="label">Toplam Tutar:</span>
              <span class="value">₺${((selectedDelivery.kg || 0) * (selectedDelivery.factory_price || 0)).toLocaleString()}</span>
            </div>
            
            <div class="footer">
              Bu fiş bilgisayar ortamında oluşturulmuştur.<br>
              Tarih: ${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR')}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Fiş indir (PDF benzeri)
  const handleDownloadReceipt = () => {
    if (!selectedDelivery) return;
    
    const receiptContent = `
TÜRKİYE FINDIK - Ödeme Fişi

Teslimat ID: ${selectedDelivery.id}
Kullanıcı: ${selectedDelivery.expand?.user?.name || 'Bilinmiyor'}
Email: ${selectedDelivery.expand?.user?.email || 'Email yok'}
Fabrika: ${selectedDelivery.factory}
Teslimat Tarihi: ${new Date(selectedDelivery.delivery_date).toLocaleDateString('tr-TR')}
Fındık Kilosu: ${selectedDelivery.kg?.toLocaleString()} kg
Randıman: %${selectedDelivery.randiman || 0}
Fabrika Fiyatı: ₺${(selectedDelivery.factory_price || 0).toLocaleString()}
Toplam Tutar: ₺${((selectedDelivery.kg || 0) * (selectedDelivery.factory_price || 0)).toLocaleString()}

Tarih: ${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR')}
    `;
    
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `odeme-fisi-${selectedDelivery.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Filtreleme ve arama
  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = 
      delivery.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.expand?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.expand?.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.factory.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'true' && delivery.odeme_tamamlandi) ||
      (statusFilter === 'false' && !delivery.odeme_tamamlandi);

    return matchesSearch && matchesStatus;
  });

  // İstatistikler
  const totalKg = deliveries.reduce((sum, d) => {
    const kg = Number(d.kg) || 0;
    return sum + kg;
  }, 0); 
   const totalFactoryPrice = deliveries.reduce((sum, d) => {
    const kg = Number(d.kg) || 0;
    const price = Number(d.factory_price) || 0;
    return sum + (1 * price);
  }, 0);  
  const completedPayments = filteredDeliveries.filter(d => d.odeme_tamamlandi).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
                         <h1 className="text-3xl font-bold text-gray-900">Ödemeler</h1>
             <p className="text-gray-600 mt-2">
                   Tamamlanan teslimatların ödeme durumunu yönet
             </p>
          </div>
          <Button onClick={fetchDeliveries} variant="outline" size="sm">
            <DollarSign className="mr-2 h-4 w-4" />
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <label className="text-sm font-medium">Ödeme Durumu</label>
                                 <select 
                   value={statusFilter} 
                   onChange={(e) => setStatusFilter(e.target.value)}
                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                 >
                   <option value="all">Tümü</option>
                   <option value="true">Tamamlandı</option>
                   <option value="false">Bekliyor</option>
                 </select>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                  className="w-full"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Filtreleri Temizle
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
               <CardTitle className="text-sm font-medium">Toplam Fabrika Fiyatı</CardTitle>
               <DollarSign className="h-4 w-4 text-muted-foreground" />
             </CardHeader>
             <CardContent>
               <div className="text-2xl font-bold">
                 ₺{totalFactoryPrice.toLocaleString()}
               </div>
               <p className="text-xs text-muted-foreground">
                 Toplam fabrika fiyatı
               </p>
             </CardContent>
           </Card>
        </div>

                 {/* Teslimat Listesi */}
         <Card>
           <CardHeader>
             <CardTitle>Teslimatlar</CardTitle>
             <CardDescription>
               Tamamlanan teslimatların ödeme durumu
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
                       <TableHead>ID</TableHead>
                       <TableHead>Kullanıcı</TableHead>
                       <TableHead>IBAN</TableHead>
                       <TableHead>Teslimat Tarihi</TableHead>
                       <TableHead>Kg</TableHead>
                       <TableHead>Fabrika</TableHead>
                       <TableHead>Fabrika Fiyatı</TableHead>
                       <TableHead>Randıman</TableHead>
                       <TableHead>Ödeme Durumu</TableHead>
                       <TableHead>İşlemler</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDeliveries.map((delivery) => (
                      <TableRow key={delivery.id}>
                        <TableCell className="font-mono text-xs">
                          {delivery.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          <div 
                            className="flex flex-col cursor-pointer hover:bg-gray-50 p-2 rounded"
                            onClick={() => {
                              setSelectedUser(delivery.expand?.user);
                              setShowUserModal(true);
                            }}
                          >
                            <span className="font-medium">
                              {delivery.expand?.user?.name || 'Bilinmiyor'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {delivery.expand?.user?.email || 'Email yok'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div 
                            className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded"
                            onClick={() => {
                              if (delivery.expand?.user?.iban) {
                                navigator.clipboard.writeText(delivery.expand.user.iban);
                                toast.success('IBAN panoya kopyalandı');
                              }
                            }}
                            title={delivery.expand?.user?.iban ? 'IBAN\'ı kopyalamak için tıklayın' : 'IBAN yok'}
                          >
                            <CreditCard className="mr-2 h-4 w-4 text-gray-500" />
                            <span className="text-sm font-mono">
                              {delivery.expand?.user?.iban || 'IBAN yok'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-blue-500" />
                            {new Date(delivery.delivery_date).toLocaleDateString('tr-TR')}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {delivery.kg?.toLocaleString()} kg
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Building className="mr-2 h-4 w-4 text-gray-500" />
                            {delivery.factory}
                          </div>
                        </TableCell>
                        <TableCell>
                          ₺{(delivery.factory_price || 0).toLocaleString()}
                        </TableCell>
                                                 <TableCell>
                           %{delivery.randiman || 0}
                         </TableCell>
                         <TableCell>
                           <div className="flex items-center space-x-2">
                             <Switch
                               id={`payment-${delivery.id}`}
                               checked={delivery.odeme_tamamlandi}
                               onCheckedChange={() => togglePaymentStatus(delivery.id, delivery.odeme_tamamlandi)}
                             />
                             <Label htmlFor={`payment-${delivery.id}`}>
                               {delivery.odeme_tamamlandi ? 'Tamamlandı' : 'Bekliyor'}
                             </Label>
                           </div>
                         </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                                                         <Button
                               size="sm"
                               variant="outline"
                               onClick={() => handleShowReceipt(delivery)}
                               disabled={!delivery.odeme_tamamlandi}
                               className="flex items-center space-x-1"
                               title={!delivery.odeme_tamamlandi ? 'Ödeme tamamlanmadan fiş görüntülenemez' : 'Fiş Görüntüle'}
                             >
                               <Receipt className="h-3 w-3" />
                               <span>Fiş</span>
                             </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
                             <div className="text-center py-8 text-gray-500">
                 {searchTerm || statusFilter !== 'all' 
                   ? 'Filtrelere uygun teslimat bulunamadı' 
                   : 'Henüz tamamlanan teslimat bulunmuyor'}
               </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ödeme Fişi Modal */}
      {selectedDelivery && showReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Ödeme Fişi</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReceipt(false)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="font-medium">Teslimat ID:</span>
                <span className="text-sm">{selectedDelivery.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Kullanıcı:</span>
                <span className="text-sm">{selectedDelivery.expand?.user?.name || 'Bilinmiyor'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Fabrika:</span>
                <span className="text-sm">{selectedDelivery.factory}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Fındık Kilosu:</span>
                <span className="text-sm">{selectedDelivery.kg?.toLocaleString()} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Randıman:</span>
                <span className="text-sm">%{selectedDelivery.randiman || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Fabrika Fiyatı:</span>
                <span className="text-sm">₺{(selectedDelivery.factory_price || 0).toLocaleString()}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-bold">
                  <span>Toplam Tutar:</span>
                  <span>₺{((selectedDelivery.kg || 0) * (selectedDelivery.factory_price || 0)).toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button onClick={handlePrintReceipt} className="flex-1">
                <Printer className="mr-2 h-4 w-4" />
                Yazdır
              </Button>
              <Button onClick={handleDownloadReceipt} variant="outline" className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                İndir
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Kullanıcı Detay Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center bg-black bg-opacity-75 z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Kullanıcı Bilgileri</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUserModal(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Kullanıcı Bilgileri */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Kişisel Bilgiler</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Ad Soyad</p>
                        <p className="text-gray-600">{selectedUser.name || 'Belirtilmemiş'}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">E-posta</p>
                        <p className="text-gray-600">{selectedUser.email || 'Belirtilmemiş'}</p>
                      </div>
                    </div>

                    {selectedUser.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Telefon</p>
                          <p className="text-gray-600">{selectedUser.phone}</p>
                        </div>
                      </div>
                    )}

                    {selectedUser.city && (
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Şehir</p>
                          <p className="text-gray-600">{selectedUser.city}</p>
                        </div>
                      </div>
                    )}

                    {selectedUser.address && (
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Tam Adres</p>
                          <p className="text-gray-600">{selectedUser.address}</p>
                        </div>
                      </div>
                    )}

                    {selectedUser.iban && (
                      <div className="flex items-center space-x-3">
                        <CreditCard className="h-5 w-5 text-gray-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">IBAN</p>
                          <p 
                            className="text-gray-600 font-mono cursor-pointer hover:bg-gray-50 p-2 rounded"
                            onClick={() => {
                              navigator.clipboard.writeText(selectedUser.iban);
                              toast.success('IBAN panoya kopyalandı');
                            }}
                            title="IBAN'ı kopyalamak için tıklayın"
                          >
                            {selectedUser.iban}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <Button 
                  onClick={() => setShowUserModal(false)}
                  className="w-full"
                >
                  Kapat
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
