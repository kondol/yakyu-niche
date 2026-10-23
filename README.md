# 野球ニッチデータ

高校野球とプロ野球のニッチなデータを、絞り込みと図で探せる静的サイト。

- 静的サイト生成: Astro
- 動く部分（絞り込み・図）: Svelte と D3.js
- 公開: GitHub Pages（`main` に push すると `.github/workflows/deploy.yml` が自動で公開）

## 画面

| パス | 内容 |
|---|---|
| `/` | 高校からプロへ: 出身高校から入団球団への流れ（サンキー図）と絞り込み |
| `/map/` | 都道府県マップ: プロ輩出数・甲子園出場回数・勝率の色分けとランキング |
| `/schools/` | 高校一覧 |
| `/schools/<id>/` | 高校ページ: 甲子園成績、プロ入り選手の年表 |
| `/players/<id>/` | 選手ページ: 同じ高校・同期入団・同順位指名のつながり図 |

絞り込み条件は URL のクエリに残るので、絞り込んだ画面をそのまま共有できる。

## 開発

```bash
npm install
npm run dev
```

## データ

`data/` の CSV をビルド時に読み込む（読み込み処理は `src/lib/data.ts`）。

- `data/schools.csv`: `id,name,prefecture,koshien_appearances,koshien_wins,koshien_losses`
- `data/players.csv`: `id,name,school_id,draft_year,draft_round,team,position,koshien`
  - `draft_round` は `1`〜`7` か `育成`、`koshien` は `1` / `0`

今入っているのは `npm run sample`（`scripts/gen-sample.mjs`）で作った**架空のサンプルデータ**。実データに差し替えたら `src/lib/data.ts` の `IS_SAMPLE` を `false` にし、生成スクリプトを消す。

自動取得を足すときは、取得元ごとに利用規約と robots.txt を確認すること。

## GitHub Pages の初回設定

1. GitHub にリポジトリを作って push する
2. リポジトリの Settings → Pages → Source を「GitHub Actions」にする
