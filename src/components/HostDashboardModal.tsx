import React, { useState } from 'react';
import {
  X,
  Lock,
  Download,
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  Plus,
  Key,
  ShieldCheck,
} from 'lucide-react';
import { RSVPResponse } from '../types/rsvp';
import { exportRSVPsToCSV } from '../utils/calendar';

interface HostDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  rsvps: RSVPResponse[];
  onDeleteRsvp: (id: string) => void;
  onAddRsvp: (rsvp: RSVPResponse) => void;
}

export const HostDashboardModal: React.FC<HostDashboardModalProps> = ({
  isOpen,
  onClose,
  rsvps,
  onDeleteRsvp,
  onAddRsvp,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'attending' | 'declined'>('all');

  // Manual Add Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFirst, setNewFirst] = useState('');
  const [newLast, setNewLast] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newStatus, setNewStatus] = useState<'yes' | 'no'>('yes');
  const [newGuestCount, setNewGuestCount] = useState<1 | 2>(1);
  const [manualAddError, setManualAddError] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'carol2026') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Incorrect passcode. Hint: Use "2026" to log in.');
    }
  };

  // Metrics
  const attendingRsvps = rsvps.filter((r) => r.attending === 'yes');
  const declinedRsvps = rsvps.filter((r) => r.attending === 'no');
  const totalHeadcount = attendingRsvps.reduce((acc, r) => acc + r.guestCount, 0);

  const normalizePhone = (num: string) => num.replace(/\D/g, '');

  // Filtered guest list
  const filteredRsvps = rsvps.filter((r) => {
    const query = searchQuery.trim().toLowerCase();
    const queryDigits = normalizePhone(searchQuery);
    const rPhoneDigits = normalizePhone(r.primaryGuest.phone || '');

    const matchesSearch =
      r.primaryGuest.firstName.toLowerCase().includes(query) ||
      r.primaryGuest.lastName.toLowerCase().includes(query) ||
      (r.primaryGuest.phone && r.primaryGuest.phone.toLowerCase().includes(query)) ||
      (queryDigits && rPhoneDigits && rPhoneDigits.includes(queryDigits)) ||
      r.confirmationCode.toLowerCase().includes(query);

    if (statusFilter === 'attending') return matchesSearch && r.attending === 'yes';
    if (statusFilter === 'declined') return matchesSearch && r.attending === 'no';
    return matchesSearch;
  });

  const handleCreateManualGuest = (e: React.FormEvent) => {
    e.preventDefault();
    setManualAddError('');
    if (!newFirst.trim() || !newLast.trim()) {
      setManualAddError('Please enter both first and last name.');
      return;
    }

    const cleanPhone = normalizePhone(newPhone);
    if (!newPhone.trim() || cleanPhone.length < 7) {
      setManualAddError('Please enter a valid phone number (at least 7 digits).');
      return;
    }

    const duplicate = rsvps.find((r) => normalizePhone(r.primaryGuest.phone) === cleanPhone);
    if (duplicate) {
      setManualAddError(
        `This phone number is already registered for ${duplicate.primaryGuest.firstName} ${duplicate.primaryGuest.lastName}. One submission per phone number.`
      );
      return;
    }

    const newRsvp: RSVPResponse = {
      id: `rsvp-manual-${Date.now()}`,
      confirmationCode: `CT-${Math.floor(1000 + Math.random() * 9000)}`,
      primaryGuest: {
        firstName: newFirst.trim(),
        lastName: newLast.trim(),
        phone: newPhone.trim(),
      },
      attending: newStatus,
      guestCount: newStatus === 'yes' ? newGuestCount : 0,
      hasPlusOne: newStatus === 'yes' && newGuestCount === 2,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onAddRsvp(newRsvp);
    setShowAddModal(false);
    setNewFirst('');
    setNewLast('');
    setNewPhone('');
    setNewStatus('yes');
    setNewGuestCount(1);
    setManualAddError('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#FAF9F5] border border-[#CCD8CE] rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Top Header */}
        <div className="bg-[#1E3024] text-[#FAF9F5] px-6 py-4 flex items-center justify-between border-b border-[#294232]">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#97C5A5]" />
            <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-wide">
              Host & Wedding Organizer Portal
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-[#A2C7B0] hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 text-center max-w-md mx-auto space-y-6 my-auto">
            <div className="w-14 h-14 rounded-full bg-[#E5F3E9] text-[#4E8765] mx-auto flex items-center justify-center shadow-xs">
              <Lock className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h4 className="font-serif text-2xl font-bold text-[#242E25]">Organizer Passcode Required</h4>
              <p className="text-xs text-[#59705F]">
                Please enter the couple passcode to view the guest list, phone numbers, and export rosters.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-3">
              <div className="relative">
                <Key className="w-4 h-4 text-[#68987B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter passcode (hint: carol2026)"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D5CEC2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4E8765]"
                />
              </div>

              {authError && <p className="text-xs text-rose-700 font-medium">{authError}</p>}

              <button
                type="submit"
                className="w-full py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-[#4E8765] hover:bg-[#3E7252] transition-colors cursor-pointer shadow-xs"
              >
                Access Dashboard
              </button>

              <button
                type="button"
                onClick={() => {
                  setPasscode('carol2026');
                  setIsAuthenticated(true);
                }}
                className="text-[11px] text-[#4E8765] font-bold hover:underline block mx-auto cursor-pointer"
              >
                Quick Preview as Couple (Click here)
              </button>
            </form>
          </div>
        ) : (
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            
            {/* Top Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="bg-white border border-[#DDD7CD] p-4 rounded-2xl shadow-2xs">
                <span className="text-[11px] uppercase tracking-wider text-[#698671] font-bold block">
                  Total Responses
                </span>
                <span className="font-serif text-3xl font-bold text-[#242E25] tabular-nums">
                  {rsvps.length}
                </span>
                <span className="text-[11px] text-[#5A7061] block mt-0.5 font-medium">Invitations accounted</span>
              </div>

              <div className="bg-white border border-[#DDD7CD] p-4 rounded-2xl shadow-2xs">
                <span className="text-[11px] uppercase tracking-wider text-[#3D7853] font-bold block">
                  Attending Guests
                </span>
                <span className="font-serif text-3xl font-bold text-[#3D7853] tabular-nums">
                  {totalHeadcount}
                </span>
                <span className="text-[11px] text-[#5A7061] block mt-0.5 font-medium">
                  ({attendingRsvps.length} responses)
                </span>
              </div>

              <div className="bg-white border border-[#DDD7CD] p-4 rounded-2xl shadow-2xs">
                <span className="text-[11px] uppercase tracking-wider text-[#8A7869] font-bold block">
                  Declined
                </span>
                <span className="font-serif text-3xl font-bold text-[#8A7869] tabular-nums">
                  {declinedRsvps.length}
                </span>
                <span className="text-[11px] text-[#637265] block mt-0.5 font-medium">Regretfully declined</span>
              </div>

              <div className="bg-[#FAFDFB] border border-[#BDDDC7] p-4 rounded-2xl shadow-2xs flex flex-col justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#3D7853] font-bold block">
                    Export Data
                  </span>
                  <span className="text-xs text-[#526054] font-medium">Roster for planning</span>
                </div>
                <button
                  type="button"
                  onClick={() => exportRSVPsToCSV(rsvps)}
                  className="mt-2 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#4E8765] hover:bg-[#3E7252] transition-colors cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </button>
              </div>
            </div>

            {/* RSVP Guest List */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h4 className="font-serif text-xl font-bold text-[#242E25]">Guest RSVP Roster</h4>
                  <span className="text-xs bg-[#E8F3EC] text-[#2A5D3B] px-2.5 py-0.5 rounded-full font-bold border border-[#BDDDC7]">
                    {filteredRsvps.length} {filteredRsvps.length === 1 ? 'record' : 'records'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#4E8765] hover:bg-[#3E7252] transition-colors cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Guest Manually</span>
                  </button>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#698E76] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, phone number, or confirmation code..."
                    className="w-full pl-10 pr-4 py-2 bg-white border border-[#DDD7CD] rounded-xl text-xs text-[#242E25] focus:outline-none focus:ring-2 focus:ring-[#4E8765]"
                  />
                </div>

                <div className="flex items-center gap-1.5 bg-[#E6ECE8] p-1 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                      statusFilter === 'all'
                        ? 'bg-white text-[#242E25] shadow-2xs font-bold'
                        : 'text-[#5A7363] hover:text-[#242E25]'
                    }`}
                  >
                    All ({rsvps.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('attending')}
                    className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                      statusFilter === 'attending'
                        ? 'bg-white text-[#3D7853] shadow-2xs font-bold'
                        : 'text-[#5A7363] hover:text-[#242E25]'
                    }`}
                  >
                    Attending ({attendingRsvps.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('declined')}
                    className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                      statusFilter === 'declined'
                        ? 'bg-white text-[#8A7869] shadow-2xs font-bold'
                        : 'text-[#5A7363] hover:text-[#242E25]'
                    }`}
                  >
                    Declined ({declinedRsvps.length})
                  </button>
                </div>
              </div>

              {/* Guest Table */}
              <div className="bg-white border border-[#DDD7CD] rounded-2xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F8F6F0] text-[#4F6456] font-bold border-b border-[#EAE5DC] uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Code</th>
                        <th className="py-3 px-4">Guest Name</th>
                        <th className="py-3 px-4">Phone Number</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Seats Included</th>
                        <th className="py-3 px-4">Note to Couple</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1ECE4]">
                      {filteredRsvps.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-[#748A7A]">
                            No guest responses found.
                          </td>
                        </tr>
                      ) : (
                        filteredRsvps.map((rsvp) => (
                          <tr key={rsvp.id} className="hover:bg-[#FAF9F5] transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-[#242E25]">
                              {rsvp.confirmationCode}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-[#242E25]">
                                {rsvp.primaryGuest.firstName} {rsvp.primaryGuest.lastName}
                              </div>
                            </td>
                            <td className="py-3 px-4 font-mono text-[#526054]">
                              {rsvp.primaryGuest.phone || '—'}
                            </td>
                            <td className="py-3 px-4">
                              {rsvp.attending === 'yes' ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2A653C] bg-[#E5F3E9] px-2.5 py-0.5 rounded-full border border-[#BBDBC4]">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Attending
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#7D6B5D] bg-[#F2EDE8] px-2.5 py-0.5 rounded-full">
                                  <XCircle className="w-3 h-3" />
                                  Declined
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 font-bold text-[#242E25] tabular-nums">
                              {rsvp.attending === 'yes' ? `${rsvp.guestCount} ${rsvp.guestCount === 1 ? 'Guest' : 'Guests'}` : '0'}
                            </td>
                            <td className="py-3 px-4 text-[#4E5C50] max-w-xs truncate">
                              {rsvp.noteToCouple ? (
                                <span title={rsvp.noteToCouple} className="italic">
                                  "{rsvp.noteToCouple}"
                                </span>
                              ) : (
                                <span className="text-[#96A498]">—</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => onDeleteRsvp(rsvp.id)}
                                className="text-stone-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                                title="Delete response"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Manual Add Guest Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="font-serif text-xl font-bold text-[#242E25]">Manually Add Guest RSVP</h4>
              <button onClick={() => setShowAddModal(false)} className="text-stone-400 hover:text-stone-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {manualAddError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium">
                {manualAddError}
              </div>
            )}

            <form onSubmit={handleCreateManualGuest} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 font-bold mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  value={newFirst}
                  onChange={(e) => setNewFirst(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4E8765]"
                />
              </div>
              <div>
                <label className="block text-stone-700 font-bold mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  value={newLast}
                  onChange={(e) => setNewLast(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4E8765]"
                />
              </div>
              <div>
                <label className="block text-stone-700 font-bold mb-1">Phone Number * (Must be unique)</label>
                <input
                  type="tel"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="e.g. +254 712 345678"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4E8765]"
                />
              </div>
              <div>
                <label className="block text-stone-700 font-bold mb-1">Attendance</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewStatus('yes')}
                    className={`flex-1 py-2 rounded-lg cursor-pointer transition-all ${
                      newStatus === 'yes' ? 'bg-[#4E8765] text-white shadow-xs font-bold' : 'bg-stone-100 text-stone-700 font-medium'
                    }`}
                  >
                    Attending
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewStatus('no')}
                    className={`flex-1 py-2 rounded-lg cursor-pointer transition-all ${
                      newStatus === 'no' ? 'bg-[#8A796D] text-white font-bold' : 'bg-stone-100 text-stone-700 font-medium'
                    }`}
                  >
                    Declined
                  </button>
                </div>
              </div>
              {newStatus === 'yes' && (
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Number of Guests</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setNewGuestCount(1)}
                      className={`flex-1 py-2 rounded-lg cursor-pointer transition-all ${
                        newGuestCount === 1 ? 'bg-[#4E8765] text-white shadow-xs font-bold' : 'bg-stone-100 text-stone-700 font-medium'
                      }`}
                    >
                      1- guest
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewGuestCount(2)}
                      className={`flex-1 py-2 rounded-lg cursor-pointer transition-all ${
                        newGuestCount === 2 ? 'bg-[#4E8765] text-white shadow-xs font-bold' : 'bg-stone-100 text-stone-700 font-medium'
                      }`}
                    >
                      2-Guests
                    </button>
                  </div>
                </div>
              )}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 rounded-xl bg-stone-100 text-stone-600 cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-[#4E8765] hover:bg-[#3E7252] text-white font-bold cursor-pointer shadow-xs"
                >
                  Save Guest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
