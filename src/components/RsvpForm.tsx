import React, { useState } from 'react';
import {
  Check,
  AlertCircle,
  Heart,
  ArrowRight,
  Download,
  CalendarPlus,
  RefreshCw,
  Phone,
} from 'lucide-react';
import { RSVPResponse } from '../types/rsvp';
import { downloadIcsFile, getGoogleCalendarUrl } from '../utils/calendar';

interface RsvpFormProps {
  rsvps: RSVPResponse[];
  onSaveRsvp: (rsvp: RSVPResponse) => void;
}

export const RsvpForm: React.FC<RsvpFormProps> = ({ rsvps, onSaveRsvp }) => {
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [attending, setAttending] = useState<'yes' | 'no'>('yes');

  // Number of guests state: false = 1- guest, true = 2-Guests
  const [hasPlusOne, setHasPlusOne] = useState(false);

  // Note to couple
  const [noteToCouple, setNoteToCouple] = useState('');

  // Status & Confirmation
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [submittedRsvp, setSubmittedRsvp] = useState<RSVPResponse | null>(null);
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [currentEditId, setCurrentEditId] = useState<string | null>(null);

  const normalizePhone = (num: string) => num.replace(/\D/g, '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];

    if (!firstName.trim()) errors.push('Please enter your first name.');
    if (!lastName.trim()) errors.push('Please enter your last name.');

    const cleanPhone = normalizePhone(phone);
    if (!phone.trim()) {
      errors.push('Please enter your phone number.');
    } else if (cleanPhone.length < 7) {
      errors.push('Please enter a valid phone number (at least 7 digits).');
    } else {
      // Enforce: One phone number can submit only once
      const duplicate = rsvps.find(
        (r) => normalizePhone(r.primaryGuest.phone) === cleanPhone && r.id !== currentEditId
      );
      if (duplicate) {
        errors.push(
          `The phone number "${phone}" has already been used to submit an RSVP for ${duplicate.primaryGuest.firstName} ${duplicate.primaryGuest.lastName}. One phone number can submit only once.`
        );
      }
    }

    if (!attending) errors.push('Please select whether you will be attending or declining.');

    if (errors.length > 0) {
      setFormErrors(errors);
      window.scrollTo({ top: document.getElementById('rsvp-section')?.offsetTop || 0, behavior: 'smooth' });
      return;
    }

    setFormErrors([]);

    const confirmationCode = isEditingExisting && currentEditId
      ? rsvps.find((r) => r.id === currentEditId)?.confirmationCode || `CT-${Math.floor(1000 + Math.random() * 9000)}`
      : `CT-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRsvp: RSVPResponse = {
      id: currentEditId || `rsvp-${Date.now()}`,
      confirmationCode,
      primaryGuest: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
      },
      attending: attending as 'yes' | 'no',
      guestCount: attending === 'yes' ? (hasPlusOne ? 2 : 1) : 0,
      hasPlusOne: attending === 'yes' ? hasPlusOne : false,
      noteToCouple: noteToCouple.trim() || undefined,
      submittedAt: isEditingExisting
        ? (rsvps.find((r) => r.id === currentEditId)?.submittedAt || new Date().toISOString())
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveRsvp(newRsvp);
    setSubmittedRsvp(newRsvp);
  };

  const handleResetForAnother = () => {
    setSubmittedRsvp(null);
    setIsEditingExisting(false);
    setCurrentEditId(null);
    setFirstName('');
    setLastName('');
    setPhone('');
    setAttending('yes');
    setHasPlusOne(false);
    setNoteToCouple('');
    setFormErrors([]);
  };

  return (
    <section id="rsvp-section" className="py-8 sm:py-12 bg-[#FCFBF7] relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center space-y-2.5 mb-8">
          <p className="text-xs uppercase tracking-[0.28em] text-[#4E8765] font-bold">
            Wedding Celebration · October 24, 2026
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#242E25]">
            RSVP Portal
          </h1>
          <p className="text-xs sm:text-sm text-[#55695B] max-w-md mx-auto">
            Please respond on or before <strong className="text-[#1D3222] font-bold">October 15, 2026</strong>.
          </p>
        </div>

        {/* Confirmation Screen */}
        {submittedRsvp && (
          <div className="bg-[#FAF9F5] border border-[#CCD8CE] rounded-3xl p-8 sm:p-12 shadow-sm text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#E5F3E9] text-[#4E8765] mx-auto flex items-center justify-center shadow-xs">
              <Check className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.25em] text-[#4E8765] font-bold">
                RSVP Received
              </p>
              <h3 className="font-serif text-3xl sm:text-4xl font-bold text-[#232F25]">
                {submittedRsvp.attending === 'yes'
                  ? `Thank You, ${submittedRsvp.primaryGuest.firstName}!`
                  : `Thank You for Letting Us Know, ${submittedRsvp.primaryGuest.firstName}`}
              </h3>
              <p className="text-sm text-[#55695B] max-w-md mx-auto">
                {submittedRsvp.attending === 'yes'
                  ? 'We have recorded your RSVP and look forward to celebrating together on October 24, 2026.'
                  : 'We will truly miss having you with us, but thank you warmly for letting us know!'}
              </p>
            </div>

            {/* Confirmation details card */}
            <div className="bg-white border border-[#DDD8CE] rounded-2xl p-6 text-left max-w-lg mx-auto space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#F0ECE4] pb-3">
                <span className="text-xs uppercase tracking-wider text-[#52775E] font-bold">
                  Confirmation Code
                </span>
                <span className="font-mono text-base font-bold text-[#1F3D2A] bg-[#E8F3EC] px-3 py-1 rounded-md">
                  {submittedRsvp.confirmationCode}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs text-[#3E4B40]">
                <div>
                  <span className="block text-[#6D8F78] font-bold mb-0.5">Primary Guest</span>
                  <span className="font-bold text-[#202B22]">
                    {submittedRsvp.primaryGuest.firstName} {submittedRsvp.primaryGuest.lastName}
                  </span>
                </div>
                <div>
                  <span className="block text-[#6D8F78] font-bold mb-0.5">Phone Number</span>
                  <span className="font-bold font-mono text-[#202B22]">
                    {submittedRsvp.primaryGuest.phone}
                  </span>
                </div>
                <div>
                  <span className="block text-[#6D8F78] font-bold mb-0.5">Status</span>
                  <span className="font-bold text-[#202B22]">
                    {submittedRsvp.attending === 'yes' ? 'Joyfully Attending' : 'Regretfully Declined'}
                  </span>
                </div>
                {submittedRsvp.attending === 'yes' && (
                  <div>
                    <span className="block text-[#6D8F78] font-bold mb-0.5">Total Seats</span>
                    <span className="text-[#202B22] font-bold">
                      {submittedRsvp.guestCount} {submittedRsvp.guestCount === 1 ? 'Guest' : 'Guests'}
                    </span>
                  </div>
                )}
                {submittedRsvp.noteToCouple && (
                  <div className="col-span-2 pt-2 border-t border-[#F2EEE7]">
                    <span className="block text-[#6D8F78] font-bold mb-0.5">Note to Couple</span>
                    <p className="text-[#202B22] italic text-xs leading-relaxed">
                      "{submittedRsvp.noteToCouple}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Calendar Actions */}
            {submittedRsvp.attending === 'yes' && (
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <a
                  href={getGoogleCalendarUrl()}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-[#244A32] bg-[#EAF4ED] hover:bg-[#DEEDE2] transition-colors border border-[#BDDDC7] cursor-pointer shadow-2xs"
                >
                  <CalendarPlus className="w-4 h-4 text-[#4E8765]" />
                  <span>Add to Google Calendar</span>
                </a>

                <button
                  type="button"
                  onClick={downloadIcsFile}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-[#244A32] bg-[#EAF4ED] hover:bg-[#DEEDE2] transition-colors border border-[#BDDDC7] cursor-pointer shadow-2xs"
                >
                  <Download className="w-4 h-4 text-[#4E8765]" />
                  <span>Download .ICS File</span>
                </button>
              </div>
            )}

            <div className="pt-4 flex items-center justify-center gap-4 text-xs">
              <button
                type="button"
                onClick={() => {
                  setSubmittedRsvp(null);
                  setIsEditingExisting(true);
                  setCurrentEditId(submittedRsvp.id);
                  if (submittedRsvp.guestCount === 2) {
                    setHasPlusOne(true);
                  } else {
                    setHasPlusOne(false);
                  }
                }}
                className="text-[#4E8765] font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Edit This RSVP</span>
              </button>
              <span className="text-[#C4BCB0]">·</span>
              <button
                type="button"
                onClick={handleResetForAnother}
                className="text-[#4E8765] font-bold hover:underline cursor-pointer"
              >
                Submit Another RSVP
              </button>
            </div>
          </div>
        )}

        {/* RSVP FORM CONTAINER */}
        {!submittedRsvp && (
          <div className="bg-white border border-[#E5E0D6] rounded-3xl p-6 sm:p-10 shadow-xs">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* If editing banner */}
              {isEditingExisting && (
                <div className="p-4 bg-[#EDF6F0] border border-[#BDDDC7] rounded-2xl flex items-center justify-between text-xs text-[#2A4D35]">
                  <div>
                    <span className="font-bold block">Editing Existing RSVP</span>
                    <span>Modifying details for confirmation code {rsvps.find((r) => r.id === currentEditId)?.confirmationCode}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetForAnother}
                    className="text-xs uppercase tracking-wider font-bold text-[#4E8765] hover:underline cursor-pointer"
                  >
                    Cancel Edit
                  </button>
                </div>
              )}

              {/* Validation errors banner */}
              {formErrors.length > 0 && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 space-y-1">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Please check the following before submitting:</span>
                  </div>
                  <ul className="list-disc list-inside pl-1 space-y-0.5 text-rose-700">
                    {formErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Step 1: Guest Identity */}
              <div className="space-y-4">
                <div className="border-b border-[#EAE5DC] pb-3">
                  <span className="text-xs uppercase tracking-[0.2em] text-[#4E8765] font-bold">
                    Step 1
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-[#242E25]">Guest Information</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#475449] mb-1.5">
                      First Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Carol"
                      className="w-full px-4 py-3 bg-[#FCFBF7] border border-[#D5CEC2] rounded-xl text-sm text-[#242E25] focus:outline-none focus:ring-2 focus:ring-[#4E8765]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#475449] mb-1.5">
                      Last Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Kimani"
                      className="w-full px-4 py-3 bg-[#FCFBF7] border border-[#D5CEC2] rounded-xl text-sm text-[#242E25] focus:outline-none focus:ring-2 focus:ring-[#4E8765]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#475449]">
                      Phone Number <span className="text-rose-600">*</span>
                    </label>
                    <span className="text-[11px] text-[#5C7F68] font-medium">One RSVP per phone number</span>
                  </div>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#68987B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+254 712 345678"
                      className="w-full pl-10 pr-4 py-3 bg-[#FCFBF7] border border-[#D5CEC2] rounded-xl text-sm text-[#242E25] focus:outline-none focus:ring-2 focus:ring-[#4E8765]"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Attendance Decision */}
              <div className="space-y-4">
                <div className="border-b border-[#EAE5DC] pb-3">
                  <span className="text-xs uppercase tracking-[0.2em] text-[#4E8765] font-bold">
                    Step 2
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-[#242E25]">Attendance</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setAttending('yes')}
                    className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      attending === 'yes'
                        ? 'bg-[#EDF7F0] border-[#4E8765] ring-2 ring-[#4E8765]'
                        : 'bg-white border-[#DDD7CD] hover:border-[#9BC2A7]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-serif text-xl font-bold text-[#242E25]">
                        Joyfully Accepts
                      </span>
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          attending === 'yes' ? 'bg-[#4E8765] text-white shadow-xs' : 'border border-[#C9C2B5]'
                        }`}
                      >
                        {attending === 'yes' && <Check className="w-4 h-4" />}
                      </span>
                    </div>
                    <p className="text-xs text-[#526B5A]">
                      I / We will be there to celebrate with you on October 24, 2026.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAttending('no')}
                    className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      attending === 'no'
                        ? 'bg-[#FAF4ED] border-[#A89484] ring-2 ring-[#A89484]'
                        : 'bg-white border-[#DDD7CD] hover:border-[#A4B2A8]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-serif text-xl font-bold text-[#242E25]">
                        Regretfully Declines
                      </span>
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          attending === 'no' ? 'bg-[#937C6D] text-white' : 'border border-[#C9C2B5]'
                        }`}
                      >
                        {attending === 'no' && <Check className="w-4 h-4" />}
                      </span>
                    </div>
                    <p className="text-xs text-[#5D6B60]">
                      I / We will be celebrating with you in spirit from afar.
                    </p>
                  </button>
                </div>
              </div>

              {/* Step 3: Number of Guests Area */}
              {attending === 'yes' && (
                <div className="space-y-6 pt-4 border-t border-[#EAE5DC]">
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-xs uppercase tracking-[0.2em] text-[#4E8765] font-bold block mb-0.5">
                          Step 3
                        </span>
                        <h4 className="font-serif text-2xl font-bold text-[#242E25]">
                          Number of guests included in your invitation
                        </h4>
                        <p className="text-xs text-[#4F6856] mt-1.5 font-medium">
                          Please select the number of people named/included on your invitation
                        </p>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setHasPlusOne(false)}
                          className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            !hasPlusOne
                              ? 'bg-[#4E8765] text-white shadow-xs'
                              : 'bg-[#EEF5F0] text-[#3B684C] hover:bg-[#E2EDE5]'
                          }`}
                        >
                          1- guest
                        </button>
                        <button
                          type="button"
                          onClick={() => setHasPlusOne(true)}
                          className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            hasPlusOne
                              ? 'bg-[#4E8765] text-white shadow-xs'
                              : 'bg-[#EEF5F0] text-[#3B684C] hover:bg-[#E2EDE5]'
                          }`}
                        >
                          2-Guests
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Note to the Couple */}
              <div className="space-y-2 pt-2 border-t border-[#EAE5DC]">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#475449]">
                  <Heart className="w-3.5 h-3.5 text-[#4E8765]" />
                  <span>A Warm Wish or Note for Carol & Tim</span>
                </label>
                <textarea
                  rows={3}
                  value={noteToCouple}
                  onChange={(e) => setNoteToCouple(e.target.value)}
                  placeholder="Leave a heartfelt message, memory, or marriage advice..."
                  className="w-full px-4 py-3 bg-white border border-[#D5CEC2] rounded-xl text-sm text-[#242E25] focus:outline-none focus:ring-2 focus:ring-[#4E8765]"
                />
              </div>

              {/* Submit Action Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-4 rounded-full text-sm font-bold uppercase tracking-wider text-white bg-[#4E8765] hover:bg-[#3F7354] active:scale-[0.99] transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>
                    {isEditingExisting ? 'Update RSVP Details' : 'Confirm RSVP Response'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-center text-xs text-[#6B8473] mt-3 font-medium">
                  Responses must be confirmed by October 15, 2026.
                </p>
              </div>

            </form>
          </div>
        )}

      </div>
    </section>
  );
};
