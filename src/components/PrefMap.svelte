<script lang="ts">
  import { interpolateRgb, scaleSequential } from 'd3';
  import FilterBar from './FilterBar.svelte';
  import { applyFilters } from '../lib/filters';
  import { useUrlFilters } from '../lib/urlState.svelte';
  import { PREFECTURES } from '../lib/japan';
  import { link } from '../lib/url';
  import type { Player, School } from '../lib/data';

  interface Props {
    players: Player[];
    schools: School[];
  }
  let { players, schools }: Props = $props();

  const schoolById = new Map(schools.map((s) => [s.id, s]));
  const years = players.map((p) => p.draftYear);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const ui = useUrlFilters(minYear, maxYear);

  const METRICS = {
    pros: { label: 'プロ輩出数', unit: '人', format: (v: number) => String(v) },
    appearances: { label: '甲子園出場回数', unit: '回', format: (v: number) => String(v) },
    winRate: { label: '甲子園勝率', unit: '', format: (v: number) => v.toFixed(3).replace(/^0/, '') },
  } as const;
  type MetricKey = keyof typeof METRICS;
  let metric = $state<MetricKey>('pros');
  let selected = $state<string | null>(null);

  const TILE = 52, GAP = 4, STEP = TILE + GAP;
  const cols = Math.max(...PREFECTURES.map((p) => p.x)) + 1;
  const rows = Math.max(...PREFECTURES.map((p) => p.y)) + 1;

  const filtered = $derived(applyFilters(players, schoolById, ui.filters));

  const byPref = $derived.by(() => {
    const m = new Map<string, { pros: number; appearances: number; wins: number; losses: number; schools: number }>();
    for (const p of PREFECTURES) m.set(p.name, { pros: 0, appearances: 0, wins: 0, losses: 0, schools: 0 });
    for (const s of schools) {
      const v = m.get(s.prefecture)!;
      v.appearances += s.appearances;
      v.wins += s.wins;
      v.losses += s.losses;
      v.schools++;
    }
    for (const p of filtered) m.get(schoolById.get(p.schoolId)!.prefecture)!.pros++;
    return m;
  });

  function valueOf(pref: string): number | null {
    const v = byPref.get(pref)!;
    if (metric === 'winRate') return v.wins + v.losses ? v.wins / (v.wins + v.losses) : null;
    return v[metric];
  }

  const color = $derived.by(() => {
    const values = PREFECTURES.map((p) => valueOf(p.name)).filter((v): v is number => v !== null);
    const max = Math.max(...values, 0);
    const min = metric === 'winRate' ? Math.min(...values, max) : 0;
    return scaleSequential(interpolateRgb('#e6f1fb', '#0c447c')).domain([min, max || 1]);
  });

  const ranking = $derived(
    PREFECTURES.map((p) => ({ name: p.name, v: valueOf(p.name) }))
      .filter((r) => r.v !== null && r.v > 0)
      .sort((a, b) => b.v! - a.v!)
      .slice(0, 10),
  );

  const selectedSchools = $derived(
    selected
      ? schools
          .filter((s) => s.prefecture === selected)
          .map((s) => ({ ...s, pros: filtered.filter((p) => p.schoolId === s.id).length }))
          .sort((a, b) => b.pros - a.pros || b.appearances - a.appearances)
      : [],
  );
</script>

<FilterBar bind:filters={ui.filters} {minYear} {maxYear} keys={['league', 'position', 'round', 'koshien']} />

