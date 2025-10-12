'use client';

import { Button } from '@/components/ui/button';
import { XCircle, Search } from 'lucide-react';

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}

export function QRScanner({ isOpen, onClose, onScan }: QRScannerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Teslimat Ara</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <XCircle className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="text-center text-sm text-gray-600 mb-4">
            Teslimat ID&apos;sini girin
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
              <Search className="mr-2 h-4 w-4" />
              Ara
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
