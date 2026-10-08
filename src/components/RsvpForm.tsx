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

  UserCheck,

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

  const [secondGuestName, setSecondGuestName] = useState('');



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



    if (attending === 'yes' && hasPlusOne) {

      if (!secondGuestName.trim()) {

        errors.push('Please enter the name of the second guest.');

      }

    }



    if (errors.length > 0) {

      setFormErrors(errors);

      window.scrollTo({ top: document.getElementById('rsvp-section')?.offsetTop || 0, behavior: 'smooth' });

      return;

    }



    setFormErrors([]);



    const confirmationCode = isEditingExisting && currentEditId

      ? rsvps.find((r) => r.id === currentEditId)?.confirmationCode || `CT-${Math.floor(1000 + Math.random() * 9000)}`

      : `CT-${Math.floor(1000 + Math.random() * 9000)}`;



    const trimmedSecond = secondGuestName.trim();

    const nameParts = trimmedSecond.split(/\s+/);

    const plusOneFirstName = nameParts[0] || '';

    const plusOneLastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';



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

      plusOne:

        attending === 'yes' && hasPlusOne && trimmedSecond

          ? {

              firstName: plusOneFirstName,

              lastName: plusOneLastName,

            }

          : undefined,

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

    setSecondGuestName('');

    setNoteToCouple('');

    setFormErrors([]);

  };



  return (

    <section id="rsvp-section" className="py-6 sm:py-10 bg-[#FCFBF7] relative font-bold">

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        

        {/* Section Header */}

        <div className="text-center space-y-3 mb-8">

          <p className="text-xs sm:text-sm uppercase tracking-[0.25em] text-[#4E8765] font-black">

            WEDDING CELEBRATION. OCTOBER 24, 2026. Nyali

          </p>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black text-[#242E25] tracking-tight">

            Carol & Tim RSVP Portal

          </h1>

          <p className="text-xs sm:text-sm text-[#4E6354] max-w-md mx-auto font-extrabold">

            Please respond on or before <strong className="text-[#1D3222] font-black underline decoration-[#4E8765] decoration-2 underline-offset-4">October 15, 2026</strong>.

          </p>

        </div>



        {/* Confirmation Screen */}

        {submittedRsvp && (

          <div className="bg-[#FAF9F5] border-2 border-[#CCD8CE] rounded-3xl p-8 sm:p-12 shadow-sm text-center space-y-6">

            <div className="w-16 h-16 rounded-full bg-[#E5F3E9] text-[#4E8765] mx-auto flex items-center justify-center shadow-xs">

              <Check className="w-8 h-8 stroke-[3]" />

            </div>



            <div className="space-y-2">

              <p className="text-xs uppercase tracking-[0.25em] text-[#4E8765] font-black">

                RSVP Received

              </p>

              <h3 className="font-serif text-3xl sm:text-4xl font-black text-[#232F25]">

                {submittedRsvp.attending === 'yes'

                  ? `Thank You, ${submittedRsvp.primaryGuest.firstName}!`

                  : `Thank You for Letting Us Know, ${submittedRsvp.primaryGuest.firstName}`}

              </h3>

              <p className="text-sm text-[#465E4E] max-w-md mx-auto font-bold">

                {submittedRsvp.attending === 'yes'

                  ? 'We have recorded your RSVP and look forward to celebrating together on October 24, 2026 in Nyali.'

                  : 'We will truly miss having you with us, but thank you warmly for letting us know!'}

              </p>

            </div>



            {/* Confirmation details card */}

            <div className="bg-white border-2 border-[#DDD8CE] rounded-2xl p-6 text-left max-w-lg mx-auto space-y-4 shadow-xs">

              <div className="flex items-center justify-between border-b-2 border-[#F0ECE4] pb-3">

                <span className="text-xs uppercase tracking-wider text-[#476E54] font-black">

                  Confirmation Code

                </span>

                <span className="font-mono text-base font-black text-[#1F3D2A] bg-[#E8F3EC] px-3.5 py-1 rounded-md border border-[#BDDDC7]">

                  {submittedRsvp.confirmationCode}

                </span>

              </div>



              <div className="grid grid-cols-2 gap-4 text-xs text-[#2E3C30]">

                <div>

                  <span className="block text-[#5B8067] font-black mb-0.5 uppercase tracking-wider">Primary Guest</span>

                  <span className="font-black text-[#1C271E] text-sm">

                    {submittedRsvp.primaryGuest.firstName} {submittedRsvp.primaryGuest.lastName}

                  </span>

                </div>

                <div>

                  <span className="block text-[#5B8067] font-black mb-0.5 uppercase tracking-wider">Phone Number</span>

                  <span className="font-black font-mono text-[#1C271E] text-sm">

                    {submittedRsvp.primaryGuest.phone}

                  </span>

                </div>

                <div>

                  <span className="block text-[#5B8067] font-black mb-0.5 uppercase tracking-wider">Status</span>

                  <span className="font-black text-[#1C271E] text-sm">

                    {submittedRsvp.attending === 'yes' ? 'Joyfully Attending' : 'Regretfully Declined'}

                  </span>

                </div>

                {submittedRsvp.attending === 'yes' && (

                  <div>

                    <span className="block text-[#5B8067] font-black mb-0.5 uppercase tracking-wider">Total Seats</span>

                    <span className="text-[#1C271E] font-black text-sm">

                      {submittedRsvp.guestCount} {submittedRsvp.guestCount === 1 ? 'Guest' : 'Guests'}

                    </span>

                  </div>

                )}

                {submittedRsvp.hasPlusOne && submittedRsvp.plusOne && (

                  <div className="col-span-2 pt-2 border-t-2 border-[#F2EEE7]">

                    <span className="block text-[#5B8067] font-black mb-0.5 uppercase tracking-wider">Second Guest</span>

                    <span className="text-[#1C271E] font-black text-sm">

                      {[submittedRsvp.plusOne.firstName, submittedRsvp.plusOne.lastName].filter(Boolean).join(' ')}

                    </span>

                  </div>

                )}

                {submittedRsvp.noteToCouple && (

                  <div className="col-span-2 pt-2 border-t-2 border-[#F2EEE7]">

                    <span className="block text-[#5B8067] font-black mb-0.5 uppercase tracking-wider">Note to Couple</span>

                    <p className="text-[#1C271E] italic text-xs leading-relaxed font-bold">

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

                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider text-[#1F452C] bg-[#EAF4ED] hover:bg-[#DEEDE2] transition-colors border-2 border-[#BDDDC7] cursor-pointer shadow-xs"

                >

                  <CalendarPlus className="w-4 h-4 text-[#4E8765] stroke-[2.5]" />

                  <span>Add to Google Calendar</span>

                </a>



                <button

                  type="button"

                  onClick={downloadIcsFile}

                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider text-[#1F452C] bg-[#EAF4ED] hover:bg-[#DEEDE2] transition-colors border-2 border-[#BDDDC7] cursor-pointer shadow-xs"

                >

                  <Download className="w-4 h-4 text-[#4E8765] stroke-[2.5]" />

                  <span>Download .ICS File</span>

                </button>

              </div>

            )}



            <div className="pt-4 flex items-center justify-center gap-4 text-xs font-black">

              <button

                type="button"

                onClick={() => {

                  setSubmittedRsvp(null);

                  setIsEditingExisting(true);

                  setCurrentEditId(submittedRsvp.id);

                  if (submittedRsvp.guestCount === 2) {

                    setHasPlusOne(true);

                    if (submittedRsvp.plusOne) {

                      setSecondGuestName(

                        [submittedRsvp.plusOne.firstName, submittedRsvp.plusOne.lastName]

                          .filter(Boolean)

                          .join(' ')

                      );

                    }

                  } else {

                    setHasPlusOne(false);

                    setSecondGuestName('');

                  }

                }}

                className="text-[#3E7654] font-black hover:underline cursor-pointer flex items-center gap-1"

              >

                <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />

                <span>Edit This RSVP</span>

              </button>

              <span className="text-[#C4BCB0] font-black">·</span>

              <button

                type="button"

                onClick={handleResetForAnother}

                className="text-[#3E7654] font-black hover:underline cursor-pointer"

              >

                Submit Another RSVP

              </button>

            </div>

          </div>

        )}



        {/* RSVP FORM CONTAINER */}

        {!submittedRsvp && (

          <div className="bg-white border-2 border-[#E5E0D6] rounded-3xl p-6 sm:p-10 shadow-sm">

            <form onSubmit={handleSubmit} className="space-y-8 font-bold">

              

              {/* If editing banner */}

              {isEditingExisting && (

                <div className="p-4 bg-[#EDF6F0] border-2 border-[#BDDDC7] rounded-2xl flex items-center justify-between text-xs text-[#2A4D35] font-black">

                  <div>

                    <span className="font-black block uppercase tracking-wider">Editing Existing RSVP</span>

                    <span>Modifying details for confirmation code {rsvps.find((r) => r.id === currentEditId)?.confirmationCode}</span>

                  </div>

                  <button

                    type="button"

                    onClick={handleResetForAnother}

                    className="text-xs uppercase tracking-wider font-black text-[#3E7654] hover:underline cursor-pointer"

                  >

                    Cancel Edit

                  </button>

                </div>

              )}



              {/* Validation errors banner */}

              {formErrors.length > 0 && (

                <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl text-xs text-rose-900 space-y-1 font-bold">

                  <div className="flex items-center gap-2 font-black">

                    <AlertCircle className="w-4 h-4 shrink-0 stroke-[2.5]" />

                    <span>Please check the following before submitting:</span>

                  </div>

                  <ul className="list-disc list-inside pl-1 space-y-0.5 text-rose-800 font-bold">

                    {formErrors.map((err, i) => (

                      <li key={i}>{err}</li>

                    ))}

                  </ul>

                </div>

              )}



              {/* Step 1: Guest Identity */}

              <div className="space-y-4">

                <div className="border-b-2 border-[#EAE5DC] pb-3">

                  <span className="text-xs uppercase tracking-[0.2em] text-[#4E8765] font-black">

                    Step 1

                  </span>

                  <h3 className="font-serif text-2xl font-black text-[#242E25]">Guest Information</h3>

                </div>



                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <div>

                    <label className="block text-xs font-black uppercase tracking-wider text-[#354337] mb-1.5">

                      First Name <span className="text-rose-600 font-black">*</span>

                    </label>

                    <input

                      type="text"

                      required

                      value={firstName}

                      onChange={(e) => setFirstName(e.target.value)}

                      placeholder="Carol"

                      className="w-full px-4 py-3 bg-[#FCFBF7] border-2 border-[#D5CEC2] rounded-xl text-sm font-black text-[#242E25] focus:outline-none focus:ring-2 focus:ring-[#4E8765]"

                    />

                  </div>



                  <div>

                    <label className="block text-xs font-black uppercase tracking-wider text-[#354337] mb-1.5">

                      Last Name <span className="text-rose-600 font-black">*</span>

                    </label>

                    <input

                      type="text"

                      required

                      value={lastName}

                      onChange={(e) => setLastName(e.target.value)}

                      placeholder="Kimani"

                      className="w-full px-4 py-3 bg-[#FCFBF7] border-2 border-[#D5CEC2] rounded-xl text-sm font-black text-[#242E25] focus:outline-none focus:ring-2 focus:ring-[#4E8765]"

                    />

                  </div>

                </div>



                <div>

                  <div className="flex items-center justify-between mb-1.5">

                    <label className="block text-xs font-black uppercase tracking-wider text-[#354337]">

                      Phone Number <span className="text-rose-600 font-black">*</span>

                    </label>

                    <span className="text-[11px] text-[#4E705A] font-extrabold">One RSVP per phone number</span>

                  </div>

                  <div className="relative">

                    <Phone className="w-4 h-4 text-[#4E8765] absolute left-3.5 top-1/2 -translate-y-1/2 stroke-[2.5]" />

                    <input

                      type="tel"

                      required

                      value={phone}

                      onChange={(e) => setPhone(e.target.value)}

                      placeholder="+254 712 345678"

                      className="w-full pl-10 pr-4 py-3 bg-[#FCFBF7] border-2 border-[#D5CEC2] rounded-xl text-sm font-black text-[#242E25] focus:outline-none focus:ring-2 focus:ring-[#4E8765]"

                    />

                  </div>

                </div>

              </div>



              {/* Step 2: Attendance Decision */}

              <div className="space-y-4">

                <div className="border-b-2 border-[#EAE5DC] pb-3">

                  <span className="text-xs uppercase tracking-[0.2em] text-[#4E8765] font-black">

                    Step 2

                  </span>

                  <h3 className="font-serif text-2xl font-black text-[#242E25]">Attendance</h3>

                </div>



                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <button

                    type="button"

                    onClick={() => setAttending('yes')}

                    className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${

                      attending === 'yes'

                        ? 'bg-[#EDF7F0] border-[#4E8765] ring-2 ring-[#4E8765]'

                        : 'bg-white border-[#DDD7CD] hover:border-[#9BC2A7]'

                    }`}

                  >

                    <div className="flex items-center justify-between mb-2">

                      <span className="font-serif text-xl font-black text-[#242E25]">

                        Joyfully Accepts

                      </span>

                      <span

                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${

                          attending === 'yes' ? 'bg-[#4E8765] text-white shadow-xs' : 'border-2 border-[#C9C2B5]'

                        }`}

                      >

                        {attending === 'yes' && <Check className="w-4 h-4 stroke-[3]" />}

                      </span>

                    </div>

                    <p className="text-xs text-[#445D4C] font-extrabold">

                      I / We will be there to celebrate with you on October 24, 2026.

                    </p>

                  </button>



                  <button

                    type="button"

                    onClick={() => setAttending('no')}

                    className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${

                      attending === 'no'

                        ? 'bg-[#FAF4ED] border-[#A89484] ring-2 ring-[#A89484]'

                        : 'bg-white border-[#DDD7CD] hover:border-[#A4B2A8]'

                    }`}

                  >

                    <div className="flex items-center justify-between mb-2">

                      <span className="font-serif text-xl font-black text-[#242E25]">

                        Regretfully Declines

                      </span>

                      <span

                        className={`w-6 h-6 rounded-full flex items-center justify-center ${

                          attending === 'no' ? 'bg-[#8F7463] text-white' : 'border-2 border-[#C9C2B5]'

                        }`}

                      >

                        {attending === 'no' && <Check className="w-4 h-4 stroke-[3]" />}

                      </span>

                    </div>

                    <p className="text-xs text-[#5D6B60] font-extrabold">

                      I / We will be celebrating with you in spirit from afar.

                    </p>

                  </button>

                </div>

              </div>



              {/* Step 3: Number of Guests Area */}

              {attending === 'yes' && (

                <div className="space-y-6 pt-4 border-t-2 border-[#EAE5DC]">

                  <div className="space-y-4">

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

                      <div>

                        <span className="text-xs uppercase tracking-[0.2em] text-[#4E8765] font-black block mb-0.5">

                          Step 3

                        </span>

                        <h4 className="font-serif text-2xl font-black text-[#242E25]">

                          Number of guests included in your invitation

                        </h4>

                        <p className="text-xs text-[#415C49] mt-1.5 font-extrabold">

                          Please select the number of people named/included on your invitation

                        </p>

                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">

                        <button

                          type="button"

                          onClick={() => {

                            setHasPlusOne(false);

                            setSecondGuestName('');

                          }}

                          className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-2 ${

                            !hasPlusOne

                              ? 'bg-[#4E8765] text-white border-[#4E8765] shadow-xs'

                              : 'bg-[#EEF5F0] text-[#335E42] border-[#CDE3D5] hover:bg-[#E2EDE5]'

                          }`}

                        >

                          1- guest

                        </button>

                        <button

                          type="button"

                          onClick={() => setHasPlusOne(true)}

                          className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-2 ${

                            hasPlusOne

                              ? 'bg-[#4E8765] text-white border-[#4E8765] shadow-xs'

                              : 'bg-[#EEF5F0] text-[#335E42] border-[#CDE3D5] hover:bg-[#E2EDE5]'

                          }`}

                        >

                          2-Guests

                        </button>

                      </div>

                    </div>



                    {/* Place for second guest to write their name */}

                    {hasPlusOne && (

                      <div className="p-4 sm:p-5 bg-[#FAFDFB] border-2 border-[#BDDDC7] rounded-2xl space-y-2 mt-3 animate-in fade-in duration-200">

                        <div className="flex items-center justify-between">

                          <label className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#2A4D35]">

                            <UserCheck className="w-4 h-4 text-[#4E8765] stroke-[2.5]" />

                            <span>Second Guest's Full Name <span className="text-rose-600 font-black">*</span></span>

                          </label>

                          <span className="text-[11px] text-[#4E705A] font-extrabold bg-[#E5F3E9] px-2 py-0.5 rounded-full">

                            Included in Invitation

                          </span>

                        </div>

                        <input

                          type="text"

                          required={hasPlusOne}

                          value={secondGuestName}

                          onChange={(e) => setSecondGuestName(e.target.value)}

                          placeholder="e.g. Grace Wambui"

                          className="w-full px-4 py-3 bg-white border-2 border-[#B4D7BF] rounded-xl text-sm font-black text-[#242E25] focus:outline-none focus:ring-2 focus:ring-[#4E8765]"

                        />

                        <p className="text-[11px] text-[#4E705A] font-extrabold">

                          Please enter the name of the second person named/included on your invitation.

                        </p>

                      </div>

                    )}

                  </div>

                </div>

              )}



              {/* Note to the Couple */}

              <div className="space-y-2 pt-2 border-t-2 border-[#EAE5DC]">

                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#354337]">

                  <Heart className="w-4 h-4 text-[#4E8765] fill-[#4E8765]/20 stroke-[2.5]" />

                  <span>A Warm Wish or Note for Carol & Tim</span>

                </label>

                <textarea

                  rows={3}

                  value={noteToCouple}

                  onChange={(e) => setNoteToCouple(e.target.value)}

                  placeholder="Leave a heartfelt message, memory, or marriage advice..."

                  className="w-full px-4 py-3 bg-white border-2 border-[#D5CEC2] rounded-xl text-sm font-black text-[#242E25] focus:outline-none focus:ring-2 focus:ring-[#4E8765]"

                />

              </div>



              {/* Submit Action Button */}

              <div className="pt-4">

                <button

                  type="submit"

                  className="w-full py-4 rounded-full text-sm font-black uppercase tracking-wider text-white bg-[#4E8765] hover:bg-[#3F7354] active:scale-[0.99] transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"

                >

                  <span>

                    {isEditingExisting ? 'Update RSVP Details' : 'Confirm RSVP Response'}

                  </span>

                  <ArrowRight className="w-4 h-4 stroke-[3]" />

                </button>

                <p className="text-center text-xs text-[#526D59] mt-3 font-extrabold">

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
