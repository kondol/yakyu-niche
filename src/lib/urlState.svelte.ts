// 絞り込み条件を $state で持ち、URL のクエリと同期させる（各島コンポーネントで共通利用）
import { onMount } from 'svelte';
import { defaultFilters, readFiltersFromUrl, writeFiltersToUrl, type Filters } from './filters';

export function useUrlFilters(minYear: number, maxYear: number) {
  const base = defaultFilters(minYear, maxYear);
  const s = $state({ filters: { ...base } as Filters, ready: false });

  onMount(() => {
    s.filters = readFiltersFromUrl(base);
    s.ready = true;
  });

  $effect(() => {
    const snapshot = { ...s.filters };
    if (s.ready) writeFiltersToUrl(snapshot, base);
  });

  return s;
}
