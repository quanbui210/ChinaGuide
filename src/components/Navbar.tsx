import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { UserProfile } from '../types';
import { LogOut, Map, ShieldCheck, User } from 'lucide-react';

interface NavbarProps {
  userProfile: UserProfile | null;
  onContactClick: () => void;
}

export default function Navbar({ userProfile, onContactClick }: NavbarProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Map className="w-6 h-6 text-orange-600" />
          <span className="font-serif italic font-bold text-xl tracking-tight">China Guide</span>
        </Link>

        <div className="flex items-center gap-6">
          <button 
            onClick={onContactClick}
            className="text-sm font-medium hover:text-orange-600 transition-colors"
          >
            Liên hệ
          </button>
          
          {userProfile?.role === 'admin' && (
            <div className="flex items-center gap-4">
              <Link to="/admin" className="flex items-center gap-1 text-sm font-medium text-stone-600 hover:text-orange-600 transition-colors">
                <ShieldCheck className="w-4 h-4" />
                Quản trị
              </Link>
              <div className="flex items-center gap-2 text-sm text-stone-500">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">{userProfile.email.split('@')[0]}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-600"
                title="Đăng xuất"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
