# Türkiye Fındık - Fındık Yönetim Sistemi

Modern ve kullanıcı dostu fındık yönetim sistemi. Üreticiler, fabrikalar ve yöneticiler için geliştirilmiş kapsamlı bir platform.

## 🚀 Özellikler

### 👤 Kullanıcı Yönetimi
- **Kayıt ve Giriş**: Güvenli kullanıcı kimlik doğrulama
- **Profil Yönetimi**: Kişisel bilgi güncelleme ve şehir seçimi
- **Rol Tabanlı Erişim**: Admin, üretici ve fabrika rolleri
- **Profil Tamamlama**: Görsel tamamlanma yüzdesi

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

### 🏭 Fabrika Yönetimi
- **Fabrika Teslimatları**: Fabrikalar için özel teslimat sayfası
- **QR Kod Tarama**: Teslimat ID'si ile hızlı erişim
- **Teslimat Düzenleme**: Kg, fabrika fiyatı, randıman ve durum güncelleme
- **Gelişmiş Filtreleme**: Arama, durum filtresi ve çoklu sıralama
- **İstatistikler**: Toplam teslimat, kg ve değer hesaplamaları

### 🎨 Modern UI/UX
- **Shadcn UI**: Modern ve tutarlı tasarım
- **Responsive**: Mobil ve masaüstü uyumlu
- **Türkçe Arayüz**: Tam Türkçe dil desteği
- **Kullanıcı Dostu**: Sezgisel navigasyon

## 🛠️ Teknolojiler

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI Framework**: Shadcn UI, Tailwind CSS
- **Backend**: PocketBase
- **Grafikler**: Recharts
- **İkonlar**: Lucide React
- **Form Yönetimi**: React Hook Form, Zod
- **Bildirimler**: Sonner

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
- `role`: Kullanıcı rolü (admin, factory, user)
- `avatar`: Profil resmi

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
- `randiman`: Fındık randıman yüzdesi
- `created`: Oluşturulma tarihi
- `updated`: Güncellenme tarihi

## 🔧 Geliştirme

### Proje Yapısı
```
src/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Dashboard sayfaları
│   ├── login/            # Giriş sayfası
│   ├── register/         # Kayıt sayfası
│   └── forgot-password/  # Şifre sıfırlama
├── components/           # React bileşenleri
│   ├── auth/            # Kimlik doğrulama formları
│   ├── delivery/        # Teslimat bileşenleri
│   ├── layout/          # Layout bileşenleri
│   └── ui/              # Shadcn UI bileşenleri
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

- **Dashboard**: Ana kontrol paneli
- **Fiyatlar**: Grafik ve liste görünümü
- **Teslimatlar**: Kişisel teslimat yönetimi
- **Fabrika Teslimatları**: Fabrika teslimat yönetimi
- **Profil**: Kullanıcı profil sayfası

## 🆕 Son Güncellemeler

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
