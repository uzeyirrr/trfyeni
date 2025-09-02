'use client';

import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Printer, X } from 'lucide-react';
import QRCode from 'react-qr-code';

interface DeliveryReceiptProps {
  delivery: {
    id: string;
    kg: number;
    factory: string;
    price: number;
    delivery_date: string;
    created: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export function DeliveryReceipt({ delivery, isOpen, onClose }: DeliveryReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  const [qrImageData, setQrImageData] = useState<string>('');

  // QR kodu resim olarak oluştur
  useEffect(() => {
    if (isOpen && qrRef.current) {
      const canvas = document.createElement('canvas');
      const svg = qrRef.current.querySelector('svg');
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const img = new Image();
        img.onload = () => {
          canvas.width = 120;
          canvas.height = 120;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, 120, 120);
            ctx.drawImage(img, 0, 0, 120, 120);
            setQrImageData(canvas.toDataURL('image/png'));
          }
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && receiptRef.current) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Teslimat Fişi - ${delivery.id}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 20px; 
                background: white; 
              }
              .receipt { 
                max-width: 400px; 
                margin: 0 auto; 
                border: 2px solid #000; 
                padding: 20px; 
                background: white; 
              }
              .header { 
                text-align: center; 
                border-bottom: 2px solid #000; 
                padding-bottom: 10px; 
                margin-bottom: 20px; 
              }
              .qr-code { 
                text-align: center; 
                margin: 20px 0; 
              }
              .qr-code svg { 
                border: 1px solid #ccc; 
                padding: 10px; 
                background: white; 
              }
              .info-row { 
                display: flex; 
                justify-content: space-between; 
                margin: 10px 0; 
                padding: 5px 0; 
                border-bottom: 1px solid #eee; 
              }
              .total { 
                font-weight: bold; 
                font-size: 18px; 
                border-top: 2px solid #000; 
                padding-top: 10px; 
                margin-top: 20px; 
              }
              @media print {
                body { margin: 0; }
                .receipt { border: none; box-shadow: none; }
              }
            </style>
          </head>
          <body>
            <div class="receipt">
              <div class="header">
                <h1>FINDIK TESLİMAT FİŞİ</h1>
                <p>Fiş No: ${delivery.id}</p>
              </div>
              
              <div class="info-row">
                <span>Teslimat Tarihi:</span>
                <span>${new Date(delivery.delivery_date || delivery.created).toLocaleDateString('tr-TR')}</span>
              </div>
              
              <div class="info-row">
                <span>Oluşturulma:</span>
                <span>${new Date(delivery.created).toLocaleDateString('tr-TR')}</span>
              </div>
              
              <div class="info-row">
                <span>Fabrika:</span>
                <span>${delivery.factory}</span>
              </div>
              
              <div class="info-row">
                <span>Miktar:</span>
                <span>${delivery.kg.toLocaleString()} kg</span>
              </div>
              
              <div class="info-row">
                <span>Birim Fiyat:</span>
                <span>₺${delivery.price.toLocaleString()}</span>
              </div>
              
              <div class="total">
                <div class="info-row">
                  <span>TOPLAM:</span>
                  <span>₺${(delivery.kg * delivery.price).toLocaleString()}</span>
                </div>
              </div>
              
                             <div class="qr-code">
                 <img src="${qrImageData}" width="120" height="120" style="border: 1px solid #ccc; padding: 10px; background: white;" />
                 <p style="margin-top: 10px; font-size: 12px;">QR Kod: ${delivery.id}</p>
               </div>
              
              <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #666;">
                <p>Bu fiş elektronik olarak oluşturulmuştur.</p>
                <p>İmza: _________________</p>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownload = () => {
    if (receiptRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Teslimat Fişi - ${delivery.id}</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  margin: 20px; 
                  background: white; 
                }
                .receipt { 
                  max-width: 400px; 
                  margin: 0 auto; 
                  border: 2px solid #000; 
                  padding: 20px; 
                  background: white; 
                }
                .header { 
                  text-align: center; 
                  border-bottom: 2px solid #000; 
                  padding-bottom: 10px; 
                  margin-bottom: 20px; 
                }
                .qr-code { 
                  text-align: center; 
                  margin: 20px 0; 
                }
                .qr-code svg { 
                  border: 1px solid #ccc; 
                  padding: 10px; 
                  background: white; 
                }
                .info-row { 
                  display: flex; 
                  justify-content: space-between; 
                  margin: 10px 0; 
                  padding: 5px 0; 
                  border-bottom: 1px solid #eee; 
                }
                .total { 
                  font-weight: bold; 
                  font-size: 18px; 
                  border-top: 2px solid #000; 
                  padding-top: 10px; 
                  margin-top: 20px; 
                }
              </style>
            </head>
            <body>
              <div class="receipt">
                <div class="header">
                  <h1>FINDIK TESLİMAT FİŞİ</h1>
                  <p>Fiş No: ${delivery.id}</p>
                </div>
                
                <div class="info-row">
                  <span>Teslimat Tarihi:</span>
                  <span>${new Date(delivery.delivery_date || delivery.created).toLocaleDateString('tr-TR')}</span>
                </div>
                
                <div class="info-row">
                  <span>Oluşturulma:</span>
                  <span>${new Date(delivery.created).toLocaleDateString('tr-TR')}</span>
                </div>
                
                <div class="info-row">
                  <span>Fabrika:</span>
                  <span>${delivery.factory}</span>
                </div>
                
                <div class="info-row">
                  <span>Miktar:</span>
                  <span>${delivery.kg.toLocaleString()} kg</span>
                </div>
                
                <div class="info-row">
                  <span>Birim Fiyat:</span>
                  <span>₺${delivery.price.toLocaleString()}</span>
                </div>
                
                <div class="total">
                  <div class="info-row">
                    <span>TOPLAM:</span>
                    <span>₺${(delivery.kg * delivery.price).toLocaleString()}</span>
                  </div>
                </div>
                
                                 <div class="qr-code">
                   <img src="${qrImageData}" width="120" height="120" style="border: 1px solid #ccc; padding: 10px; background: white;" />
                   <p style="margin-top: 10px; font-size: 12px;">QR Kod: ${delivery.id}</p>
                 </div>
                
                <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #666;">
                  <p>Bu fiş elektronik olarak oluşturulmuştur.</p>
                  <p>İmza: _________________</p>
                </div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        
        // HTML'i PDF olarak indir
        const htmlContent = printWindow.document.documentElement.outerHTML;
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `teslimat-fisi-${delivery.id}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        printWindow.close();
      }
    }
  };



  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Teslimat Fişi</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div ref={receiptRef} className="border-2 border-gray-800 p-4 bg-white">
          <div className="text-center border-b-2 border-gray-800 pb-3 mb-4">
            <h1 className="text-lg font-bold">FINDIK TESLİMAT FİŞİ</h1>
            <p className="text-sm">Fiş No: {delivery.id}</p>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>Teslimat Tarihi:</span>
              <span>{new Date(delivery.delivery_date || delivery.created).toLocaleDateString('tr-TR')}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Oluşturulma:</span>
              <span>{new Date(delivery.created).toLocaleDateString('tr-TR')}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Fabrika:</span>
              <span>{delivery.factory}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Miktar:</span>
              <span>{delivery.kg.toLocaleString()} kg</span>
            </div>
            
            <div className="flex justify-between">
              <span>Birim Fiyat:</span>
              <span>₺{delivery.price.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="border-t-2 border-gray-800 pt-3 mb-4">
            <div className="flex justify-between font-bold text-lg">
              <span>TOPLAM:</span>
              <span>₺{(delivery.kg * delivery.price).toLocaleString()}</span>
            </div>
          </div>
          
          <div className="text-center">
            <div className="inline-block p-3 border border-gray-300 bg-white">
              {qrImageData ? (
                <img src={qrImageData} width="100" height="100" alt="QR Kod" />
              ) : (
                <div ref={qrRef} className="hidden">
                  <QRCode 
                    value={delivery.id} 
                    size={100}
                    level="M"
                    bgColor="white"
                    fgColor="black"
                  />
                </div>
              )}
            </div>
            <p className="text-xs mt-2 text-gray-600">QR Kod: {delivery.id}</p>
          </div>
          
          <div className="text-center mt-6 text-xs text-gray-500">
            <p>Bu fiş elektronik olarak oluşturulmuştur.</p>
            <p className="mt-2">İmza: _________________</p>
          </div>
        </div>
        
        <div className="flex space-x-2 mt-4">
          <Button
            onClick={handleDownload}
            variant="outline"
            className="flex-1"
            disabled={!qrImageData}
          >
            <Download className="mr-2 h-4 w-4" />
            {qrImageData ? 'İndir' : 'Yükleniyor...'}
          </Button>
          <Button
            onClick={handlePrint}
            className="flex-1"
            disabled={!qrImageData}
          >
            <Printer className="mr-2 h-4 w-4" />
            {qrImageData ? 'Yazdır' : 'Yükleniyor...'}
          </Button>
        </div>
      </div>
    </div>
  );
}
