// hooks/useWorkout.ts
import { useState, useEffect } from 'react';
import { ScheduleItem, UserProfile } from '../types';
import { generateSchedule } from '../services/ia-service';

export function useWorkout(user: any, updateCurrentUser: Function) {
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    restrictions: [],
    availability: { days: [], time: '08:00' }
  });
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Sincronizar estado local com o usuário vindo do Auth
  useEffect(() => {
    if (user) {
      if (user.profile) setProfile(user.profile);
      if (user.schedule) setSchedule(user.schedule);
    } else {
      // Resetar se não houver usuário
      setProfile({ restrictions: [], availability: { days: [], time: '08:00' } });
      setSchedule([]);
    }
  }, [user]);


  const toggleRestriction = (id: string) => {
    setProfile(prev => {
      const current = prev.restrictions || [];
      return {
        ...prev,
        restrictions: current.includes(id) 
          ? current.filter(r => r !== id) 
          : [...current, id]
      };
    });
  };

  const toggleDay = (day: string) => {
    setProfile(prev => {
      const current = prev.availability?.days || [];
      return {
        ...prev,
        availability: {
          ...prev.availability!,
          days: current.includes(day) 
            ? current.filter(d => d !== day) 
            : [...current, day]
        }
      };
    });
  };

  const createSchedule = async () => {
    setIsGenerating(true);    
    const newSchedule = await generateSchedule(profile as UserProfile);
    setSchedule(newSchedule);
    updateCurrentUser({
      profile: profile,
      schedule: newSchedule
    });
    setIsGenerating(false);
    return true; // Indica sucesso
  };

  const completeExercise = (date: string) => {
    const updated = schedule.map(item => 
      item.date === date ? { ...item, status: 'completed' as const } : item
    );
    setSchedule(updated);
    updateCurrentUser({ schedule: updated });
  };

  return {
    profile,
    setProfile,
    schedule,
    isGenerating,
    toggleRestriction,
    toggleDay,
    createSchedule,
    completeExercise
  };
}