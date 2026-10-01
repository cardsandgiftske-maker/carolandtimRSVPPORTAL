import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-[#FCFBF7] border-b border-[#E2EAE4]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="font-serif text-2xl sm:text-3xl tracking-wide text-[#233527] font-bold block">
              Carol & Tim
            </span>
            <span className="text-[11px] tracking-[0.2em] uppercase text-[#4E8765] font-sans font-semibold">
              Saturday, October 24, 2026
            </span>
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 text-xs text-[#2A593A] bg-[#E8F3EC] border border-[#BDDDC7] px-4 py-1.5 rounded-full font-medium shadow-2xs">
              <span className="text-[#3A6B4B]">RSVP Deadline:</span>
              <strong className="font-semibold text-[#1B3F27]">October 15, 2026</strong>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
