import { auth } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { UserProfile } from '../types';
import { motion } from 'motion/react';
import { LogIn, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface LoginProps {
  userProfile: UserProfile | null;
}

export default function Login({ userProfile }: LoginProps) {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile) {
      navigate(userProfile.role === 'admin' ? '/admin' : '/');
    }
  }, [userProfile, navigate]);

  if (userProfile) {
    return null;
  }

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setError(null);
    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithPopup(auth, provider);
      navigate('/admin');
    } catch (error: any) {
      console.error('Login failed:', error);
      if (error.code === 'auth/popup-blocked') {
        setError('Trình duyệt đã chặn cửa sổ đăng nhập. Vui lòng cho phép bật cửa sổ (pop-up) và thử lại.');
      } else if (error.code === 'auth/internal-error' || error.message?.includes('missing initial state')) {
        setError('Lỗi đăng nhập trên trình duyệt di động. Vui lòng thử: \n1. Tắt "Ngăn chặn theo dõi chéo trang" trong cài đặt trình duyệt.\n2. Không sử dụng chế độ Ẩn danh.\n3. Mở ứng dụng bằng trình duyệt Chrome hoặc Safari thay vì từ ứng dụng khác (như Facebook/Zalo).');
      } else {
        setError('Đã có lỗi xảy ra khi đăng nhập. Vui lòng thử lại sau.');
      }
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-12 rounded-[2.5rem] shadow-2xl shadow-stone-200 border border-stone-100 text-center space-y-8 max-w-md w-full"
      >
        <div className="space-y-2">
          <h2 className="text-3xl font-serif italic font-bold tracking-tight">Chào mừng trở lại</h2>
          <p className="text-stone-500">Đăng nhập để quản lý nền tảng hướng dẫn viên China Guide của bạn.</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-left">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-600 whitespace-pre-line leading-relaxed">{error}</p>
          </div>
        )}

        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-stone-900 text-white rounded-full font-medium hover:bg-stone-800 transition-all group"
        >
          <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          Tiếp tục với Google
        </button>

        <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">
          Yêu cầu quyền quản trị để truy cập bảng điều khiển
        </p>
      </motion.div>
    </div>
  );
}
