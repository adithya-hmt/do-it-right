export type CalendarCommitment = {
  id: string;
  title: string;
  start: string;
  end: string;
  calendarColor: string | null;
};

export async function requestCalendarAccess() {
  return false;
}

export async function getCalendarCommitments(_start: Date, _end: Date): Promise<CalendarCommitment[]> {
  return [];
}
