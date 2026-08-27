import React from 'react';

import { getCalendarCommitments, type CalendarCommitment } from '@/platform/calendar';

function dayBounds(date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

export function useCalendarCommitments(enabled = true) {
  const [commitments, setCommitments] = React.useState<CalendarCommitment[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!enabled) return;
    let active = true;
    const { start, end } = dayBounds();
    void getCalendarCommitments(start, end).then((next) => {
      if (!active) return;
      setCommitments(next.sort((a, b) => a.start.localeCompare(b.start)));
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [enabled]);

  return { commitments, loading };
}
