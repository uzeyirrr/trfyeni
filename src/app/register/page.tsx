import { RegisterForm } from '@/components/auth/register-form';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex">
      {/* Sol taraf - Görsel alan */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/image.jpg)' }}
        ></div>
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Ana sayfaya dön butonu */}
        <div className="absolute top-6 left-6 z-20">
          <Link 
            href="/" 
            className="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors duration-200 backdrop-blur-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Ana Sayfa
          </Link>
        </div>
      </div>

      {/* Sağ taraf - Form alan */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Hesap Oluştur</h2>
            <p className="mt-2 text-sm text-gray-600">
              Yeni bir hesap oluşturun
            </p>
          </div>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
