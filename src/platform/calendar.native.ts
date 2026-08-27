import CalendarModule from 'expo-calendar';

import type { CalendarCommitment } from './calendar';

export async function requestCalendarAccess() {
  try {
    const permission = await CalendarModule.requestCalendarPermissions();
    return permission.granted;
  } catch {
    return false;
  }
}

export async function getCalendarCommitments(start: Date, end: Date): Promise<CalendarCommitment[]> {
  try {
    const calendars = (await CalendarModule.getCalendars()).filter((calendar) => !calendar.entityType || calendar.entityType === 'event');
    const eventGroups = await Promise.all(calendars.map(async (calendar) => ({ calendar, events: await calendar.listEvents(start, end) })));
    return eventGroups.flatMap(({ calendar, events }) => events.map((event) => ({ id: event.id, title: event.title, start: new Date(event.startDate ?? start).toISOString(), end: new Date(event.endDate ?? end).toISOString(), calendarColor: calendar.color ?? null })));
  } catch {
    return [];
  }
}
