import React from 'react';
import { Lock } from 'lucide-react';

interface FooterProps {
  onOpenHostDashboard: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenHostDashboard }) => {
  return (
    <footer className="bg-[#1E3024] text-[#E3EDE6] py-12 border-t border-[#18261D]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        
        <div className="space-y-1">
          <h3 className="font-serif text-3xl sm:text-4xl text-[#FAF9F5] font-normal tracking-wide">
            Carol weds Tim
          </h3>
          <p className="text-sm font-sans tracking-wider text-[#A2C7B0]">
            October 24, 2026
          </p>
        </div>

        <div>
          <button
            onClick={onOpenHostDashboard}
            title="Host View"
            aria-label="Host View"
            className="inline-flex items-center justify-center w-9 h-9 rounded-full text-[#A8D3B7] hover:text-[#FAF9F5] bg-[#294232] hover:bg-[#33533E] border border-[#3E654C] transition-all shadow-xs cursor-pointer"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>

        <div className="pt-6 border-t border-[#2A4333] text-xs text-[#8BB299]">
          <p>© 2026ChartisandDonisWeddings. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
};
