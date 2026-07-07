# SeasonalHero — 四季のヒーロー背景 (Astro)

依存なし(React不要)の Astro コンポーネント。12秒でシームレスにループします。

## 導入

1. `SeasonalHero.astro` を `src/components/` にコピー
2. ページで使用:

```astro
---
import SeasonalHero from "../components/SeasonalHero.astro";
---
<SeasonalHero season="summer" density={1} speed={1} height="600px">
  <!-- 前面に載せたい内容(見出しなど)をここに -->
  <div style="padding: 120px;">
    <h1>季節とともに、つくる。</h1>
  </div>
</SeasonalHero>
```

## Props

- `season` — `"spring"`(桜) / `"summer"`(波紋) / `"autumn"`(紅葉) / `"winter"`(雪)。デフォルト `spring`
- `density` — パーティクル密度。目安 0.3〜2、デフォルト 1
- `speed` — 再生速度。目安 0.5〜2、デフォルト 1
- `height` — CSS高さ。デフォルト `600px`(`70vh` なども可)

## メモ

- 背景グラデーションは季節ごとに内蔵。上に載せる文字色はお好みで(淡色背景なので濃色推奨)
- `prefers-reduced-motion` 使用時は静止画にフォールバック
- 季節の自動切替をしたい場合は、月から `season` を計算して渡すだけ:

```astro
---
const m = new Date().getMonth() + 1;
const season = m <= 2 || m === 12 ? "winter" : m <= 5 ? "spring" : m <= 8 ? "summer" : "autumn";
---
<SeasonalHero season={season} />
```
