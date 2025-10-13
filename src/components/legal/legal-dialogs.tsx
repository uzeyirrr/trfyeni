'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export function TermsOfServiceDialog({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Kullanım Sözleşmesi</DialogTitle>
          <DialogDescription>
            Son güncelleme: {new Date().toLocaleDateString('tr-TR')}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm leading-relaxed">
            <section>
              <h3 className="font-semibold text-base mb-3">1. Genel Hükümler</h3>
              <p className="mb-3">
                Bu kullanım sözleşmesi (&quot;Sözleşme&quot;), TRF Fındık Platformu (&quot;Platform&quot;) ile 
                kullanıcılar arasındaki hak ve yükümlülükleri düzenler. Platformu kullanarak bu sözleşmeyi 
                kabul etmiş sayılırsınız.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">2. Hizmet Tanımı</h3>
              <p className="mb-3">
                Platform, fındık üreticileri ve fabrikalar arasında ticari işlemleri kolaylaştıran 
                dijital bir ağdır. Hizmetlerimiz şunları içerir:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Fındık teslimat yönetimi</li>
                <li>Fiyat takibi ve bildirimleri</li>
                <li>Ödeme süreçleri</li>
                <li>İstatistik ve raporlama</li>
                <li>QR kod tabanlı takip sistemi</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">3. Kullanıcı Yükümlülükleri</h3>
              <p className="mb-3">Kullanıcılar şu yükümlülükleri kabul eder:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Doğru ve güncel bilgi sağlama</li>
                <li>Güvenli şifre kullanma</li>
                <li>Platform kurallarına uygun davranma</li>
                <li>Sahte bilgi paylaşmama</li>
                <li>Diğer kullanıcıların haklarına saygı gösterme</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">4. Fabrika Onay Süreci</h3>
              <p className="mb-3">
                Fabrika hesapları, gerekli belgelerin kontrol edilmesi sonrası manuel olarak onaylanır. 
                Onay süreci 1-3 iş günü sürebilir. Onay bekleyen hesaplar platform özelliklerini 
                kullanamaz.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">5. Fiyat ve Ödeme</h3>
              <p className="mb-3">
                Platform üzerinden gösterilen fiyatlar bilgilendirme amaçlıdır. Kesin fiyatlar 
                teslimat sırasında belirlenir. Ödeme koşulları ilgili taraflar arasında ayrıca 
                belirlenir.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">6. Veri Güvenliği</h3>
              <p className="mb-3">
                Kişisel verileriniz 6698 sayılı KVKK kapsamında korunur. Verileriniz sadece 
                hizmet sunumu için kullanılır ve üçüncü taraflarla paylaşılmaz.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">7. Sorumluluk Sınırları</h3>
              <p className="mb-3">
                Platform, kullanıcılar arasındaki ticari anlaşmalardan sorumlu değildir. 
                Sadece aracı hizmet sunar. Tüm ticari riskler ilgili taraflara aittir.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">8. Hesap Kapatma</h3>
              <p className="mb-3">
                Kullanıcılar hesaplarını istediği zaman kapatabilir. Platform, sözleşme ihlali 
                durumunda hesapları kapatma hakkını saklı tutar.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">9. Değişiklikler</h3>
              <p className="mb-3">
                Bu sözleşme önceden bildirim yapılmaksızın değiştirilebilir. Değişiklikler 
                platform üzerinden duyurulur.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">10. İletişim</h3>
              <p className="mb-3">
                Sorularınız için: info@trffindik.com adresinden bize ulaşabilirsiniz.
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export function PrivacyPolicyDialog({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Gizlilik Politikası</DialogTitle>
          <DialogDescription>
            Son güncelleme: {new Date().toLocaleDateString('tr-TR')}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm leading-relaxed">
            <section>
              <h3 className="font-semibold text-base mb-3">1. Giriş</h3>
              <p className="mb-3">
                TRF Fındık Platformu olarak, kişisel verilerinizin korunması bizim için önemlidir. 
                Bu gizlilik politikası, kişisel verilerinizin nasıl toplandığını, kullanıldığını 
                ve korunduğunu açıklar.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">2. Toplanan Veriler</h3>
              <p className="mb-3">Aşağıdaki kişisel verileri topluyoruz:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Ad, soyad ve iletişim bilgileri</li>
                <li>E-posta adresi ve telefon numarası</li>
                <li>Şehir ve lokasyon bilgileri</li>
                <li>Teslimat ve işlem geçmişi</li>
                <li>Ödeme bilgileri (şifrelenmiş)</li>
                <li>IP adresi ve tarayıcı bilgileri</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">3. Veri Kullanım Amaçları</h3>
              <p className="mb-3">Kişisel verileriniz şu amaçlarla kullanılır:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Platform hizmetlerini sunma</li>
                <li>Hesap yönetimi ve kimlik doğrulama</li>
                <li>İşlem takibi ve raporlama</li>
                <li>Müşteri desteği sağlama</li>
                <li>Platform güvenliğini sağlama</li>
                <li>Yasal yükümlülükleri yerine getirme</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">4. Veri Paylaşımı</h3>
              <p className="mb-3">
                Kişisel verileriniz aşağıdaki durumlar dışında üçüncü taraflarla paylaşılmaz:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Yasal zorunluluklar</li>
                <li>Mahkeme kararları</li>
                <li>Platform güvenliği için gerekli durumlar</li>
                <li>Açık rızanızla paylaşım</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">5. Veri Güvenliği</h3>
              <p className="mb-3">
                Verilerinizi korumak için endüstri standardı güvenlik önlemleri alıyoruz:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>SSL/TLS şifreleme</li>
                <li>Güvenli sunucu altyapısı</li>
                <li>Düzenli güvenlik güncellemeleri</li>
                <li>Erişim kontrolleri</li>
                <li>Veri yedekleme sistemleri</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">6. Çerezler (Cookies)</h3>
              <p className="mb-3">
                Platform, kullanıcı deneyimini iyileştirmek için çerezler kullanır. 
                Çerezleri tarayıcı ayarlarınızdan yönetebilirsiniz.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">7. KVKK Hakları</h3>
              <p className="mb-3">6698 sayılı KVKK kapsamında şu haklara sahipsiniz:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                <li>İşlenen kişisel verileriniz hakkında bilgi talep etme</li>
                <li>İşlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                <li>Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme</li>
                <li>Eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme</li>
                <li>Belirtilen şartlar çerçevesinde kişisel verilerinizin silinmesini veya yok edilmesini isteme</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">8. Veri Saklama Süresi</h3>
              <p className="mb-3">
                Kişisel verileriniz, işleme amacının gerektirdiği süre boyunca ve yasal 
                saklama sürelerine uygun olarak saklanır.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">9. Değişiklikler</h3>
              <p className="mb-3">
                Bu gizlilik politikası güncellendiğinde, değişiklikler platform üzerinden 
                duyurulur.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">10. İletişim</h3>
              <p className="mb-3">
                KVKK haklarınızı kullanmak için: privacy@trffindik.com adresinden bize ulaşabilirsiniz.
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
