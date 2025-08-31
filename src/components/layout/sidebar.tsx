'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getCurrentUser, logout } from '@/lib/pocketbase';
import { 
  Home, 
  User, 
  Settings, 
  LogOut, 
  Menu,
  BarChart3,
  FileText,
  Users,
  Package,
  Truck,
  DollarSign,
  HelpCircle,
  MessageCircle,
  TrendingUp,
  Bus,
} from 'lucide-react';

const menuItems = [
  {
    title: 'Ana Sayfa',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'Teslimatlar',
    href: '/dashboard/deliveries',
    icon: Truck,
  },
  {
    title: 'Admin Teslimatlar',
    href: '/dashboard/deliveries2',
    icon: Bus,
  },
  {
    title: 'Fındık Fiyatları',
    href: '/dashboard/prices',
    icon: TrendingUp,
  },
  {
    title: 'Profil',
    href: '/dashboard/profile',
    icon: User,
  },
  {
    title: 'Teslimatlar',
    href: '/dashboard/deliveries3',
    icon: Truck,
  },
  {
    title: 'Ödemeler',
    href: '/dashboard/payments',
    icon: DollarSign,
  },
  {
    title: 'Kullanıcılar',
    href: '/dashboard/users',
    icon: Users,
  },
  {
    title: 'SSS',
    href: 'https://www.trfturkiyefindik.com/faq ',
    icon: HelpCircle,
  },
  {
    title: 'Destek',
    href: 'tel:+90 533 372 60 93',
    icon: MessageCircle,
  },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const user = getCurrentUser();

  const calculateProfileCompletion = () => {
    if (!user) return 0;
    
    const fields = [
      user.name,
      user.email,
      user.phone,
      user.tc,
      user.city,
      user.iban,
      user.avatar
    ];
    
    const completedFields = fields.filter(field => {
      if (!field) return false;
      if (typeof field === 'string') {
        return field.trim() !== '';
      }
      return true; // avatar gibi dosya alanları için
    }).length;
    
    return Math.round((completedFields / fields.length) * 100);
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className={cn(
      "flex flex-col bg-white border-r border-gray-200 transition-all duration-300 h-screen fixed left-0 top-0 z-40",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <h1 className="text-xl font-bold text-gray-900">Türkiye Fındık</h1>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

             {/* User Profile */}
       <div className="p-4 border-b border-gray-200">
         <div className="flex items-center space-x-3">
           <Avatar className="h-8 w-8">
             <AvatarImage src={user?.avatar} />
             <AvatarFallback>
               {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
             </AvatarFallback>
           </Avatar>
           {!isCollapsed && (
             <div className="flex-1 min-w-0">
               <p className="text-sm font-medium text-gray-900 truncate">
                 {user?.name || 'Kullanıcı'}
               </p>
               <p className="text-xs text-gray-500 truncate">
                 {user?.email}
               </p>
               {/* Profil Tamamlama Yüzdesi */}
               {calculateProfileCompletion() < 100 && (
                 <div className="mt-2">
                   <div className="flex justify-between text-xs text-gray-500 mb-1">
                     <span>Profil Tamamlama</span>
                     <span>{calculateProfileCompletion()}%</span>
                   </div>
                   <div className="w-full bg-gray-200 rounded-full h-1.5">
                     <div 
                       className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                       style={{ width: `${calculateProfileCompletion()}%` }}
                     ></div>
                   </div>
                 </div>
               )}
             </div>
           )}
         </div>
       </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start">
              <LogOut className="h-4 w-4 mr-2" />
              {!isCollapsed && <span>Çıkış Yap</span>}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Hesap</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Çıkış Yap
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
