export interface RSVPResponse {
  id: string;
  confirmationCode: string;
  primaryGuest: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
  };
  attending: 'yes' | 'no';
  guestCount: number;
  hasPlusOne: boolean;
  plusOne?: {
    firstName: string;
    lastName: string;
  };
  noteToCouple?: string;
  submittedAt: string;
  updatedAt: string;
}
