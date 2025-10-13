'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { pb } from '@/lib/pocketbase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TermsOfServiceDialog, PrivacyPolicyDialog } from '@/components/legal/legal-dialogs';

// İller verisi
const iller = {
    "1": "ADANA", "2": "ADIYAMAN", "3": "AFYONKARAHİSAR", "4": "AĞRI", "5": "AMASYA",
    "6": "ANKARA", "7": "ANTALYA", "8": "ARTVİN", "9": "AYDIN", "10": "BALIKESİR",
    "11": "BİLECİKK", "12": "BİNGÖL", "13": "BİTLİS", "14": "BOLU", "15": "BURDUR",
    "16": "BURSA", "17": "ÇANAKKALE", "18": "ÇANKIRI", "19": "ÇORUM", "20": "DENİZLİ",
    "21": "DİYARBAKIR", "22": "EDİRNE", "23": "ELAZIĞ", "24": "ERZİNCAN", "25": "ERZURUM",
    "26": "ESKİŞEHİR", "27": "GAZİANTEP", "28": "GİRESUN", "29": "GÜMÜŞHANE", "30": "HAKKARİ",
    "31": "HATAY", "32": "ISPARTA", "33": "MERSİN", "34": "İSTANBUL", "35": "İZMİR",
    "36": "KARS", "37": "KASTAMONU", "38": "KAYSERİ", "39": "KIRKLARELİ", "40": "KIRŞEHİR",
    "41": "KOCAELİ", "42": "KONYA", "43": "KÜTAHYA", "44": "MALATYA", "45": "MANİSA",
    "46": "KAHRAMANMARAŞ", "47": "MARDİN", "48": "MUĞLA", "49": "MUŞ", "50": "NEVŞEHİR",
    "51": "NİĞDE", "52": "ORDU", "53": "RİZE", "54": "SAKARYA", "55": "SAMSUN",
    "56": "SİİRT", "57": "SİNOP", "58": "SİVAS", "59": "TEKİRDAĞ", "60": "TOKAT",
    "61": "TRABZON", "62": "TUNCELİ", "63": "ŞANLIURFA", "64": "UŞAK", "65": "VAN",
    "66": "YOZGAT", "67": "ZONGULDAK", "68": "AKSARAY", "69": "BAYBURT", "70": "KARAMAN",
    "71": "KIRIKKALE", "72": "BATMAN", "73": "ŞIRNAK", "74": "BARTIN", "75": "ARDAHAN",
    "76": "IĞDIR", "77": "YALOVA", "78": "KARABüK", "79": "KİLİS", "80": "OSMANİYE",
    "81": "DÜZCE"
};

const userRegisterSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
  email: z.string().email('Geçerli bir email adresi girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
  passwordConfirm: z.string(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "Kullanım sözleşmesini kabul etmelisiniz",
  }),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Şifreler eşleşmiyor",
  path: ["passwordConfirm"],
});

const factoryRegisterSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
  email: z.string().email('Geçerli bir email adresi girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
  passwordConfirm: z.string(),
  phone: z.string().min(10, 'Telefon numarası en az 10 karakter olmalıdır'),
  city: z.string().min(2, 'Şehir en az 2 karakter olmalıdır'),
  files: z.any() // Use z.any() to avoid server-side `FileList` reference error
    .refine((files) => files instanceof FileList && files.length > 0, 'En az bir dosya yüklemelisiniz.')
    .refine((files) => {
      for (const file of Array.from(files)) {
        const fileType = file.type;
        if (!['application/pdf', 'image/png', 'image/jpeg'].includes(fileType)) {
          return false;
        }
      }
      return true;
    }, 'Sadece PDF, PNG ve JPEG dosyaları yüklenebilir.'),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "Kullanım sözleşmesini kabul etmelisiniz",
  }),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Şifreler eşleşmiyor",
  path: ["passwordConfirm"],
});

