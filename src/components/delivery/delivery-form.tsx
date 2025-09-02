'use client';

import { useState, useEffect } from 'react';
import { pb, getCurrentUser, AuthModel } from '@/lib/pocketbase';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { X, Calendar, Building, Package, DollarSign } from 'lucide-react';

interface FactoryUser {
  id: string;
  name: string;
  city: string;
  role: string;
}

interface DeliveryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeliveryForm({ isOpen, onClose, onSuccess }: DeliveryFormProps) {
  const [factories, setFactories] = useState<FactoryUser[]>([]);
  const [latestPrice, setLatestPrice] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    kg: '',
    delivery_date: '',
    factory: ''
  });
  const [isVisible, setIsVisible] = useState(false);

  const currentUser = getCurrentUser();

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
      toast.error('Fabrikalar yüklenemedi');
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
    if (isOpen) {
      setIsVisible(true);
      fetchFactories();
      fetchLatestPrice();
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  // Form kapatma
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  // Form gönderimi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Son fiyatı tekrar çek (güncel olması için)
      const priceRecords = await pb.collection('price').getList(1, 1, {
        sort: '-created',
      });
      const currentPrice = priceRecords.items.length > 0 ? priceRecords.items[0].id : '';
      
      await pb.collection('deliveries').create({
        kg: parseFloat(formData.kg),
        user: currentUser?.id,
        factory: formData.factory,
        price: currentPrice,
        delivery_date: formData.delivery_date || new Date().toISOString()
      });
      
      toast.success('Teslimat başarıyla eklendi');
      setFormData({ kg: '', delivery_date: '', factory: '' });
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Teslimat eklenirken hata:', error);
      toast.error('Teslimat eklenemedi. Lütfen tüm alanları kontrol edin.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen && !isVisible) return null;

  return (
    <div className={`fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 transition-all duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 transition-all duration-200 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Yeni Teslimat Ekle</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="kg">Tahmini Fındık Kilosu (kg)</Label>
            <div className="relative">
              <Input
                id="kg"
                type="number"
                step="0.01"
                required
                value={formData.kg}
                onChange={(e) => setFormData({...formData, kg: e.target.value})}
                className="pl-10"
                placeholder="0.00"
              />
              <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          <div>
            <Label htmlFor="delivery_date">Tahmini Teslimat Tarihi</Label>
            <div className="relative">
              <Input
                id="delivery_date"
                type="date"
                required
                value={formData.delivery_date}
                onChange={(e) => setFormData({...formData, delivery_date: e.target.value})}
                className="pl-10"
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          <div>
            <Label htmlFor="factory">Fabrika Seçimi</Label>
            <div className="relative">
              <Select
                value={formData.factory}
                onValueChange={(value) => setFormData({...formData, factory: value})}
                required
              >
                <SelectTrigger className="pl-10">
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
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
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
                  onClick={handleClose}
                  className="flex-1"
                >
                  İptal
                </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Ekleniyor...' : 'Ekle'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
