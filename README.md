# Türkiye Fındık - Fındık Yönetim Sistemi

Modern ve kullanıcı dostu fındık yönetim sistemi. Üreticiler, fabrikalar ve yöneticiler için geliştirilmiş kapsamlı bir platform.

## 🚀 Özellikler

### 👤 Kullanıcı Yönetimi
- **Kayıt ve Giriş**: Güvenli kullanıcı kimlik doğrulama
- **Profil Yönetimi**: Kişisel bilgi güncelleme ve şehir seçimi
- **Rol Tabanlı Erişim**: Admin, üretici, fabrika ve şirket rolleri
- **Profil Tamamlama**: Görsel tamamlanma yüzdesi
- **Kullanıcı Detay ve Düzenleme**: Tüm kullanıcı verilerini düzenleme
- **Avatar Yönetimi**: Profil fotoğrafı yükleme ve değiştirme
- **Dosya Yönetimi**: Kullanıcıya ait dosyaları görüntüleme, yükleme ve kaldırma
- **Gelişmiş Kullanıcı Listesi**: Arama, filtreleme ve rol bazlı görüntüleme

### 📊 Fındık Fiyatları
- **Gerçek Zamanlı Grafik**: Son fiyat trendleri
- **Fiyat Geçmişi**: Detaylı fiyat listesi
- **Admin Kontrolü**: Sadece adminler yeni fiyat ekleyebilir
- **İstatistikler**: Ortalama, son fiyat ve değişim oranları

### 🚚 Teslimat Yönetimi
- **Kişisel Teslimatlar**: Kullanıcıya özel teslimat listesi
- **Fabrika Seçimi**: Şehir bazlı fabrika filtreleme
- **Otomatik Fiyat**: Güncel fiyatla otomatik hesaplama
- **Detaylı İstatistikler**: Toplam kg, ortalama ve değer hesaplamaları
- **Teslimat Fişi**: QR kod ile yazdırılabilir/indirilebilir fiş
- **Yeniden Kullanılabilir Form**: Ayrı bileşen olarak teslimat formu
- **Admin Teslimat Yönetimi**: Tüm teslimatları görüntüleme, düzenleme ve toplu güncelleme
- **Bulk Editing**: Çoklu teslimat seçimi ve toplu düzenleme
- **Gelişmiş Filtreleme**: Arama, durum ve ödeme durumu filtreleri

### 🏭 Fabrika Yönetimi
- **Fabrika Teslimatları**: Fabrikalar için özel teslimat sayfası
- **QR Kod Tarama**: Teslimat ID'si ile hızlı erişim
- **Teslimat Düzenleme**: Kg, fabrika fiyatı, randıman ve durum güncelleme
- **Gelişmiş Filtreleme**: Arama, durum filtresi ve çoklu sıralama
- **İstatistikler**: Toplam teslimat, kg ve değer hesaplamaları
- **Fabrika Dashboard**: Fabrika odaklı istatistikler ve hızlı işlemler
- **Teslimat Takibi**: Gerçek zamanlı teslimat durumu ve ödeme takibi

### 💰 Ödeme Yönetimi
- **Ödeme Durumu Kontrolü**: Teslimat ödeme durumunu boolean (true/false) olarak yönetme
- **Switch Kontrolü**: Her teslimat için ödeme durumu toggle butonu
- **Ödeme Fişi**: Ödeme tamamlandıktan sonra görüntülenebilir fiş
- **Fiş Yazdırma**: Yazdırılabilir ödeme fişi (HTML formatında)
- **Fiş İndirme**: İndirilebilir ödeme fişi (TXT formatında)
- **Güvenlik**: Ödeme tamamlanmadan fiş görüntülenemez
- **İstatistikler**: Toplam teslimat, kg ve fabrika fiyatı toplamları

### 🎨 Modern UI/UX
- **Shadcn UI**: Modern ve tutarlı tasarım
- **Responsive**: Mobil ve masaüstü uyumlu
- **Türkçe Arayüz**: Tam Türkçe dil desteği
- **Kullanıcı Dostu**: Sezgisel navigasyon
- **Gradient Tasarım**: Modern renk geçişleri ve görsel efektler
- **Toast Bildirimleri**: Kullanıcı dostu bildirim sistemi
- **Loading Durumları**: Skeleton ve spinner animasyonları
- **Form Validasyonu**: Zod ile güçlü form doğrulama
- **Rol Bazlı Navigasyon**: Kullanıcı rolüne göre dinamik menü görünümü

