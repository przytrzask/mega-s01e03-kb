<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import type { Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { groupByProblem, mergedInto, type Problem } from '#lib/kb/problems';

  // `tickets`: where each problem is tracked now, e.g. { parser: { label: '#1', href: '…' } }.
  let { ticket, tickets = {} }: { ticket: number; tickets?: Partial<Record<Problem, { label: string; href: string }>> } =
    $props();

  const rows = (reports as Report[]).filter((r) => r.mergedInto === ticket).length;
  const merged = $derived(mergedInto(reports as Report[], ticket));
  const groups = $derived(groupByProblem(merged, tenantOf, notes.oneDayMove));
  const placed = $derived(groups.reduce((n, g) => n + g.ids.length, 0));
  const channels = (c: Record<string, number>) =>
    Object.entries(c)
      .sort((a, b) => b[1] - a[1])
      .map(([ch, n]) => `${ch} ×${n}`)
      .join(' · ');
</script>

<p class="sum">
  <strong>{merged.length}</strong> reports in #{ticket}
  <span class="muted">({rows} rows in the export; repeated ids counted once)</span> ·
  <strong>{groups.length}</strong>
  {groups.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>came in by</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each groups as g (g.problem)}
      {@const t = g.problem === 'unplaced' ? undefined : tickets[g.problem]}
      <tr>
        <td><code>{g.problem}</code></td>
        <td><strong>{g.ids.length}</strong></td>
        <td>{g.tenants.length}</td>
        <td class="muted">{channels(g.channels)}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>{#if t}<a href={t.href}>{t.label}</a>{:else}<span class="warn">none yet</span>{/if}</td>
      </tr>
    {/each}
  </tbody>
  <tfoot>
    <tr><td>total</td><td><strong>{placed}</strong></td><td colspan="4" class:warn={placed !== merged.length}>
      {placed === merged.length ? `every report in #${ticket} placed once` : `${merged.length - placed} reports not placed`}
    </td></tr>
  </tfoot>
</table>

{#each groups.filter((g) => g.ids.length <= 10) as g (g.problem)}
  <p class="ids"><code>{g.problem}</code>: {g.ids.join(', ')}</p>
{/each}

<style>
  .sum { font-size: 1.1rem; }
  .muted { color: var(--muted); font-size: 0.85em; }
  .warn { color: var(--warn); font-weight: 600; }
  .ids { color: var(--muted); font: 0.8rem var(--mono); }
  tfoot td { border-bottom: 0; }
</style>
