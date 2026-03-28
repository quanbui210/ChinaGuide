import { MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="footer" className="bg-stone-50 text-stone-400 py-12 border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 opacity-50">
          <MapPin className="w-5 h-5 text-orange-600" />
          <span className="font-serif italic font-bold text-lg tracking-tight text-stone-900">China Guide</span>
        </div>
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
          © 2026 China Guide. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