### 🏠 Akıllı Ana Sayfa (Dashboard)
- **Rol Bazlı Görünüm**: Admin, fabrika ve kullanıcı rolleri için özelleştirilmiş
- **Otomatik Yönlendirme**: Kullanıcı giriş yaptığında rolüne göre otomatik yönlendirme
- **Gerçek Zamanlı İstatistikler**: PocketBase'den canlı veri çekme
- **Dinamik İstatistik Kartları**: Toplam kullanıcı, teslimat, gelir ve fabrika sayıları
- **Son Teslimatlar**: Gerçek teslimat verileri ile güncel durum
- **Son Kullanıcılar**: Sisteme son kayıt olan kullanıcılar (Admin için)
- **Hızlı İşlemler**: Rol bazlı hızlı erişim butonları
- **Sistem Durumu**: Platform performans ve güvenlik bilgileri

### 👥 Kullanıcı Yönetimi (Admin)
- **Kullanıcı Listesi**: Tüm sistem kullanıcılarını görüntüleme
- **Arama ve Filtreleme**: İsim, e-posta, telefon ile arama
- **Rol Bazlı Filtreleme**: Admin, kullanıcı, fabrika, şirket rolleri
- **İstatistik Kartları**: Toplam, doğrulanmış, admin ve fabrika sayıları
- **Kullanıcı Detayları**: Avatar, rol badge'leri, doğrulama durumu
- **Hızlı Erişim**: Düzenle ve detay butonları
- **Kullanıcı Detay Sayfası**: Tüm kullanıcı verilerini düzenleme
- **Dosya ve Avatar Yönetimi**: Profil fotoğrafı ve belge yönetimi

## 🛠️ Teknolojiler

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI Framework**: Shadcn UI, Tailwind CSS
- **Backend**: PocketBase
- **Grafikler**: Recharts
- **İkonlar**: Lucide React
- **Form Yönetimi**: React Hook Form, Zod
- **Bildirimler**: Sonner
- **UI Bileşenleri**: Switch, Label, Table, Card, Button, Input, Select
- **State Yönetimi**: React Hooks (useState, useEffect)
- **Veri İşleme**: PocketBase SDK, async/await

## 📦 Kurulum

### Gereksinimler
- Node.js 18+ 
- PocketBase sunucusu

### Adımlar

1. **Projeyi klonlayın**
```bash
git clone [repository-url]
cd trffindikyeni
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **PocketBase kurulumu**
- PocketBase'i [buradan](https://pocketbase.io/docs/) indirin
- Sunucuyu başlatın: `./pocketbase serve`
- Admin panelinden gerekli koleksiyonları oluşturun

4. **Geliştirme sunucusunu başlatın**
```bash
npm run dev
```

5. **Tarayıcıda açın**
```
http://localhost:3000
```

## 📋 Koleksiyon Yapısı

### Users Koleksiyonu
- `name`: Kullanıcı adı
- `email`: E-posta adresi
- `phone`: Telefon numarası
- `tc`: TC kimlik numarası
- `city`: Şehir
- `iban`: IBAN numarası
- `role`: Kullanıcı rolü (admin, factory, user, company)
- `avatar`: Profil resmi
- `files`: Kullanıcıya ait dosyalar (çoklu)
- `username`: Kullanıcı adı
- `verified`: E-posta doğrulama durumu

### Price Koleksiyonu
- `price`: Fiyat değeri
- `created`: Oluşturulma tarihi

### Deliveries Koleksiyonu
- `kg`: Teslimat ağırlığı
- `user`: Kullanıcı ilişkisi
- `factory`: Fabrika ilişkisi
- `price`: Fiyat ilişkisi
- `delivery_date`: Teslimat tarihi
- `factory_price`: Fabrika anlaşma fiyatı
- `tamamlandi`: Teslimat tamamlanma durumu
- `odeme_tamamlandi`: Ödeme tamamlanma durumu
- `randiman`: Fındık randıman yüzdesi
- `created`: Oluşturulma tarihi
- `updated`: Güncellenme tarihi

## 🔧 Geliştirme

### Proje Yapısı
```
src/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Dashboard sayfaları
│   │   ├── users/        # Kullanıcı yönetimi sayfası
│   │   ├── deliveries/   # Teslimat yönetimi
│   │   ├── factory-deliveries/ # Fabrika teslimatları
│   │   ├── admin-deliveries/   # Admin teslimatları
│   │   ├── prices/       # Fındık fiyatları
│   │   ├── payments/     # Ödemeler yönetimi
│   │   └── profile/      # Kullanıcı profili
│   ├── login/            # Giriş sayfası
│   ├── register/         # Kayıt sayfası
│   └── forgot-password/  # Şifre sıfırlama
├── components/           # React bileşenleri
│   ├── auth/            # Kimlik doğrulama formları
│   ├── delivery/        # Teslimat bileşenleri
│   ├── layout/          # Layout bileşenleri
│   └── ui/              # Shadcn UI bileşenleri (Switch, Label, Table, vb.)
└── lib/                 # Yardımcı fonksiyonlar
    ├── pocketbase.ts    # PocketBase konfigürasyonu
    └── utils.ts         # Genel yardımcılar
