<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { problemRows, type Problem } from '#lib/kb/problems';

  // `tickets`: where each problem is tracked now, e.g. { parser: { label: '#1', href: '…' } }.
  let { ticket, tickets = {} }: { ticket: number; tickets?: Partial<Record<Problem, { label: string; href: string }>> } =
    $props();

  // The same reports the desk's CauseTable counts: one id, one report, merged into this ticket.
  const merged = $derived(uniqueById(reports as Report[]).filter((r) => r.mergedInto === ticket));
  const rows = $derived(problemRows(merged, tenantOf, notes.oneDayMove));
  const under = (a: Record<string, number>) =>
    Object.entries(a)
      .map(([c, n]) => `${n} also counted under ${c}`)
      .join(' · ');
</script>

<p class="sum">
  <strong>{merged.length}</strong> reports merged into #{ticket} ·
  <strong>{rows.length}</strong>
  {rows.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each rows as r (r.problem)}
      {@const t = r.problem === 'unplaced' ? undefined : tickets[r.problem]}
      <tr>
        <td><code>{r.problem}</code></td>
        <td>
          <strong>{r.count}</strong>
          {#if r.alsoUnder}<span class="muted">({under(r.alsoUnder)})</span>{/if}
        </td>
        <td>{r.tenants}</td>
        <td>{r.firstSeen} → {r.lastSeen}</td>
        <td>{#if t}<a href={t.href}>{t.label}</a>{:else}<span class="warn">none yet</span>{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

{#each rows.filter((r) => r.ids.length <= 10) as r (r.problem)}
  <p class="ids"><code>{r.problem}</code>: {r.ids.join(', ')}</p>
{/each}

<style>
  .sum { font-size: 1.1rem; }
  .muted { color: var(--muted); font-size: 0.85em; }
  .warn { color: var(--warn); font-weight: 600; }
  .ids { color: var(--muted); font: 0.8rem var(--mono); }
</style>
