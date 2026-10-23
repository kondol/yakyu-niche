// 全画面共通の絞り込み条件。URL のクエリと相互に変換して、絞り込んだ画面を共有できるようにする
import type { Player, School } from './data';
import { LEAGUE_OF, REGIONS } from './japan';

export const ALL = 'すべて';

export interface Filters {
  region: string;
  league: string;
  position: string;
  round: string;
  koshien: string;
  yearFrom: number;
  yearTo: number;
}

export const CHOICES = {
  region: { label: '地域', options: [ALL, ...REGIONS] },
  league: { label: 'リーグ', options: [ALL, 'セ', 'パ'] },
  position: { label: 'ポジション', options: [ALL, '投手', '捕手', '内野手', '外野手'] },
  round: { label: 'ドラフト', options: [ALL, '1位', '2〜3位', '4位以下', '育成'] },
  koshien: { label: '甲子園', options: [ALL, '出場あり', '出場なし'] },
} as const;

export type ChoiceKey = keyof typeof CHOICES;

export function defaultFilters(minYear: number, maxYear: number): Filters {
  return { region: ALL, league: ALL, position: ALL, round: ALL, koshien: ALL, yearFrom: minYear, yearTo: maxYear };
}

function matchRound(round: string, choice: string): boolean {
  if (choice === ALL) return true;
  if (choice === '育成') return round === '育成';
  if (round === '育成') return false;
  const n = Number(round);
  if (choice === '1位') return n === 1;
  if (choice === '2〜3位') return n === 2 || n === 3;
  return n >= 4;
}

export function applyFilters(players: Player[], schoolById: Map<string, School>, f: Filters): Player[] {
  return players.filter((p) => {
    const s = schoolById.get(p.schoolId);
    return (
      (f.region === ALL || s?.region === f.region) &&
      (f.league === ALL || LEAGUE_OF[p.team] === f.league) &&
      (f.position === ALL || p.position === f.position) &&
      matchRound(p.draftRound, f.round) &&
      (f.koshien === ALL || p.koshien === (f.koshien === '出場あり')) &&
      p.draftYear >= f.yearFrom &&
      p.draftYear <= f.yearTo
    );
  });
}

export function readFiltersFromUrl(base: Filters): Filters {
  const q = new URLSearchParams(location.search);
  const f = { ...base };
  for (const key of Object.keys(CHOICES) as ChoiceKey[]) {
    const v = q.get(key);
    if (v && (CHOICES[key].options as readonly string[]).includes(v)) f[key] = v;
  }
  const from = Number(q.get('from'));
  const to = Number(q.get('to'));
  if (from >= base.yearFrom && from <= base.yearTo) f.yearFrom = from;
  if (to >= base.yearFrom && to <= base.yearTo) f.yearTo = to;
  return f;
}

export function writeFiltersToUrl(f: Filters, base: Filters): void {
  const q = new URLSearchParams(location.search);
  for (const key of Object.keys(CHOICES) as ChoiceKey[]) {
    if (f[key] === ALL) q.delete(key);
    else q.set(key, f[key]);
  }
  if (f.yearFrom === base.yearFrom) q.delete('from');
  else q.set('from', String(f.yearFrom));
  if (f.yearTo === base.yearTo) q.delete('to');
  else q.set('to', String(f.yearTo));
  const s = q.toString();
  history.replaceState(null, '', location.pathname + (s ? '?' + s : ''));
}
