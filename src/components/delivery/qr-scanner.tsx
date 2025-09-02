'use client';

import { useState, useRef, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { XCircle, Camera, QrCode } from 'lucide-react';

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}

export function QRScanner({ isOpen, onClose, onScan }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string>('');
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [scanMode, setScanMode] = useState<'camera' | 'input'>('camera');

  useEffect(() => {
    if (isOpen && scanMode === 'camera') {
      startScanner();
    } else if (scannerRef.current) {
      stopScanner();
    }

    return () => {
      if (scannerRef.current) {
        stopScanner();
      }
    };
  }, [isOpen, scanMode]);

  const startScanner = () => {
    if (scannerRef.current) return;

    try {
      // Kamera izinlerini kontrol et
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          // Kamera izni verildi, tarayıcıyı başlat
          scannerRef.current = new Html5QrcodeScanner(
            'qr-reader',
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0,
              disableFlip: false,
            },
            false
          );

          scannerRef.current.render(
            (decodedText) => {
              onScan(decodedText);
              stopScanner();
            },
            (error) => {
              // Hata durumunda sessizce devam et
              console.log('QR okuma hatası:', error);
            }
          );

          setIsScanning(true);
          
          // Stream'i temizle
          stream.getTracks().forEach(track => track.stop());
        })
        .catch((error) => {
          console.error('Kamera izni alınamadı:', error);
          // Manuel moda geç
          setScanMode('input');
        });
    } catch (error) {
      console.error('Kamera başlatılamadı:', error);
      // Manuel moda geç
      setScanMode('input');
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
      setIsScanning(false);
    }
  };

  const handleModeChange = (mode: 'camera' | 'input') => {
    if (scannerRef.current) {
      stopScanner();
    }
    setScanMode(mode);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">QR Kod Oku</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <XCircle className="h-4 w-4" />
          </Button>
        </div>

        {/* Mod Seçimi */}
        <div className="flex space-x-2 mb-4">
          <Button
            variant={scanMode === 'camera' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleModeChange('camera')}
            className="flex-1"
          >
            <Camera className="mr-2 h-4 w-4" />
            Kamera ile Oku
          </Button>
          <Button
            variant={scanMode === 'input' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleModeChange('input')}
            className="flex-1"
          >
            <QrCode className="mr-2 h-4 w-4" />
            Manuel Giriş
          </Button>
        </div>

        {scanMode === 'camera' ? (
          <div className="space-y-4">
            <div className="text-center text-sm text-gray-600 mb-4">
              QR kodu kameraya gösterin
            </div>
            
            {/* Kamera Tarayıcı */}
            <div id="qr-reader" className="w-full min-h-[300px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
              {!isScanning ? (
                <div className="text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p>Kamera başlatılıyor...</p>
                  <p className="text-xs mt-1">Kamera izni isteniyor</p>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <p>Kamera aktif</p>
                  <p className="text-xs mt-1">QR kodu kameraya gösterin</p>
                </div>
              )}
            </div>
            
            <div className="text-center text-xs text-gray-400 mb-4">
              Kamera açılmazsa "Manuel Giriş" modunu kullanın
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={() => {
                  if (scannerRef.current) {
                    stopScanner();
                  }
                  startScanner();
                }}
                variant="outline"
                className="flex-1"
              >
                <Camera className="mr-2 h-4 w-4" />
                Kamerayı Yeniden Başlat
              </Button>
              <Button
                onClick={() => setScanMode('input')}
                variant="outline"
                className="flex-1"
              >
                Manuel Girişe Geç
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center text-sm text-gray-600 mb-4">
              Teslimat ID'sini manuel olarak girin
            </div>
            
            <input
              type="text"
              placeholder="Teslimat ID'si"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const value = e.currentTarget.value.trim();
                  if (value) {
                    onScan(value);
                  }
                }
              }}
              autoFocus
            />
            
            <div className="flex space-x-2">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1"
              >
                İptal
              </Button>
              <Button
                onClick={() => {
                  const input = document.querySelector('input') as HTMLInputElement;
                  if (input?.value.trim()) {
                    onScan(input.value.trim());
                  }
                }}
                className="flex-1"
              >
                Ara
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
