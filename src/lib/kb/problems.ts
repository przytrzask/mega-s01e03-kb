// The problems a merged ticket really holds, counted the desk's way.
// `parser` and `hint` are causes.ts's causes, placed by tenant (groupByCause). `one-day` is what the
// desk read in the report itself (desk-notes.json): a booking that moved by one day. The desk counts
// a report where it is filed and footnotes what it read (causes.ts, readAs), so a one-day report
// stays counted under its cause and is counted again here.
import { groupByCause, readAs, type Report, type Tenant } from '#lib/kb/causes';

// `one-day`: a time zone or day-boundary fault. The month-first parser cannot cause it: it swaps day
// and month, so a date moves by months, never by exactly one day.
export type Problem = 'parser' | 'hint' | 'one-day';

export type ProblemRow = {
  problem: Problem | 'unplaced';
  count: number;
  ids: string[];
  tenants: number;
  firstSeen: string;
  lastSeen: string;
  // For `one-day`: how many of its reports each cause also counts.
  alsoUnder?: Record<string, number>;
};

export function problemRows(
  reports: Report[],
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): ProblemRow[] {
  const groups = groupByCause(reports, tenantOf);
  const rows: ProblemRow[] = groups.map((g) => ({
    problem: g.cause,
    count: g.reports.length,
    ids: g.reports.map((r) => r.id).sort(),
    tenants: g.tenants,
    firstSeen: g.firstSeen,
    lastSeen: g.lastSeen,
  }));
  const moved = reports.filter((r) => oneDayMove.includes(r.id));
  if (moved.length) {
    const days = moved.map((r) => r.receivedAt.slice(0, 10)).sort();
    rows.push({
      problem: 'one-day',
      count: moved.length,
      ids: moved.map((r) => r.id).sort(),
      tenants: new Set(moved.map((r) => r.tenant)).size,
      firstSeen: days[0],
      lastSeen: days[days.length - 1],
      alsoUnder: Object.fromEntries(groups.map((g) => [g.cause, readAs(g, oneDayMove)]).filter(([, n]) => n)),
    });
  }
  return rows;
}
