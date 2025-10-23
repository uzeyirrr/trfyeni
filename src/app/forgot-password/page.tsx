import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import Image from 'next/image';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-lg overflow-hidden ">
              <Image
                src="/logo.png"
                alt="Türkiye Fındık Logo"
                width={64}
                height={64}
                className="object-contain w-full h-full"
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Şifremi Unuttum</h1>
          <p className="mt-2 text-sm text-gray-600">
            Şifrenizi sıfırlamak için email adresinizi girin
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