```

### Önemli Komutlar
```bash
# Shadcn UI bileşeni ekleme
npx shadcn@latest add [component-name]

# Geliştirme sunucusu
npm run dev

# Production build
npm run build

# Lint kontrolü
npm run lint
```

## 🚀 Deployment

### Vercel (Önerilen)
1. GitHub'a projeyi push edin
2. Vercel'de yeni proje oluşturun
3. GitHub repository'sini bağlayın
4. Environment variables'ları ayarlayın
5. Deploy edin

### Environment Variables
```env
NEXT_PUBLIC_POCKETBASE_URL=http://127.0.0.1:8090
```

## 📱 Ekran Görüntüleri

- **Dashboard**: Akıllı ana sayfa (rol bazlı görünüm)
- **Kullanıcılar**: Sistem kullanıcıları yönetimi
- **Fiyatlar**: Grafik ve liste görünümü
- **Teslimatlar**: Kişisel teslimat yönetimi
- **Fabrika Teslimatları**: Fabrika teslimat yönetimi
- **Admin Teslimatlar**: Tüm teslimatları yönetme ve düzenleme
- **Ödemeler**: Teslimat ödeme durumu yönetimi ve fiş sistemi
- **Profil**: Kullanıcı profil sayfası

## 🆕 Son Güncellemeler

### v2.6.0 - Rol Bazlı Navigasyon ve Otomatik Yönlendirme Sistemi
- 🎯 **Rol Bazlı Navigasyon**: Kullanıcı rolüne göre dinamik sidebar menü görünümü
- 🚀 **Otomatik Yönlendirme**: Kullanıcı giriş yaptığında rolüne göre otomatik dashboard yönlendirme
- 🔒 **Güvenli Erişim**: Her rol sadece kendisine ait sayfalara erişebilir
- 👤 **Kullanıcı Dashboard**: Normal kullanıcılar için özelleştirilmiş dashboard
- 🏭 **Fabrika Dashboard**: Fabrika kullanıcıları için özelleştirilmiş dashboard
- 👑 **Admin Dashboard**: Tüm sayfalara erişim ile tam yönetim paneli

### v2.5.0 - Kullanıcı Detay ve Düzenleme Sistemi
- 👤 **Kullanıcı Detay Sayfası**: Tüm kullanıcı verilerini düzenleme
- 🖼️ **Avatar Yönetimi**: Profil fotoğrafı yükleme ve değiştirme
- 📁 **Dosya Yönetimi**: Kullanıcıya ait dosyaları görüntüleme, yükleme ve kaldırma
- ✏️ **Form Düzenleme**: Kişisel bilgiler, rol ve finansal bilgileri düzenleme
- 🔄 **Gerçek Zamanlı Güncelleme**: Değişiklikleri anında kaydetme
- 📱 **Responsive Tasarım**: Mobil ve masaüstü için optimize edilmiş arayüz
- 🎯 **Rol Bazlı Erişim**: Admin, kullanıcı, fabrika ve şirket rolleri desteği

### v2.4.0 - Akıllı Ana Sayfa ve Dashboard Sistemi
- 🏠 **Akıllı Ana Sayfa**: Rol bazlı özelleştirilmiş dashboard görünümü
- 📊 **Gerçek Zamanlı İstatistikler**: PocketBase'den canlı veri çekme ve güncelleme
- 🎨 **Modern Tasarım**: Gradient arka planlar, renkli border'lar ve görsel iyileştirmeler
- 👑 **Admin Dashboard**: Ek istatistik kartları, son kullanıcılar ve gelişmiş yönetim
- 🏭 **Fabrika Dashboard**: Fabrika odaklı hızlı işlemler ve teslimat yönetimi
- 👤 **Kullanıcı Dashboard**: Basit ve kullanıcı dostu arayüz
- 🔄 **Dinamik Veri**: Son teslimatlar, kullanıcı sayıları ve gelir hesaplamaları
- 📱 **Responsive Tasarım**: Mobil ve masaüstü için optimize edilmiş görünüm

### v2.3.0 - Ödeme Yönetimi Sistemi
- 💰 **Ödemeler Sayfası**: Tamamlanan teslimatların ödeme durumu yönetimi
- 🔄 **Switch Kontrolü**: Her teslimat için ödeme durumu toggle butonu
- 📄 **Ödeme Fişi**: Ödeme tamamlandıktan sonra görüntülenebilir fiş
- 🖨️ **Fiş Yazdırma**: HTML formatında yazdırılabilir ödeme fişi
- 💾 **Fiş İndirme**: TXT formatında indirilebilir ödeme fişi
- 🔒 **Güvenlik**: Ödeme tamamlanmadan fiş görüntülenemez
- 📊 **İstatistikler**: Toplam teslimat, kg ve fabrika fiyatı toplamları
- 🎯 **Boolean Ödeme Durumu**: True/false ile basit ödeme durumu kontrolü

### v2.2.0 - Admin Teslimat Yönetimi Sistemi
- 👑 **Admin Teslimatlar Sayfası**: Tüm teslimatları görüntüleme ve yönetme
- ✏️ **Inline Düzenleme**: Kg, teslimat tarihi, fabrika fiyatı, randıman düzenleme
- 🔄 **Toplu Güncelleme**: Çoklu teslimat seçimi ve toplu düzenleme
- 📋 **Checkbox Sistemi**: Teslimat seçimi için gelişmiş checkbox kontrolü
- 🔍 **Gelişmiş Filtreleme**: Arama, durum ve ödeme durumu filtreleri
- 📊 **İstatistik Kartları**: Toplam teslimat, kg, değer ve tamamlanan sayıları
- 🎨 **Modern UI**: Shadcn UI bileşenleri ile tutarlı tasarım

### v2.1.0 - Kullanıcı Yönetimi Sistemi
- 👥 **Kullanıcılar Sayfası**: Tüm sistem kullanıcılarını görüntüleme
- 🔍 **Gelişmiş Arama**: İsim, e-posta, telefon ile arama
- 🏷️ **Rol Badge'leri**: Admin, kullanıcı, fabrika rolleri için görsel etiketler
- 📊 **İstatistik Kartları**: Toplam, doğrulanmış, admin ve fabrika sayıları
- ✅ **Doğrulama Durumu**: E-posta doğrulanmış kullanıcı işaretleri
- 🎨 **Modern UI**: Avatar, responsive tasarım ve kullanıcı dostu arayüz
- 🔧 **Badge Component**: Shadcn UI uyumlu badge bileşeni

### v2.0.0 - Fabrika Yönetimi ve Gelişmiş Teslimat Sistemi
- ✨ **Yeni Teslimat Formu**: Yeniden kullanılabilir bileşen
- 🏭 **Fabrika Teslimatları Sayfası**: Fabrikalar için özel yönetim
- 🔍 **QR Kod Sistemi**: Teslimat fişi ve hızlı erişim
- 📊 **Gelişmiş İstatistikler**: Doğru hesaplama algoritmaları
- 🔧 **Teslimat Düzenleme**: Kg, fiyat, randıman ve durum güncelleme
- 📱 **Responsive Tasarım**: Mobil uyumlu arayüz
- 🎯 **Akıllı Filtreleme**: Arama, durum ve çoklu sıralama

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

- **Proje**: Türkiye Fındık Yönetim Sistemi
- **Geliştirici**: [Geliştirici Adı]
- **E-posta**: [E-posta Adresi]

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!
