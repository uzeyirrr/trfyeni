'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { pb } from '@/lib/pocketbase';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { 
  FileText, 
  Upload, 
  X,
  Save,
  ArrowLeft,
  Eye,
  Download
} from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  role: 'user' | 'factory' | 'company' | 'admin';
  tc: string;
  city: string;
  files?: string[];
  iban: string;
  email: string;
  username: string;
  created: string;
  updated: string;
  factory_verified?: boolean;
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<UserData>>({});
  const [newAvatar, setNewAvatar] = useState<File | null>(null);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  const userId = params.id as string;

  // Kullanıcı verilerini çek
  const fetchUser = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const record = await pb.collection('users').getOne(userId);
      const userData: UserData = {
        id: record.id,
        name: record.name || '',
        phone: record.phone || '',
        avatar: record.avatar,
        role: record.role || 'user',
        tc: record.tc || '',
        city: record.city || '',
        files: record.files || [],
        iban: record.iban || '',
        email: record.email || '',
        username: record.username || '',
        created: record.created,
        updated: record.updated,
        factory_verified: record.factory_verified || false
      };
      
      setUser(userData);
      setFormData(userData);
    } catch (error) {
      console.error('Kullanıcı yüklenirken hata:', error);
      toast.error('Kullanıcı yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Form verilerini güncelle
  const handleInputChange = (field: keyof UserData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Avatar yükle
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewAvatar(file);
    }
  };

  // Dosya yükle
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setNewFiles(prev => [...prev, ...files]);
  };

  // Dosya kaldır
  const removeFile = (index: number) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Mevcut dosyayı kaldır
  const removeExistingFile = async (fileName: string) => {
    if (!user) return;
    
    try {
      const updatedFiles = user.files?.filter(name => name !== fileName) || [];
      await pb.collection('users').update(user.id, { files: updatedFiles });
      setUser(prev => prev ? { ...prev, files: updatedFiles } : null);
      setFormData(prev => ({ ...prev, files: updatedFiles }));
      toast.success('Dosya kaldırıldı');
    } catch (error) {
      console.error('Dosya kaldırılırken hata:', error);
      toast.error('Dosya kaldırılamadı');
    }
  };

  // Değişiklikleri kaydet
  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      // Güncellenebilir alanları seç (read-only alanları çıkar)
      const updateData: Record<string, string | boolean | string[] | undefined> = {
        name: formData.name,
        phone: formData.phone,
        role: formData.role,
        tc: formData.tc,
        city: formData.city,
        iban: formData.iban,
        factory_verified: formData.factory_verified
      };
      
      // Avatar yükle
      if (newAvatar) {
        const avatarFormData = new FormData();
        avatarFormData.append('avatar', newAvatar);
        const avatarRecord = await pb.collection('users').update(user.id, avatarFormData);
        updateData.avatar = avatarRecord.avatar;
      }
      
      // Yeni dosyaları yükle
      if (newFiles.length > 0) {
        const fileFormData = new FormData();
        newFiles.forEach(file => {
          fileFormData.append('files', file);
        });
        const fileRecord = await pb.collection('users').update(user.id, fileFormData);
        updateData.files = [...(user.files || []), ...(fileRecord.files || [])];
      }
      
      // Diğer verileri güncelle
      await pb.collection('users').update(user.id, updateData);
      
      toast.success('Kullanıcı güncellendi');
      setIsEditing(false);
      setNewAvatar(null);
      setNewFiles([]);
      fetchUser();
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      toast.error('Güncelleme başarısız');
    } finally {
      setIsSaving(false);
    }
  };

  // Dosya URL'si al
  const getFileUrl = (fileName: string) => {
    if (!user) return '';
    return `${pb.baseUrl}/api/files/users/${user.id}/${fileName}`;
  };
  
  // Avatar URL'si al
  const getAvatarUrl = () => {
    if (!user?.avatar) return undefined;
    return `${pb.baseUrl}/api/files/users/${user.id}/${user.avatar}`;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-gray-500">Kullanıcı bulunamadı</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Kullanıcı Detayı</h1>
              <p className="text-gray-600 mt-2">
                {user.name} - {user.email}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user.role === 'factory' && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="factory-verified"
                  checked={formData.factory_verified || false}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, factory_verified: checked }))}
                  disabled={!isEditing}
                />
                <Label htmlFor="factory-verified" className={isEditing ? "cursor-pointer" : "cursor-not-allowed opacity-60"}>
                  Fabrika Onaylı
                </Label>
              </div>
            )}
            
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                  >
                    İptal
                  </Button>
                  <Button 
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  Düzenle
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sol Kolon - Avatar ve Temel Bilgiler */}
          <div className="space-y-6">
            {/* Avatar */}
            <Card>
              <CardHeader>
                <CardTitle>Profil Fotoğrafı</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="relative inline-block">
                  <Avatar className="w-32 h-32 mx-auto mb-4">
                    <AvatarImage src={getAvatarUrl()} />
                    <AvatarFallback className="text-2xl">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <div className="mt-4">
                      <Label htmlFor="avatar-upload" className="cursor-pointer">
                        <div className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                          <Upload className="h-4 w-4" />
                          <span>Fotoğraf Değiştir</span>
                        </div>
                      </Label>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                      {newAvatar && (
                        <p className="text-sm text-green-600 mt-2">
                          Yeni fotoğraf seçildi: {newAvatar.name}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Rol ve Durum */}
            <Card>
              <CardHeader>
                <CardTitle>Rol ve Durum</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Rol</Label>
                  {isEditing ? (
                    <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Kullanıcı</SelectItem>
                        <SelectItem value="factory">Fabrika</SelectItem>
                        <SelectItem value="company">Şirket</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="secondary" className="mt-2">
                      {user.role === 'user' && 'Kullanıcı'}
                      {user.role === 'factory' && 'Fabrika'}
                      {user.role === 'company' && 'Şirket'}
                      {user.role === 'admin' && 'Admin'}
                    </Badge>
                  )}
                </div>
                
                <div>
                  <Label>Kayıt Tarihi</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(user.created).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                
                <div>
                  <Label>Son Güncelleme</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(user.updated).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sağ Kolon - Detaylı Bilgiler */}
          <div className="lg:col-span-2 space-y-6">
            {/* Kişisel Bilgiler */}
            <Card>
              <CardHeader>
                <CardTitle>Kişisel Bilgiler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Ad Soyad</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={formData.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-sm text-gray-600 mt-1">{user.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="email">E-posta</Label>
                    <p className="text-sm text-gray-600 mt-1">{user.email}</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="username">Kullanıcı Adı</Label>
                    <p className="text-sm text-gray-600 mt-1">{user.username}</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Telefon</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={formData.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-sm text-gray-600 mt-1">{user.phone}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="tc">T.C. Kimlik No</Label>
                    {isEditing ? (
                      <Input
                        id="tc"
                        value={formData.tc || ''}
                        onChange={(e) => handleInputChange('tc', e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-sm text-gray-600 mt-1">{user.tc}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="city">Şehir</Label>
                    {isEditing ? (
                      <Input
                        id="city"
                        value={formData.city || ''}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-sm text-gray-600 mt-1">{user.city}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Finansal Bilgiler */}
            <Card>
              <CardHeader>
                <CardTitle>Finansal Bilgiler</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="iban">IBAN</Label>
                  {isEditing ? (
                    <Input
                      id="iban"
                      value={formData.iban || ''}
                      onChange={(e) => handleInputChange('iban', e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-sm text-gray-600 mt-1">{user.iban || 'Belirtilmemiş'}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Dosyalar */}
            <Card>
              <CardHeader>
                <CardTitle>Dosyalar</CardTitle>
                <CardDescription>
                  Kullanıcıya ait yüklenen dosyalar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Mevcut Dosyalar */}
                {user.files && user.files.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Mevcut Dosyalar</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                      {user.files.map((fileName) => (
                        <div key={fileName} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-blue-500" />
                            <span className="text-sm truncate max-w-[150px]" title={fileName}>
                              {fileName.length > 20 ? fileName.substring(0, 20) + '...' : fileName}
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(getFileUrl(fileName), '_blank')}
                              title="Görüntüle"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = getFileUrl(fileName);
                                link.download = fileName;
                                link.target = '_blank';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                              title="İndir"
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                            {isEditing && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeExistingFile(fileName)}
                                title="Sil"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Yeni Dosya Yükleme */}
                {isEditing && (
                  <div>
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <div className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                        <Upload className="h-4 w-4" />
                        <span>Yeni Dosya Ekle</span>
                      </div>
                    </Label>
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    
                    {/* Yeni seçilen dosyalar */}
                    {newFiles.length > 0 && (
                      <div className="mt-3">
                        <Label className="text-sm font-medium">Yeni Dosyalar</Label>
                        <div className="space-y-2 mt-2">
                          {newFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span className="text-sm">{file.name}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeFile(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
