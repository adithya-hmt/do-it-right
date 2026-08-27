import * as Notifications from 'expo-notifications';

export async function requestReminderAccess() {
  try {
    const permission = await Notifications.requestPermissionsAsync();
    return permission.granted;
  } catch {
    return false;
  }
}

export async function scheduleAnchorReminders(morningTime: string, eveningTime: string) {
  try {
    const [morningHour, morningMinute] = morningTime.split(':').map(Number);
    const [eveningHour, eveningMinute] = eveningTime.split(':').map(Number);
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({ content: { title: 'A little room for what matters.', body: 'Choose your Daily Three and give the day a shape.', data: { action: 'morning-plan' } }, trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: morningHour, minute: morningMinute } });
    await Notifications.scheduleNotificationAsync({ content: { title: 'Close the loops gently.', body: 'Take a minute to review what moved today.', data: { action: 'evening-reset' } }, trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: eveningHour, minute: eveningMinute } });
    return true;
  } catch {
    return false;
  }
}
