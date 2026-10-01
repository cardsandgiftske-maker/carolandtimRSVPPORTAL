/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { RSVPResponse } from './types/rsvp';
import { Header } from './components/Header';
import { RsvpForm } from './components/RsvpForm';
import { HostDashboardModal } from './components/HostDashboardModal';
import { Footer } from './components/Footer';
import {
  saveRSVPToFirestore,
  deleteRSVPFromFirestore,
  subscribeToRSVPs,
} from './lib/firebase';

const DUMMY_IDS = ['rsvp-1', 'rsvp-2', 'rsvp-3', 'rsvp-4'];

export default function App() {
  const [rsvps, setRsvps] = useState<RSVPResponse[]>([]);
  const [isHostModalOpen, setIsHostModalOpen] = useState(false);

  // Real-time Firestore sync & purge any previous mock seed items
  useEffect(() => {
    // Purge any legacy mock records from Firestore
    DUMMY_IDS.forEach((id) => {
      deleteRSVPFromFirestore(id).catch(() => {});
    });

    const unsubscribe = subscribeToRSVPs(
      (firestoreRsvps) => {
        // Exclude any legacy mock items
        const realRsvps = firestoreRsvps.filter((r) => !DUMMY_IDS.includes(r.id));
        setRsvps(realRsvps);
      },
      (err) => {
        console.warn('Firestore subscription status:', err);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleSaveRsvp = async (newRsvp: RSVPResponse) => {
    // Optimistic local update
    setRsvps((prev) => {
      const existsIndex = prev.findIndex((r) => r.id === newRsvp.id);
      if (existsIndex >= 0) {
        const updated = [...prev];
        updated[existsIndex] = newRsvp;
        return updated;
      }
      return [newRsvp, ...prev];
    });

    // Persist to Cloud Firestore
    try {
      await saveRSVPToFirestore(newRsvp);
    } catch (e) {
      console.error('Failed to save RSVP to Firestore:', e);
    }
  };

  const handleDeleteRsvp = async (id: string) => {
    // Optimistic local update
    setRsvps((prev) => prev.filter((r) => r.id !== id));

    // Delete from Cloud Firestore
    try {
      await deleteRSVPFromFirestore(id);
    } catch (e) {
      console.error('Failed to delete RSVP from Firestore:', e);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFBF7] text-[#2C332D] flex flex-col font-sans selection:bg-[#7D9082]/20">
      
      {/* Navigation Header */}
      <Header />

      {/* Main Content: Dedicated RSVP Portal */}
      <main className="flex-1 pb-12">
        <RsvpForm rsvps={rsvps} onSaveRsvp={handleSaveRsvp} />
      </main>

      {/* Footer with Host View Button exclusively */}
      <Footer onOpenHostDashboard={() => setIsHostModalOpen(true)} />

      {/* Host & Couple Portal Modal */}
      <HostDashboardModal
        isOpen={isHostModalOpen}
        onClose={() => setIsHostModalOpen(false)}
        rsvps={rsvps}
        onDeleteRsvp={handleDeleteRsvp}
        onAddRsvp={handleSaveRsvp}
      />
    </div>
  );
}