type UserRegisterForm = z.infer<typeof userRegisterSchema>;
type FactoryRegisterForm = z.infer<typeof factoryRegisterSchema>;

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [openCity, setOpenCity] = useState(false);

  const router = useRouter();

  const userForm = useForm<UserRegisterForm>({
    resolver: zodResolver(userRegisterSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      passwordConfirm: '',
      acceptTerms: false,
    },
  });

  const factoryForm = useForm<FactoryRegisterForm>({
    resolver: zodResolver(factoryRegisterSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      passwordConfirm: '',
      phone: '',
      city: '',
      files: undefined,
      acceptTerms: false,
    },
  });

  const onUserSubmit = async (data: UserRegisterForm) => {
    setIsLoading(true);
    try {
      const record = await pb.collection('users').create({
        name: data.name,
        email: data.email,
        password: data.password,
        passwordConfirm: data.passwordConfirm,
        role: 'user',
      });
      
      toast.success('Hesap başarıyla oluşturuldu! Giriş yapabilirsiniz.');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.message || 'Kayıt oluşturulamadı');
    } finally {
      setIsLoading(false);
    }
  };

  const onFactorySubmit = async (data: FactoryRegisterForm) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('passwordConfirm', data.passwordConfirm);
      formData.append('phone', data.phone);
      formData.append('city', data.city);
      formData.append('role', 'factory');

      for (const file of Array.from(data.files)) {
        formData.append('files', file);
      }
      
      const record = await pb.collection('users').create(formData);
      
      toast.success('Fabrika hesabı başarıyla oluşturuldu! Giriş yapabilirsiniz.');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.message || 'Kayıt oluşturulamadı');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Kayıt Ol</CardTitle>
        <CardDescription>
          Hesap türünü seçin ve bilgilerinizi girin
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="user" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="user">Kullanıcı</TabsTrigger>
            <TabsTrigger value="factory">Fabrika</TabsTrigger>
          </TabsList>
          
          <TabsContent value="user" className="space-y-4">
            <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user-name">Ad Soyad</Label>
                <Input
                  id="user-name"
                  type="text"
                  placeholder="Ad Soyad"
                  {...userForm.register('name')}
                />
                {userForm.formState.errors.name && (
                  <p className="text-sm text-red-500">{userForm.formState.errors.name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="user-email">Email</Label>
                <Input
                  id="user-email"
                  type="email"
                  placeholder="ornek@email.com"
                  {...userForm.register('email')}
                />
                {userForm.formState.errors.email && (
                  <p className="text-sm text-red-500">{userForm.formState.errors.email.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="user-password">Şifre</Label>
                <Input
                  id="user-password"
                  type="password"
                  placeholder="••••••••"
                  {...userForm.register('password')}
                />
                {userForm.formState.errors.password && (
                  <p className="text-sm text-red-500">{userForm.formState.errors.password.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="user-passwordConfirm">Şifre Tekrar</Label>
                <Input
                  id="user-passwordConfirm"
                  type="password"
                  placeholder="••••••••"
                  {...userForm.register('passwordConfirm')}
                />
                {userForm.formState.errors.passwordConfirm && (
                  <p className="text-sm text-red-500">{userForm.formState.errors.passwordConfirm.message}</p>
                )}
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="user-acceptTerms"
                  checked={userForm.watch('acceptTerms')}
                  onCheckedChange={(checked) => userForm.setValue('acceptTerms', checked as boolean)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="user-acceptTerms"
                    className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    <TermsOfServiceDialog>
                      <a href="#" className="text-blue-600 hover:underline cursor-pointer">Kullanım Sözleşmesi</a>
                    </TermsOfServiceDialog>
                    {' '}ve{' '}
                    <PrivacyPolicyDialog>
                      <a href="#" className="text-blue-600 hover:underline cursor-pointer">Gizlilik Politikası</a>
                    </PrivacyPolicyDialog>
                    &apos;nı okudum ve kabul ediyorum.
                  </Label>
                </div>
              </div>
              {userForm.formState.errors.acceptTerms && (
                <p className="text-sm text-red-500">{userForm.formState.errors.acceptTerms.message}</p>
              )}
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Kayıt oluşturuluyor...' : 'Kullanıcı Olarak Kayıt Ol'}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="factory" className="space-y-4">
            <form onSubmit={factoryForm.handleSubmit(onFactorySubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="factory-name">Fabrika Adı</Label>
                <Input
                  id="factory-name"
                  type="text"
                  placeholder="Fabrika Adı"
                  {...factoryForm.register('name')}
                />
                {factoryForm.formState.errors.name && (
                  <p className="text-sm text-red-500">{factoryForm.formState.errors.name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="factory-email">Email</Label>
                <Input
                  id="factory-email"
                  type="email"
                  placeholder="fabrika@email.com"
                  {...factoryForm.register('email')}
                />
                {factoryForm.formState.errors.email && (
                  <p className="text-sm text-red-500">{factoryForm.formState.errors.email.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="factory-phone">Telefon</Label>
                <Input
                  id="factory-phone"
                  type="tel"
                  placeholder="0555 123 45 67"
                  {...factoryForm.register('phone')}
                />
                {factoryForm.formState.errors.phone && (
                  <p className="text-sm text-red-500">{factoryForm.formState.errors.phone.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="factory-city">Şehir</Label>
                <Popover open={openCity} onOpenChange={setOpenCity}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCity}
                      className="w-full justify-between"
                    >
                      {factoryForm.watch('city') || "Şehir seçin..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Şehir ara..." />
                      <CommandList className="max-h-[300px]">
                        <CommandEmpty>Şehir bulunamadı.</CommandEmpty>
                        <CommandGroup>
                          {Object.entries(iller).map(([id, name]) => (
                            <CommandItem
                              key={id}
                              value={name}
                              onSelect={(currentValue) => {
                                factoryForm.setValue('city', currentValue);
                                setOpenCity(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  factoryForm.watch('city') === name ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {factoryForm.formState.errors.city && (
                  <p className="text-sm text-red-500">{factoryForm.formState.errors.city.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="factory-files">Vergi Levhası / Belgeler</Label>
                <Input
                  id="factory-files"
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpeg,.jpg"
                  {...factoryForm.register('files')}
                />
                {factoryForm.formState.errors.files && (
                  <p className="text-sm text-red-500">{factoryForm.formState.errors.files.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="factory-password">Şifre</Label>
                <Input
                  id="factory-password"
                  type="password"
                  placeholder="••••••••"
                  {...factoryForm.register('password')}
                />
                {factoryForm.formState.errors.password && (
                  <p className="text-sm text-red-500">{factoryForm.formState.errors.password.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="factory-passwordConfirm">Şifre Tekrar</Label>
                <Input
                  id="factory-passwordConfirm"
                  type="password"
                  placeholder="••••••••"
                  {...factoryForm.register('passwordConfirm')}
                />
                {factoryForm.formState.errors.passwordConfirm && (
                  <p className="text-sm text-red-500">{factoryForm.formState.errors.passwordConfirm.message}</p>
                )}
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="factory-acceptTerms"
                  checked={factoryForm.watch('acceptTerms')}
                  onCheckedChange={(checked) => factoryForm.setValue('acceptTerms', checked as boolean)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="factory-acceptTerms"
                    className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    <TermsOfServiceDialog>
                      <a href="#" className="text-blue-600 hover:underline cursor-pointer">Kullanım Sözleşmesi</a>
                    </TermsOfServiceDialog>
                    {' '}ve{' '}
                    <PrivacyPolicyDialog>
                      <a href="#" className="text-blue-600 hover:underline cursor-pointer">Gizlilik Politikası</a>
                    </PrivacyPolicyDialog>
                    &apos;nı okudum ve kabul ediyorum.
                  </Label>
                </div>
              </div>
              {factoryForm.formState.errors.acceptTerms && (
                <p className="text-sm text-red-500">{factoryForm.formState.errors.acceptTerms.message}</p>
              )}
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Kayıt oluşturuluyor...' : 'Fabrika Olarak Kayıt Ol'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
        
        <div className="mt-4 text-center">
          <span className="text-sm text-gray-600">Zaten hesabınız var mı? </span>
          <a href="/login" className="text-sm text-blue-600 hover:underline">
            Giriş yap
          </a>
        </div>
      </CardContent>
    </Card>
  );
}