<div class="metric" role="group" aria-label="色分けする指標">
  <span class="label">色分け</span>
  {#each Object.entries(METRICS) as [key, m]}
    <button class="chip" class:on={metric === key} aria-pressed={metric === key} onclick={() => (metric = key as MetricKey)}>{m.label}</button>
  {/each}
</div>

<div class="layout">
  <div class="card map-card">
    <div class="chart-scroll">
      <svg viewBox="0 0 {cols * STEP} {rows * STEP}" role="img" aria-label="都道府県タイルマップ（{METRICS[metric].label}）">
        {#each PREFECTURES as p (p.name)}
          {@const v = valueOf(p.name)}
          {@const dark = v !== null && (color.domain()[1] - color.domain()[0]) > 0 && (v - color.domain()[0]) / (color.domain()[1] - color.domain()[0]) > 0.55}
          <g
            class="tile"
            class:sel={selected === p.name}
            role="button"
            tabindex="0"
            aria-label="{p.name} {v === null ? 'データなし' : METRICS[metric].format(v) + METRICS[metric].unit}"
            onclick={() => (selected = selected === p.name ? null : p.name)}
            onkeydown={(e) => e.key === 'Enter' && (selected = selected === p.name ? null : p.name)}
          >
            <rect x={p.x * STEP} y={p.y * STEP} width={TILE} height={TILE} rx="6" fill={v === null ? 'var(--surface-muted)' : color(v)} />
            <text x={p.x * STEP + TILE / 2} y={p.y * STEP + 21} text-anchor="middle" class="name" fill={dark ? '#ffffff' : '#0c447c'}>{p.name}</text>
            <text x={p.x * STEP + TILE / 2} y={p.y * STEP + 38} text-anchor="middle" class="val" fill={dark ? '#e6f1fb' : '#185fa5'}>
              {v === null ? '–' : METRICS[metric].format(v)}
            </text>
          </g>
        {/each}
      </svg>
    </div>
    <p class="hint">都道府県をクリックすると、その地域の高校が右に出ます。</p>
  </div>

  <aside class="side">
    {#if selected}
      <div class="side-head">
        <h2>{selected}の高校</h2>
        <button class="close" onclick={() => (selected = null)}>閉じる</button>
      </div>
      {#if selectedSchools.length}
        <table>
          <thead><tr><th>高校</th><th class="num">プロ</th><th class="num">甲子園</th></tr></thead>
          <tbody>
            {#each selectedSchools as s (s.id)}
              <tr>
                <td><a href={link(`/schools/${s.id}/`)}>{s.name}</a></td>
                <td class="num">{s.pros}</td>
                <td class="num">{s.appearances}回</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {:else}
        <p class="muted">登録されている高校はまだありません。</p>
      {/if}
    {:else}
      <h2>{METRICS[metric].label} 上位10</h2>
      <ol class="rank">
        {#each ranking as r, i (r.name)}
          <li>
            <button onclick={() => (selected = r.name)}>
              <span class="pos">{i + 1}</span><span class="n">{r.name}</span>
              <span class="bar"><span style="width: {(r.v! / ranking[0].v!) * 100}%"></span></span>
              <span class="v">{METRICS[metric].format(r.v!)}{METRICS[metric].unit}</span>
            </button>
          </li>
        {/each}
      </ol>
    {/if}
  </aside>
</div>

<style>
  .metric { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin: 0 0 1rem; }
  .metric .label { flex: 0 0 72px; font-size: 12px; color: var(--text-faint); }
  .chip {
    font: inherit; font-size: 13px; padding: 3px 12px; border-radius: 999px; cursor: pointer;
    border: 1px solid var(--border-strong); background: transparent; color: var(--text-sub);
  }
  .chip.on { background: var(--accent-bg); color: var(--accent); border-color: var(--accent); }
  .layout { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 16px; align-items: start; }
  @media (max-width: 860px) { .layout { grid-template-columns: minmax(0, 1fr); } }
  .chart-scroll { overflow-x: auto; }
  svg { display: block; width: 100%; min-width: 560px; height: auto; }
  .tile { cursor: pointer; outline: none; }
  .tile rect { stroke: transparent; stroke-width: 2; transition: stroke 0.1s; }
  .tile:hover rect, .tile:focus-visible rect { stroke: var(--text-sub); }
  .tile.sel rect { stroke: var(--text); stroke-width: 3; }
  .name { font-size: 12px; font-weight: 600; pointer-events: none; }
  .val { font-size: 11px; pointer-events: none; font-variant-numeric: tabular-nums; }
  .hint, .muted { font-size: 12px; color: var(--text-faint); margin: 8px 0 0; }
  .side h2 { margin-top: 0; }
  .side-head { display: flex; justify-content: space-between; align-items: baseline; }
  .close { font: inherit; font-size: 13px; border: none; background: none; color: var(--accent); cursor: pointer; }
  .rank { list-style: none; margin: 0; padding: 0; }
  .rank button {
    width: 100%; display: grid; grid-template-columns: 20px 56px 1fr auto; align-items: center; gap: 8px;
    font: inherit; font-size: 14px; color: var(--text); background: none; border: none; padding: 5px 4px;
    border-radius: 6px; cursor: pointer; text-align: left;
  }
  .rank button:hover { background: var(--surface-muted); }
  .pos { color: var(--text-faint); font-size: 12px; }
  .bar { height: 8px; background: var(--surface-muted); border-radius: 4px; overflow: hidden; }
  .bar span { display: block; height: 100%; background: #378add; }
  .v { font-variant-numeric: tabular-nums; font-size: 13px; }
</style>
