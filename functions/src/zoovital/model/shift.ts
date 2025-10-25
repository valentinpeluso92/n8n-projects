export interface Shift {
  clientId: string;
  date: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  status?: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  duration?: number; // en minutos
  veterinarian?: string;
  service?: string;
}
