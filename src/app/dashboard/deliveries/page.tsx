'use client';

import { useState, useEffect } from 'react';
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
import { DeliveryForm } from '@/components/delivery/delivery-form';
import { DeliveryReceipt } from '@/components/delivery/delivery-receipt';
import { toast } from 'sonner';
import { 
  Truck, 
  Plus,
  Calendar,
  Building,
  Package,
  DollarSign,
  Receipt
} from 'lucide-react';

interface DeliveryData {
  id: string;
  kg: number;
  user: string;
  factory: string; // Artık fabrika adı olacak
  price: number;
  price_type?: string; // Fındık türü
  delivery_date: string;
  created: string;
  updated: string;
}



export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<DeliveryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryData | null>(null);

  const currentUser = getCurrentUser();

  // Profil tamamlama kontrolü
  const calculateProfileCompletion = () => {
    if (!currentUser) return 0;

    const fields = [
      currentUser.name,
      currentUser.email,
      currentUser.phone,
      currentUser.tc,
      currentUser.city,
      currentUser.iban,
      currentUser.avatar
    ];

    const completedFields = fields.filter(field => {
      if (!field) return false;
      if (typeof field === 'string') {
        return field.trim() !== '';
      }
      return true;
    }).length;

    return Math.round((completedFields / fields.length) * 100);
  };

  const isProfileComplete = calculateProfileCompletion() === 100;

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
         price_type: item.expand?.price?.type || 'Belirtilmemiş',
         delivery_date: item.delivery_date || item.created,
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



  useEffect(() => {
    fetchDeliveries();
  }, []);

  // Yeni teslimat ekleme başarılı olduğunda
  const handleDeliverySuccess = () => {
    fetchDeliveries(); // Listeyi yenile
  };

  // Teslimat fişi gösterme
  const handleShowReceipt = (delivery: DeliveryData) => {
    setSelectedDelivery(delivery);
    setShowReceipt(true);
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
                         <Button 
               onClick={() => {
                 if (!isProfileComplete) {
                   toast.error('Teslimat oluşturmak için profilinizi tamamlamanız gerekiyor');
                   return;
                 }
                 setShowForm(true);
               }} 
               size="sm"
               disabled={!isProfileComplete}
               title={!isProfileComplete ? "Teslimat oluşturmak için profilinizi tamamlayın" : ""}
             >
               <Plus className="mr-2 h-4 w-4" />
               Yeni Teslimat
             </Button>
          </div>
                 </div>

         {/* Profil Tamamlama Uyarısı */}
         {!isProfileComplete && (
           <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
             <div className="flex items-center">
               <div className="flex-shrink-0">
                 <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                   <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                 </svg>
               </div>
               <div className="ml-3">
                 <h3 className="text-sm font-medium text-yellow-800">
                   Profil Tamamlanmamış
                 </h3>
                 <div className="mt-2 text-sm text-yellow-700">
                   <p>
                     Teslimat oluşturabilmek için profilinizi tamamlamanız gerekiyor. 
                     <a href="/dashboard/profile" className="font-medium underline hover:text-yellow-600 ml-1">
                       Profili tamamla
                     </a>
                   </p>
                 </div>
               </div>
             </div>
           </div>
         )}

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
                     <TableHead>Oluşturulma</TableHead>
                     <TableHead>Teslimat Tarihi</TableHead>
                     <TableHead>Kg</TableHead>
                     <TableHead>Fındık Bölgesi</TableHead>
                     <TableHead>Fabrika</TableHead>
                     <TableHead>Fiyat</TableHead>
                     <TableHead>Toplam</TableHead>
                     <TableHead>İşlemler</TableHead>
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
                       <TableCell>
                         <div className="flex items-center">
                           <Calendar className="mr-2 h-4 w-4 text-blue-500" />
                           {delivery.delivery_date ? new Date(delivery.delivery_date).toLocaleDateString('tr-TR') : new Date(delivery.created).toLocaleDateString('tr-TR')}
                         </div>
                       </TableCell>
                       <TableCell className="font-medium">
                         {(parseFloat(delivery.kg?.toString() || '0') || 0).toLocaleString()} kg
                       </TableCell>
                       <TableCell>
                         <div className="flex items-center">
                           <Package className="mr-2 h-4 w-4 text-gray-500" />
                           <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                             delivery.price_type === 'dogu_karadeniz' ? 'bg-blue-100 text-blue-800' :
                             delivery.price_type === 'bati_karadeniz' ? 'bg-red-100 text-red-800' :
                             delivery.price_type === 'giresun' ? 'bg-green-100 text-green-800' :
                             'bg-gray-100 text-gray-800'
                           }`}>
                             {delivery.price_type === 'dogu_karadeniz' ? 'Doğu Karadeniz' :
                              delivery.price_type === 'bati_karadeniz' ? 'Batı Karadeniz' :
                              delivery.price_type === 'giresun' ? 'Giresun' :
                              delivery.price_type || 'Belirtilmemiş'}
                           </span>
                         </div>
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
                       <TableCell>
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => handleShowReceipt(delivery)}
                           className="flex items-center space-x-1"
                         >
                           <Receipt className="h-4 w-4" />
                           <span>Fiş</span>
                         </Button>
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

      {/* Yeni Teslimat Form Component */}
      <DeliveryForm 
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={handleDeliverySuccess}
      />

      {/* Teslimat Fişi Component */}
      {selectedDelivery && (
        <DeliveryReceipt
          delivery={selectedDelivery}
          isOpen={showReceipt}
          onClose={() => {
            setShowReceipt(false);
            setSelectedDelivery(null);
          }}
        />
      )}
    </DashboardLayout>
  );
}
