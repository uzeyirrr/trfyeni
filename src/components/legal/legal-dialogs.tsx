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
          <DialogTitle>FINDIK ALIM İŞBİRLİĞİ SÖZLEŞMESİ</DialogTitle>
          <DialogDescription>
            Son güncelleme: {new Date().toLocaleDateString('tr-TR')}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm leading-relaxed">
            <section>
              <h3 className="font-semibold text-base mb-3">Taraflar</h3>
              <p className="mb-3">
                Bu sözleşme, bir tarafta TÜRKİYE FINDIK (bundan sonra &quot;ALICI&quot; olarak anılacaktır) ile diğer tarafta fındık üretimi yapan ÜRETİCİ (bundan sonra &quot;SATICI&quot; olarak anılacaktır) arasında aşağıdaki şartlar çerçevesinde akdedilmiştir.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">MADDE 1 – SÖZLEŞMENİN KONUSU</h3>
              <p className="mb-3">
                İşbu sözleşmenin konusu, SATICI tarafından yetiştirilen kabuklu veya iç fındığın, ALICI&apos;ya belirlenen alım kriterleri doğrultusunda teslim edilmesi, analiz edilmesi ve satışıyla ilgili usul ve esasların belirlenmesidir.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">MADDE 2 – TESLİM ŞARTLARI</h3>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-3">
                <li>SATICI, ürününü satılabilir ve analiz yapılabilir uygunluğa getirmekle yükümlüdür.</li>
                <li>Fındığın kurutulmuş, yabancı maddelerden arındırılmış, çuvallanmış ve taşınabilir durumda olması zorunludur.</li>
                <li>SATICI, ürününün nakliyesini kendi imkânlarıyla sağlayarak ALICI&apos;nın belirlediği Türkiye Fındık alım noktalarına teslim etmekle yükümlüdür.</li>
                <li>Ürünün mülkiyeti, analiz sonrası satılabilir olduğu onaylanana kadar tamamen SATICI&apos;ya aittir.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">MADDE 3 – ANALİZ VE KABUL KRİTERLERİ</h3>
              <p className="mb-3">
                ALICI, kendisine teslim edilen fındık üzerinde aşağıdaki kriterleri esas alarak analiz yapar:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-3">
                <li>Nem oranı</li>
                <li>Çürük oranı</li>
                <li>Yabancı madde oranı</li>
                <li>Randıman (verim)</li>
                <li>Zararlı böcek hasarı</li>
                <li>Aflatoksin riski (gerekli durumlarda)</li>
              </ul>
              <p className="mb-3">
                Analiz sonucunda fındığın satılabilir kalite standartlarını sağladığı tespit edilirse, ALICI ürünü teslim alır.
              </p>
              <p className="mb-3">
                Aşağıdaki durumlarda ALICI ürünü kısmen veya tamamen reddetme hakkına sahiptir:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-3">
                <li>Nem oranının yüksek olması</li>
                <li>Çürük oranının yüksek olması</li>
                <li>Yabancı madde oranının kabul edilebilir seviyelerin üzerinde olması</li>
                <li>Aşırı bozulma veya depolama kaynaklı kalite kaybı</li>
                <li>Zirai ve hijyenik risk oluşturabilecek durumlar</li>
              </ul>
              <p className="mb-3">
                Reddedilen ürünler, SATICI&apos;nın talebi doğrultusunda kendisine iade edilir. İade için ALICI herhangi bir taşıma yükümlülüğü üstlenmez.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">MADDE 4 – FİYATLANDIRMA</h3>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-3">
                <li>Fındık alım fiyatı; analiz sonuçlarına, randımana, güncel piyasa koşullarına ve ALICI&apos;nın belirlediği fiyat politikasına göre belirlenir.</li>
                <li>Fiyatlandırma, analiz sonrası SATICI&apos;ya yazılı veya dijital ortamda bildirilir.</li>
                <li>SATICI, fiyatı onayladığında satış kesinleşir.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">MADDE 5 – ÖDEME ŞARTLARI</h3>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-3">
                <li>Satışın kesinleşmesinden sonra ALICI, SATICI&apos;nın banka hesabına ödemeyi gerçekleştirir.</li>
                <li>Ödeme süresi aşağıdaki şekillerde olabilir:
                  <ul className="list-disc list-inside space-y-1 ml-6 mt-2">
                    <li>Aynı gün ödeme</li>
                    <li>En geç … iş günü içinde ödeme (bu bölüm isteğe göre netleştirilebilir)</li>
                  </ul>
                </li>
                <li>Ödemeler yalnızca SATICI&apos;nın IBAN bilgilerine yapılır; üçüncü şahıslara ödeme yapılmaz.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">MADDE 6 – TARAFLARIN SORUMLULUKLARI</h3>
              <p className="mb-2 font-medium">ALICI&apos;nın Sorumlulukları:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-3">
                <li>Ürünü analiz standartlarına uygun biçimde değerlendirmek</li>
                <li>Fiyatlandırmayı şeffaf şekilde bildirmek</li>
                <li>Onaylanan ürünün ödemesini zamanında gerçekleştirmek</li>
              </ul>
              <p className="mb-2 font-medium">SATICI&apos;nın Sorumlulukları:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-3">
                <li>Ürünü analiz yapılabilir ve ticarete uygun hale getirmek</li>
                <li>Ürünü alım noktasına bizzat teslim etmek</li>
                <li>Ürünün kendisine ait olduğunu, üzerinde rehin, haciz veya üçüncü şahıs hakkı bulunmadığını taahhüt etmek</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">MADDE 7 – İHTİLAFLARIN ÇÖZÜMÜ</h3>
              <p className="mb-3">
                Taraflar arasında çıkabilecek uyuşmazlıklar öncelikle uzlaşma yoluyla çözülmeye çalışılır. Çözüm sağlanamazsa, ALICI&apos;nın bulunduğu yer Mahkemeleri ve İcra Daireleri yetkilidir.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3">MADDE 8 – YÜRÜRLÜK</h3>
              <p className="mb-3">
                İşbu sözleşme … / … / 20… tarihinde iki nüsha olarak düzenlenmiş olup, taraflarca imzalandığı tarihte yürürlüğe girer.
              </p>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="font-medium mb-2">ALICI</p>
                  <p className="mb-1">TÜRKİYE FINDIK</p>
                  <p className="mb-1">Ad / Soyad:</p>
                  <p className="mb-1">İmza:</p>
                </div>
                <div>
                  <p className="font-medium mb-2">SATICI (ÜRETİCİ)</p>
                  <p className="mb-1">Ad / Soyad:</p>
                  <p className="mb-1">TC Kimlik No:</p>
                  <p className="mb-1">Adres:</p>
                  <p className="mb-1">Telefon:</p>
                  <p className="mb-1">İmza:</p>
                </div>
              </div>
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
