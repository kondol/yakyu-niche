// 画面確認用の架空サンプルデータを data/ に生成する。
// 実データを入れたらこのスクリプトと sample フラグは不要になる。
import { writeFileSync, mkdirSync } from 'node:fs';

const PREFS = ['北海道', '青森', '秋田', '岩手', '山形', '宮城', '福島', '茨城', '栃木', '群馬', '埼玉', '千葉', '東京', '神奈川', '新潟', '富山', '石川', '福井', '山梨', '長野', '岐阜', '静岡', '愛知', '三重', '滋賀', '京都', '大阪', '兵庫', '奈良', '和歌山', '鳥取', '島根', '岡山', '広島', '山口', '徳島', '香川', '愛媛', '高知', '福岡', '佐賀', '長崎', '熊本', '大分', '宮崎', '鹿児島', '沖縄'];
// 強豪校が多めの都道府県（偏りを出すための重み）
const HOT = { 大阪: 4, 神奈川: 3, 東京: 3, 兵庫: 3, 愛知: 3, 福岡: 2, 埼玉: 2, 千葉: 2, 広島: 2, 北海道: 2 };
const TEAMS = ['巨人', '阪神', 'DeNA', '広島', 'ヤクルト', '中日', 'ソフトバンク', '日本ハム', 'オリックス', '楽天', '西武', 'ロッテ'];
const HEAD = ['北', '南', '東', '西', '桜', '青', '白', '若', '光', '翔', '明', '清', '星', '緑', '朝'];
const TAIL = ['陵', '嶺', '峰', '港', '丘', '台', '陽', '風', '和', '城', '洋', '泉'];
const KIND = ['高', '学園', '学院', '実業', '工業', '商業', '大附属'];
const SEI = ['佐藤', '鈴木', '高橋', '田中', '伊藤', '渡辺', '山本', '中村', '小林', '加藤', '吉田', '山田', '松本', '井上', '木村', '林', '清水', '山崎', '森', '池田', '橋本', '石川', '前田', '藤田', '岡田', '後藤', '長谷川', '村上', '近藤', '坂本'];
const MEI = ['翔太', '大輝', '拓海', '健太', '颯', '蓮', '陽翔', '湊', '悠真', '大和', '樹', '亮', '直人', '誠', '優斗', '海斗', '隼人', '航', '圭', '慎吾'];
const POS = ['投手', '投手', '投手', '捕手', '内野手', '内野手', '外野手', '外野手'];

// mulberry32（毎回同じデータになるよう固定シード）
let seed = 20261023;
const rand = () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const pick = (a) => a[Math.floor(rand() * a.length)];

const prefPool = PREFS.flatMap((p) => Array(HOT[p] ?? 1).fill(p));
const schools = [];
const used = new Set();
while (schools.length < 80) {
  const name = pick(HEAD) + pick(TAIL) + pick(KIND);
  if (used.has(name)) continue;
  used.add(name);
  const strength = Math.pow(rand(), 2.2); // 少数の強豪と多数の普通校
  const appearances = Math.round(strength * 40);
  const games = Math.round(appearances * (1 + strength * 1.8));
  const wins = Math.round(games * (0.3 + strength * 0.4));
  schools.push({
    id: `s${String(schools.length + 1).padStart(3, '0')}`,
    name,
    prefecture: pick(prefPool),
    koshien_appearances: appearances,
    koshien_wins: wins,
    koshien_losses: Math.max(appearances, games - wins),
    strength,
  });
}

const players = [];
const weighted = schools.flatMap((s) => Array(1 + Math.round(s.strength * 12)).fill(s));
for (let i = 0; i < 420; i++) {
  const s = pick(weighted);
  const roundRoll = rand();
  const round = roundRoll < 0.12 ? '1' : roundRoll < 0.26 ? '2' : roundRoll < 0.4 ? '3' : roundRoll < 0.72 ? String(4 + Math.floor(rand() * 4)) : '育成';
  players.push({
    id: `p${String(i + 1).padStart(4, '0')}`,
    name: pick(SEI) + ' ' + pick(MEI),
    school_id: s.id,
    draft_year: 1995 + Math.floor(rand() * 31),
    draft_round: round,
    team: pick(TEAMS),
    position: pick(POS),
    koshien: s.koshien_appearances > 0 && rand() < 0.25 + s.strength ? 1 : 0,
  });
}

const toCsv = (rows, cols) => [cols.join(','), ...rows.map((r) => cols.map((c) => r[c]).join(','))].join('\n') + '\n';
mkdirSync('data', { recursive: true });
writeFileSync('data/schools.csv', toCsv(schools, ['id', 'name', 'prefecture', 'koshien_appearances', 'koshien_wins', 'koshien_losses']));
writeFileSync('data/players.csv', toCsv(players, ['id', 'name', 'school_id', 'draft_year', 'draft_round', 'team', 'position', 'koshien']));
console.log(`schools: ${schools.length}, players: ${players.length}`);
