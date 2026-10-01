import React from 'react';
import { Lock } from 'lucide-react';

interface FooterProps {
  onOpenHostDashboard: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenHostDashboard }) => {
  return (
    <footer className="bg-[#242E26] text-[#E0E8E2] py-12 border-t border-[#1C251E]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        
        <div className="space-y-1">
          <h3 className="font-serif text-3xl sm:text-4xl text-[#FAF9F5] font-normal tracking-wide">
            Carol weds Tim
          </h3>
          <p className="text-sm font-sans tracking-wider text-[#A8BDAE]">
            October 24, 2026
          </p>
        </div>

        <div>
          <button
            onClick={onOpenHostDashboard}
            title="Host View"
            aria-label="Host View"
            className="inline-flex items-center justify-center w-9 h-9 rounded-full text-[#A8BEAD] hover:text-[#FAF9F5] bg-[#334237] hover:bg-[#3E5042] border border-[#485B4D] transition-all shadow-xs cursor-pointer"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>

        <div className="pt-6 border-t border-[#313E34] text-xs text-[#8A9C8E]">
          <p>© 2026ChartisandDonisWeddings. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
};
