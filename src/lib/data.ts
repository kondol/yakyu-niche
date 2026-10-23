// data/*.csv をビルド時に読み込み、型付きの配列にする
import { csvParse } from 'd3';
import schoolsCsv from '../../data/schools.csv?raw';
import playersCsv from '../../data/players.csv?raw';
import { REGION_OF } from './japan';

// 実データに差し替えたら false にする（画面上の「サンプル」表示が消える）
export const IS_SAMPLE = true;

export interface School {
  id: string;
  name: string;
  prefecture: string;
  region: string;
  appearances: number;
  wins: number;
  losses: number;
}

export interface Player {
  id: string;
  name: string;
  schoolId: string;
  draftYear: number;
  /** "1"〜"7" または "育成" */
  draftRound: string;
  team: string;
  position: string;
  koshien: boolean;
}

export const schools: School[] = csvParse(schoolsCsv).map((r) => ({
  id: r.id!,
  name: r.name!,
  prefecture: r.prefecture!,
  region: REGION_OF[r.prefecture!] ?? '不明',
  appearances: Number(r.koshien_appearances),
  wins: Number(r.koshien_wins),
  losses: Number(r.koshien_losses),
}));

export const players: Player[] = csvParse(playersCsv)
  .map((r) => ({
    id: r.id!,
    name: r.name!,
    schoolId: r.school_id!,
    draftYear: Number(r.draft_year),
    draftRound: r.draft_round!,
    team: r.team!,
    position: r.position!,
    koshien: r.koshien === '1',
  }))
  .sort((a, b) => a.draftYear - b.draftYear);

export const schoolById = new Map(schools.map((s) => [s.id, s]));
export const playerById = new Map(players.map((p) => [p.id, p]));

export function playersOfSchool(schoolId: string): Player[] {
  return players.filter((p) => p.schoolId === schoolId);
}
