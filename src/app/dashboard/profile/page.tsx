'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getCurrentUser, pb, AuthModel } from '@/lib/pocketbase';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Camera, Save, User } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
  email: z.string().email('Geçerli bir email adresi girin'),
  phone: z.string().min(10, 'Telefon numarası en az 10 karakter olmalıdır'),
  tc: z.string().min(11, 'TC kimlik numarası 11 karakter olmalıdır').max(11),
  city: z.string().min(1, 'Şehir seçiniz'),
  iban: z.string().min(1, 'IBAN giriniz'),
});

type ProfileForm = z.infer<typeof profileSchema>;

interface City {
  [key: string]: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<AuthModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      tc: '',
      city: '',
      iban: '',
    },
  });

  // Şehirleri yerel JSON'dan çek
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch('/iller.json');
        const data = await response.json();
        setCities(data);
      } catch (error) {
        console.error('Şehirler yüklenirken hata:', error);
        toast.error('Şehirler yüklenemedi');
      }
    };

    fetchCities();
  }, []);

  // Kullanıcı bilgilerini yükle
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      form.reset({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        tc: currentUser.tc || '',
        city: currentUser.city || '',
        iban: currentUser.iban || '',
      });
      setSelectedCity(currentUser.city || '');
    }
  }, [form]);



  const onSubmit = async (data: ProfileForm) => {
    setIsLoading(true);
    try {
      const record = await pb.collection('users').update(user.id, {
        name: data.name,
        email: data.email,
        phone: data.phone,
        tc: data.tc,
        city: data.city,
        iban: data.iban,
      });
      
      toast.success('Profil başarıyla güncellendi!');
      setUser(record);
    } catch (error: any) {
      toast.error(error.message || 'Profil güncellenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      await pb.collection('users').update(user.id, formData);
      toast.success('Profil fotoğrafı güncellendi!');
      
      // Kullanıcı bilgilerini yenile
      const updatedUser = getCurrentUser();
      setUser(updatedUser);
    } catch (error: any) {
      toast.error('Profil fotoğrafı güncellenemedi');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profil</h1>
          <p className="text-gray-600 mt-2">
            Kişisel bilgilerinizi güncelleyin
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profil Fotoğrafı */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Profil Fotoğrafı</CardTitle>
              <CardDescription>
                Profil fotoğrafınızı güncelleyin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user?.avatar ? pb.files.getUrl(user, user.avatar) : ''} />
                  <AvatarFallback className="text-lg">
                    {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-2">
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <label htmlFor="avatar-upload">
                    <Button variant="outline" className="w-full" asChild>
                      <span>
                        <Camera className="mr-2 h-4 w-4" />
                        Fotoğraf Değiştir
                      </span>
                    </Button>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profil Bilgileri */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Kişisel Bilgiler</CardTitle>
              <CardDescription>
                Temel bilgilerinizi güncelleyin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Ad Soyad</Label>
                    <Input
                      id="name"
                      {...form.register('name')}
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register('email')}
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      {...form.register('phone')}
                    />
                    {form.formState.errors.phone && (
                      <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tc">TC Kimlik No</Label>
                    <Input
                      id="tc"
                      {...form.register('tc')}
                    />
                    {form.formState.errors.tc && (
                      <p className="text-sm text-red-500">{form.formState.errors.tc.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">Şehir</Label>
                    <Select
                      value={selectedCity}
                                             onValueChange={(value) => {
                         setSelectedCity(value);
                         form.setValue('city', value);
                       }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Şehir seçiniz" />
                      </SelectTrigger>
                                             <SelectContent>
                         <div className="p-2">
                           <Input
                             placeholder="Şehir ara..."
                             value={searchTerm}
                             onChange={(e) => setSearchTerm(e.target.value)}
                             className="mb-2"
                           />
                         </div>
                         {Object.entries(cities)
                           .filter(([id, name]) => 
                             name.toLowerCase().includes(searchTerm.toLowerCase())
                           )
                           .map(([id, name]) => (
                             <SelectItem key={id} value={name}>
                               {name}
                             </SelectItem>
                           ))}
                       </SelectContent>
                    </Select>
                    {form.formState.errors.city && (
                      <p className="text-sm text-red-500">{form.formState.errors.city.message}</p>
                    )}
                  </div>

                  
                </div>

                <div className="space-y-2">
                  <Label htmlFor="iban">IBAN</Label>
                  <Input
                    id="iban"
                    {...form.register('iban')}
                  />
                  {form.formState.errors.iban && (
                    <p className="text-sm text-red-500">{form.formState.errors.iban.message}</p>
                  )}
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Güncelleniyor...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Profili Güncelle
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
