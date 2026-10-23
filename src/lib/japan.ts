// 都道府県と地域、タイル地図上の位置 (x, y)
export interface Prefecture {
  name: string;
  region: string;
  x: number;
  y: number;
}

export const PREFECTURES: Prefecture[] = [
  { name: '北海道', region: '北海道・東北', x: 12, y: 0 },
  { name: '青森', region: '北海道・東北', x: 12, y: 1 },
  { name: '秋田', region: '北海道・東北', x: 11, y: 2 },
  { name: '岩手', region: '北海道・東北', x: 12, y: 2 },
  { name: '山形', region: '北海道・東北', x: 11, y: 3 },
  { name: '宮城', region: '北海道・東北', x: 12, y: 3 },
  { name: '福島', region: '北海道・東北', x: 12, y: 4 },
  { name: '茨城', region: '関東', x: 11, y: 5 },
  { name: '栃木', region: '関東', x: 11, y: 4 },
  { name: '群馬', region: '関東', x: 10, y: 4 },
  { name: '埼玉', region: '関東', x: 10, y: 5 },
  { name: '千葉', region: '関東', x: 11, y: 6 },
  { name: '東京', region: '関東', x: 10, y: 6 },
  { name: '神奈川', region: '関東', x: 9, y: 6 },
  { name: '新潟', region: '中部', x: 9, y: 3 },
  { name: '富山', region: '中部', x: 8, y: 3 },
  { name: '石川', region: '中部', x: 7, y: 3 },
  { name: '福井', region: '中部', x: 7, y: 4 },
  { name: '山梨', region: '中部', x: 9, y: 5 },
  { name: '長野', region: '中部', x: 9, y: 4 },
  { name: '岐阜', region: '中部', x: 8, y: 4 },
  { name: '静岡', region: '中部', x: 8, y: 6 },
  { name: '愛知', region: '中部', x: 8, y: 5 },
  { name: '三重', region: '近畿', x: 7, y: 6 },
  { name: '滋賀', region: '近畿', x: 7, y: 5 },
  { name: '京都', region: '近畿', x: 6, y: 5 },
  { name: '大阪', region: '近畿', x: 5, y: 6 },
  { name: '兵庫', region: '近畿', x: 5, y: 5 },
  { name: '奈良', region: '近畿', x: 6, y: 6 },
  { name: '和歌山', region: '近畿', x: 6, y: 7 },
  { name: '鳥取', region: '中国・四国', x: 4, y: 5 },
  { name: '島根', region: '中国・四国', x: 3, y: 5 },
  { name: '岡山', region: '中国・四国', x: 4, y: 6 },
  { name: '広島', region: '中国・四国', x: 3, y: 6 },
  { name: '山口', region: '中国・四国', x: 2, y: 6 },
  { name: '徳島', region: '中国・四国', x: 5, y: 7 },
  { name: '香川', region: '中国・四国', x: 4, y: 7 },
  { name: '愛媛', region: '中国・四国', x: 3, y: 7 },
  { name: '高知', region: '中国・四国', x: 4, y: 8 },
  { name: '福岡', region: '九州・沖縄', x: 1, y: 6 },
  { name: '佐賀', region: '九州・沖縄', x: 0, y: 6 },
  { name: '長崎', region: '九州・沖縄', x: 0, y: 7 },
  { name: '熊本', region: '九州・沖縄', x: 1, y: 7 },
  { name: '大分', region: '九州・沖縄', x: 2, y: 7 },
  { name: '宮崎', region: '九州・沖縄', x: 2, y: 8 },
  { name: '鹿児島', region: '九州・沖縄', x: 1, y: 8 },
  { name: '沖縄', region: '九州・沖縄', x: 0, y: 10 },
];

export const REGIONS = ['北海道・東北', '関東', '中部', '近畿', '中国・四国', '九州・沖縄'];

export const REGION_OF: Record<string, string> = Object.fromEntries(
  PREFECTURES.map((p) => [p.name, p.region]),
);

export interface Team {
  name: string;
  league: 'セ' | 'パ';
}

export const TEAMS: Team[] = [
  { name: '巨人', league: 'セ' },
  { name: '阪神', league: 'セ' },
  { name: 'DeNA', league: 'セ' },
  { name: '広島', league: 'セ' },
  { name: 'ヤクルト', league: 'セ' },
  { name: '中日', league: 'セ' },
  { name: 'ソフトバンク', league: 'パ' },
  { name: '日本ハム', league: 'パ' },
  { name: 'オリックス', league: 'パ' },
  { name: '楽天', league: 'パ' },
  { name: '西武', league: 'パ' },
  { name: 'ロッテ', league: 'パ' },
];

export const LEAGUE_OF: Record<string, 'セ' | 'パ'> = Object.fromEntries(
  TEAMS.map((t) => [t.name, t.league]),
);
