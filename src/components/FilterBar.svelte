<script lang="ts">
  import { CHOICES, defaultFilters, type ChoiceKey, type Filters } from '../lib/filters';

  interface Props {
    filters: Filters;
    minYear: number;
    maxYear: number;
    keys?: ChoiceKey[];
  }
  let { filters = $bindable(), minYear, maxYear, keys = Object.keys(CHOICES) as ChoiceKey[] }: Props = $props();

  function setFrom(v: number) {
    filters.yearFrom = Math.min(v, filters.yearTo);
  }
  function setTo(v: number) {
    filters.yearTo = Math.max(v, filters.yearFrom);
  }
  function reset() {
    filters = defaultFilters(minYear, maxYear);
  }
  const isDefault = $derived(
    keys.every((k) => filters[k] === CHOICES[k].options[0]) && filters.yearFrom === minYear && filters.yearTo === maxYear,
  );
</script>

<div class="bar">
  {#each keys as key}
    <div class="row" role="group" aria-label={CHOICES[key].label}>
      <span class="label">{CHOICES[key].label}</span>
      <div class="chips">
        {#each CHOICES[key].options as opt}
          <button class="chip" class:on={filters[key] === opt} aria-pressed={filters[key] === opt} onclick={() => (filters[key] = opt)}>
            {opt}
          </button>
        {/each}
      </div>
    </div>
  {/each}
  <div class="row">
    <span class="label">指名年</span>
    <div class="years">
      <input type="range" min={minYear} max={maxYear} step="1" value={filters.yearFrom} aria-label="指名年の開始" oninput={(e) => setFrom(+e.currentTarget.value)} />
      <input type="range" min={minYear} max={maxYear} step="1" value={filters.yearTo} aria-label="指名年の終了" oninput={(e) => setTo(+e.currentTarget.value)} />
      <span class="year-out">{filters.yearFrom}〜{filters.yearTo}年</span>
    </div>
  </div>
  {#if !isDefault}
    <button class="reset" onclick={reset}>条件をリセット</button>
  {/if}
</div>

<style>
  .bar { display: flex; flex-direction: column; gap: 8px; margin-bottom: 1rem; }
  .row { display: flex; align-items: flex-start; gap: 10px; }
  .label { flex: 0 0 72px; font-size: 12px; color: var(--text-faint); padding-top: 5px; }
  .chips { display: flex; flex-wrap: wrap; gap: 6px; }
  .chip {
    font: inherit; font-size: 13px; padding: 3px 12px; border-radius: 999px; cursor: pointer;
    border: 1px solid var(--border-strong); background: transparent; color: var(--text-sub);
  }
  .chip:hover { background: var(--surface-muted); }
  .chip.on { background: var(--accent-bg); color: var(--accent); border-color: var(--accent); }
  .years { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px; flex: 1; }
  .years input { flex: 1 1 140px; max-width: 260px; accent-color: var(--accent); }
  .year-out { font-size: 13px; font-variant-numeric: tabular-nums; }
  .reset {
    align-self: flex-start; font: inherit; font-size: 13px; padding: 3px 12px; cursor: pointer;
    border: none; background: none; color: var(--accent);
  }
</style>
