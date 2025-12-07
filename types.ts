export interface Exercise {
  id: string;
  title: string;
  category: 'strength' | 'cardio' | 'flexibility';
  durationMin: number;
  intensity: 'low' | 'medium';
  contraindications: string[];
  description: string;
}

export interface UserProfile {
  name: string;
  age: number;
  restrictions: string[];
  availability: {
    days: string[];
    time: string;
  };
}

export interface UserAccount {
  email: string;
  password: string;
  profile: UserProfile | null;
  schedule: ScheduleItem[];
}

export interface ScheduleItem {
  date: string;
  exerciseId: string;
  status: 'pending' | 'completed';
}