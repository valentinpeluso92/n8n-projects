export interface TimeSlot {
  start: string; // HH:MM formato
  end: string; // HH:MM formato
}

export interface AvailableSlot {
  slot: TimeSlot;
  dayOfWeek: number; // 1=Lunes, 6=Sábado
  maxConcurrent: number;
  duration: number; // minutos
}
