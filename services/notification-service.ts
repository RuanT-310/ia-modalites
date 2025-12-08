import notifee, {
  TimestampTrigger,
  TriggerType,
  AndroidImportance,
} from '@notifee/react-native';
import { ScheduleItem, Exercise } from '../types';

export const notificationService = {
  /**
   * Pede permissão para notificações
   */
  requestPermissions: async () => {
    const settings = await notifee.requestPermission();

    if (settings.authorizationStatus < 1) {
      throw new Error('Permissão de notificação negada.');
    }
  },

  /**
   * Cria canal obrigatório no Android
   */
  createChannel: async () => {
    await notifee.createChannel({
      id: 'workout-reminders',
      name: 'Lembretes de Treino',
      importance: AndroidImportance.HIGH,
    });
  },

  /**
   * Agenda notificações para todo o cronograma
   */
  scheduleWorkoutReminders: async (
    schedule: ScheduleItem[],
    preferredTime: string = '08:00',
    catalog: Exercise[],
  ) => {
    // 1. Cancela todas as notificações agendadas anteriormente
    await notifee.cancelAllNotifications();

    // 2. Garante canal (Android)
    await notificationService.createChannel();

    const [hourStr, minuteStr] = preferredTime.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    for (const item of schedule) {
      if (item.status === 'completed') continue;

      const [year, month, day] = item.date.split('-').map(Number);

      // Criação da data final (fuso horário correto)
      const triggerDate = new Date(
        year,
        month - 1,
        day,
        hour,
        minute,
        0,
      );

      if (triggerDate.getTime() < Date.now()) continue;

      const exercise = catalog.find(e => e.id === item.exerciseId);
      const title = exercise
        ? `Hora do treino: ${exercise.title}`
        : 'Hora do Treino!';

      // Notifee usa trigger tipo timestamp
      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: triggerDate.getTime(),
      };

      await notifee.createTriggerNotification(
        {
          title: title,
          body: `Mantenha o foco! Seu treino de ${exercise?.durationMin} min está te esperando.`,
          android: {
            channelId: 'workout-reminders',
            smallIcon: 'ic_launcher',
          },
        },
        trigger,
      );
    }

    console.log('Notificações agendadas com sucesso (Notifee).');
  },
};
