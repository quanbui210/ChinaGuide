import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { UserProfile } from './types';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ContactModal from './components/ContactModal';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Login from './pages/Login';

export default function App() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isContactOpen, setIsContactOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const admins = ['quanbui021001@gmail.com', 'p.nhi551974@gmail.com'];
        if (userDoc.exists()) {
          const profile = userDoc.data() as UserProfile;
          if (admins.includes(user.email || '') && profile.role !== 'admin') {
            const updatedProfile = { ...profile, role: 'admin' as const };
            await setDoc(doc(db, 'users', user.uid), updatedProfile);
            setUserProfile(updatedProfile);
          } else {
            setUserProfile(profile);
          }
        } else {
          // Default role for new users (first user ever could be admin, but here we use email check in rules)
          const newProfile: UserProfile = {
            uid: user.uid,
            email: user.email || '',
            role: admins.includes(user.email || '') ? 'admin' : 'user',
          };
          await setDoc(doc(db, 'users', user.uid), newProfile);
          setUserProfile(newProfile);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-pulse text-stone-400 font-serif italic text-xl">Đang tải China Guide...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-stone-50 text-stone-900 font-sans">
        <Navbar userProfile={userProfile} onContactClick={() => setIsContactOpen(true)} />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin-auth" element={<Login userProfile={userProfile} />} />
            <Route path="/admin" element={<Admin userProfile={userProfile} />} />
          </Routes>
        </main>
        <Footer />
        <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
      </div>
    </Router>
  );
}
