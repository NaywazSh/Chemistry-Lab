import Link from 'next/link';
import { Check, ArrowLeft } from 'lucide-react';

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-900 to-black">
      <Link href="/" className="absolute top-8 left-8 text-slate-400 hover:text-white flex gap-2 items-center">
        <ArrowLeft size={20} /> Back to Lab
      </Link>

      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Unlock the Full Laboratory</h1>
        <p className="text-slate-400">Get access to 50+ advanced reaction simulations.</p>
      </div>

      <div className="p-10 rounded-3xl bg-slate-900 border border-amber-500/30 shadow-2xl shadow-amber-900/20 max-w-md w-full relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-amber-400 to-orange-600" />
        
        <div className="flex items-baseline gap-2 mb-6">
          <span className="text-5xl font-bold text-white">$29</span>
          <span className="text-slate-500">/year</span>
        </div>

        <ul className="space-y-4 mb-8 text-slate-300">
          {['Access to 50+ Premium Simulations', 'Advanced Organic Chemistry', 'Physics Integrations', 'Priority Support'].map((item, i) => (
            <li key={i} className="flex gap-3 items-center">
              <div className="bg-green-500/20 p-1 rounded-full text-green-400"><Check size={14} /></div>
              {item}
            </li>
          ))}
        </ul>

        <button className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-black font-bold text-lg rounded-xl hover:opacity-90 transition-opacity">
          Get Premium Access
        </button>
      </div>
    </div>
  );
}