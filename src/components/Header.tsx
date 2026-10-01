import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-[#FCFBF7] border-b border-[#E8ECE9]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="font-serif text-2xl sm:text-3xl tracking-wide text-[#2B352E] font-medium block">
              Carol & Tim
            </span>
            <span className="text-[11px] tracking-[0.2em] uppercase text-[#7D9082] font-sans font-semibold">
              Saturday, October 24, 2026
            </span>
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 text-xs text-[#425246] bg-[#EDF2EE] border border-[#CCD7CF] px-3.5 py-1.5 rounded-full font-medium">
              <span>RSVP Deadline:</span>
              <strong className="font-semibold text-[#1C261F]">October 15, 2026</strong>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
