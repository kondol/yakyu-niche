<script lang="ts">
  import FilterBar from './FilterBar.svelte';
  import { applyFilters } from '../lib/filters';
  import { useUrlFilters } from '../lib/urlState.svelte';
  import { LEAGUE_OF, TEAMS } from '../lib/japan';
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

  const MAX_SCHOOLS = 14;
  const OTHER = '__other__';
  const W = 760, H = 540, X0 = 170, X1 = 610, BAR = 10, GAP = 6;

  let hoverSchool = $state<string | null>(null);
  let hoverTeam = $state<string | null>(null);

  const filtered = $derived(applyFilters(players, schoolById, ui.filters));

  // 左列（高校）: 人数の多い順に上位だけ表示し、残りは「その他」にまとめる
  const leftNodes = $derived.by(() => {
    const count = new Map<string, number>();
    for (const p of filtered) count.set(p.schoolId, (count.get(p.schoolId) ?? 0) + 1);
    const sorted = [...count.entries()].sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, MAX_SCHOOLS).map(([id, n]) => ({ id, label: schoolById.get(id)?.name ?? id, n }));
    const rest = sorted.slice(MAX_SCHOOLS);
    if (rest.length) top.push({ id: OTHER, label: `その他 ${rest.length}校`, n: rest.reduce((a, [, n]) => a + n, 0) });
    return top;
  });
  const topIds = $derived(new Set(leftNodes.map((n) => n.id)));
  const keyOf = (p: Player) => (topIds.has(p.schoolId) ? p.schoolId : OTHER);

  const rightNodes = $derived(TEAMS.map((t) => ({ id: t.name, label: t.name, league: t.league, n: filtered.filter((p) => p.team === t.name).length })));

  // サンキー図の配置: 両列とも人数に比例した高さで積み、帯をその間に渡す
  const layout = $derived.by(() => {
    const total = filtered.length;
    if (!total) return null;
    const visibleRight = rightNodes.filter((n) => n.n > 0);
    const k = Math.min((H - GAP * (leftNodes.length - 1)) / total, (H - GAP * (visibleRight.length - 1)) / total);
    const place = <T extends { n: number }>(nodes: T[]) => {
      const used = nodes.reduce((a, n) => a + n.n * k, 0) + GAP * (nodes.length - 1);
      let y = (H - used) / 2;
      return nodes.map((n) => {
        const node = { ...n, y, h: n.n * k };
        y += node.h + GAP;
        return node;
      });
    };
    const left = place(leftNodes);
    const right = place(visibleRight);
    const leftIndex = new Map(left.map((n, i) => [n.id, i]));
    const rightIndex = new Map(right.map((n, i) => [n.id, i]));

    const counts = new Map<string, { s: string; t: string; n: number }>();
    for (const p of filtered) {
      const s = keyOf(p);
      const key = s + '|' + p.team;
      const c = counts.get(key) ?? { s, t: p.team, n: 0 };
      c.n++;
      counts.set(key, c);
    }
    const links = [...counts.values()];
    const leftOffset = new Map(left.map((n) => [n.id, n.y]));
    const rightOffset = new Map(right.map((n) => [n.id, n.y]));
    // 交差を減らすため、高校側は球団の並び順、球団側は高校の並び順で積む
    const ribbons = links
      .slice()
      .sort((a, b) => leftIndex.get(a.s)! - leftIndex.get(b.s)! || rightIndex.get(a.t)! - rightIndex.get(b.t)!)
      .map((l) => {
        const y0 = leftOffset.get(l.s)!;
        leftOffset.set(l.s, y0 + l.n * k);
        return { ...l, y0, h: l.n * k, y1: 0 };
      });
    ribbons
      .slice()
      .sort((a, b) => rightIndex.get(a.t)! - rightIndex.get(b.t)! || leftIndex.get(a.s)! - leftIndex.get(b.s)!)
      .forEach((r) => {
        r.y1 = rightOffset.get(r.t)!;
        rightOffset.set(r.t, r.y1 + r.h);
      });
    return { left, right, ribbons };
  });

  function ribbonPath(r: { y0: number; y1: number; h: number }) {
    const a = X0 + BAR, b = X1, m = (a + b) / 2;
    return `M${a},${r.y0} C${m},${r.y0} ${m},${r.y1} ${b},${r.y1} L${b},${r.y1 + r.h} C${m},${r.y1 + r.h} ${m},${r.y0 + r.h} ${a},${r.y0 + r.h} Z`;
  }
  const isActive = (s: string, t: string) =>
    (hoverSchool === null && hoverTeam === null) || hoverSchool === s || hoverTeam === t;

  const schoolCount = $derived(new Set(filtered.map((p) => p.schoolId)).size);
  const koshienRate = $derived(filtered.length ? Math.round((filtered.filter((p) => p.koshien).length / filtered.length) * 100) : null);
  const firstRoundRate = $derived(filtered.length ? Math.round((filtered.filter((p) => p.draftRound === '1').length / filtered.length) * 100) : null);

  const tableRows = $derived(
    filtered.filter((p) => (hoverSchool ? keyOf(p) === hoverSchool : true) && (hoverTeam ? p.team === hoverTeam : true)).slice(-40).reverse(),
  );
</script>

<FilterBar bind:filters={ui.filters} {minYear} {maxYear} />

<div class="stats">
  <div class="stat"><div class="label">該当選手</div><div class="value">{filtered.length}人</div></div>
  <div class="stat"><div class="label">出身高校</div><div class="value">{schoolCount}校</div></div>
  <div class="stat"><div class="label">甲子園経験率</div><div class="value">{koshienRate ?? '–'}{koshienRate !== null ? '%' : ''}</div></div>
  <div class="stat"><div class="label">1位指名の割合</div><div class="value">{firstRoundRate ?? '–'}{firstRoundRate !== null ? '%' : ''}</div></div>
</div>

<div class="card">
  <div class="legend">
    <span><i style="background: var(--se)"></i>セ・リーグへの入団</span>
    <span><i style="background: var(--pa)"></i>パ・リーグへの入団</span>
    <span class="hint">高校名や球団名にカーソルを合わせると、その流れだけを強調します</span>
  </div>
  <div class="chart-scroll">
    {#if layout}
      <svg viewBox="0 0 {W} {H}" role="img" aria-label="出身高校から入団球団への流れ">
        {#each layout.ribbons as r (r.s + r.t)}
          <path
            d={ribbonPath(r)}
            fill={r.s === OTHER ? 'var(--flow-dim)' : LEAGUE_OF[r.t] === 'セ' ? 'var(--se)' : 'var(--pa)'}
            fill-opacity={isActive(r.s, r.t) ? (r.s === OTHER && hoverSchool !== OTHER ? 0.25 : 0.5) : 0.06}
          >
            <title>{(r.s === OTHER ? 'その他' : schoolById.get(r.s)?.name) + ' → ' + r.t + ': ' + r.n + '人'}</title>
          </path>
        {/each}
        {#each layout.left as n (n.id)}
          <g
            class="node"
            role="link"
            tabindex="0"
            onmouseenter={() => (hoverSchool = n.id)}
            onmouseleave={() => (hoverSchool = null)}
            onfocus={() => (hoverSchool = n.id)}
            onblur={() => (hoverSchool = null)}
            onclick={() => n.id !== OTHER && (location.href = link(`/schools/${n.id}/`))}
            onkeydown={(e) => e.key === 'Enter' && n.id !== OTHER && (location.href = link(`/schools/${n.id}/`))}
          >
            <rect x={0} y={n.y - 2} width={X0 + BAR} height={Math.max(n.h + 4, 16)} fill="transparent" />
            <rect x={X0} y={n.y} width={BAR} height={Math.max(n.h, 1)} rx="2" fill="var(--school)" />
            <text x={X0 - 8} y={n.y + n.h / 2} dy="0.35em" text-anchor="end" class:strong={hoverSchool === n.id}>
              {n.label}<tspan class="count"> {n.n}</tspan>
            </text>
          </g>
        {/each}
        {#each layout.right as n (n.id)}
          <g class="node" role="img" onmouseenter={() => (hoverTeam = n.id)} onmouseleave={() => (hoverTeam = null)}>
            <rect x={X1} y={n.y - 2} width={W - X1} height={Math.max(n.h + 4, 16)} fill="transparent" />
            <rect x={X1} y={n.y} width={BAR} height={Math.max(n.h, 1)} rx="2" fill={n.league === 'セ' ? 'var(--se)' : 'var(--pa)'} />
            <text x={X1 + BAR + 8} y={n.y + n.h / 2} dy="0.35em" class:strong={hoverTeam === n.id}>
              {n.label}<tspan class="count"> {n.n}</tspan>
            </text>
          </g>
        {/each}
      </svg>
    {:else}
      <p class="empty">条件に合う選手がいません。条件をゆるめてみてください。</p>
    {/if}
  </div>
</div>

<h2>
  {#if hoverSchool && hoverSchool !== OTHER}{schoolById.get(hoverSchool)?.name}出身の選手
  {:else if hoverTeam}{hoverTeam}に入団した選手
  {:else}該当する選手（新しい順・最大40人）{/if}
</h2>
<div class="table-wrap">
  <table>
    <thead><tr><th>選手</th><th>出身高校</th><th class="num">指名年</th><th>順位</th><th>球団</th><th>ポジション</th><th>甲子園</th></tr></thead>
    <tbody>
      {#each tableRows as p (p.id)}
        {@const s = schoolById.get(p.schoolId)}
        <tr>
          <td><a href={link(`/players/${p.id}/`)}>{p.name}</a></td>
          <td><a href={link(`/schools/${p.schoolId}/`)}>{s?.name}</a> <span class="pref">{s?.prefecture}</span></td>
          <td class="num">{p.draftYear}</td>
          <td>{p.draftRound === '育成' ? '育成' : p.draftRound + '位'}</td>
          <td><span class="tag" class:se={LEAGUE_OF[p.team] === 'セ'} class:pa={LEAGUE_OF[p.team] === 'パ'}>{p.team}</span></td>
          <td>{p.position}</td>
          <td>{p.koshien ? '出場' : ''}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .legend { display: flex; flex-wrap: wrap; gap: 6px 16px; font-size: 12px; color: var(--text-sub); margin-bottom: 8px; }
  .legend i { display: inline-block; width: 10px; height: 10px; border-radius: 2px; margin-right: 6px; vertical-align: -1px; }
  .legend .hint { color: var(--text-faint); }
  .chart-scroll { overflow-x: auto; }
  svg { display: block; width: 100%; min-width: 640px; height: auto; }
  svg path { transition: fill-opacity 0.15s; }
  text { font-size: 13px; fill: var(--text); }
  text.strong { font-weight: 700; }
  .count { fill: var(--text-faint); font-size: 12px; }
  .node { cursor: pointer; outline: none; }
  .empty { color: var(--text-sub); text-align: center; padding: 3rem 0; }
  .pref { color: var(--text-faint); font-size: 12px; }
</style>
