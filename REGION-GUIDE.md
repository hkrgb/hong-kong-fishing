# 釣區及魚餌更新

資料來源：使用者提供的 `HK_Fishing_Locations_and_Tourism_Guide.xlsx`、`HK_Fishing_Baits_Classification_and_Features.xlsx`，兩份檔案第 6–14 行。原檔沒有修改。遊戲採用九個地點與九款魚餌知識摘要；魚餌「主要目標魚種」欄不參與遊戲機率。

## 遊戲設定

- 長洲避風塘、南氹、東灣：全部免費。
- 其他地區預設一次解鎖金額：坪洲 $200、荃灣 $200、東龍洲 $400、蒲台 $800、橋咀島 $300、青馬 $600。後台可改。
- 舊南氹與蒲台保留 ID。舊大嶼山解鎖權延續至坪洲，舊果洲解鎖權延續至東龍洲；這是遊戲升級權益延續，不是地理同一性。舊資料保留在 `legacyAreas`，玩家魚獲與交易紀錄不刪除。額外自訂釣區保留。
- 現有魚種分布作為基礎；Excel 中可明確配對的魚種加入該區，抽選權重預設 3（普通為 1）。這是遊戲權重，不是實際香港魚群調查數據或保證中魚率。
- 模糊俗稱及魚庫沒有的項目不冒充其他魚：例如沙鑽、石煞、牙彧、牛屎立、白立、馬鮫魚、魷魚／針墨、鯽魚等。後台可自行配對和新增魚種。泥鯭以現有白點泥鯭、連尖／紅魚以現有相應分組處理。
- 基本魚餌：任何本區魚；高級：兩组皆存在時 60% 未收集、40% 已收集；頂級：100% 未收集。加權只在選定組內進行，不改 60/100 機率。
- 每次購買一份，先顯示金額，再選「是／否」。金錢、魚餌消耗、售魚規則沿用。
- 香港時間 05:00–10:59 早、11:00–17:59 午、18:00–04:59 晚。這是遊戲畫面分段，非精確日出日落／即時月相。每 15 秒檢查，預載後才換背景，比賽保持原有專屬場景。
- 後台可改分類、價格、簡介、三時段圖片及魚餌知識；按魚名旁「設為較常出現」可加權。清空時段網址則使用一般背景。

## 美術

使用內置 imagegen：先各自生成午間場景，再以同一午間圖為編輯目標生成早、晚版。已生成檔案及完整 prompt 記錄在 `sport/assets/locations/manifest.json`；部署檔為同名 WebP。

場景是根據實景特徵創作的遊戲美術，不是精確街景複製或即時照片。網上照片只供參考，沒有複製到遊戲。

參考來源（2026-09-09 查閱）：

- [長洲漁港，香港旅遊發展局](https://www.discoverhongkong.com/eng/outdoors/10-island-escapes.html)
- [南氹灣照片及地貌](https://notsomoon.blogspot.com/2012/07/blog-post_16.html)（文字及頁面可讀，部分原圖服務無法載入）
- [東灣，香港旅遊發展局](https://www.discoverhongkong.com/tc/place-to-go/travel.guide-tung-wan.html)
- [大利島及大利橋，離島民政事務處](https://www.islands.gov.hk/en/explores-peng-chau-tai-lei-island.php)
- [荃灣海濱照片](https://www.getreadyhk.com/art-culture/photography/item/1824-tsuen-wan-riviera-park)
- [東龍洲海崖照片](https://www.hkoutdoors.com/tung-lung-chau-rock-climbing-hiking-and-birdwatching/)
- [蒲台海岸照片](https://www.hongkonghike.com/po-toi-hike-exploring-hong-kongs-southernmost-pirate-island/)
- [橋咀島，香港地質公園](https://www.geopark.gov.hk/en/discover/attractions/sharp-island)
- [青馬大橋景觀，香港旅遊發展局](https://www.discoverhongkong.com/eng/explore/great-outdoor/great-outdoors-hong-kong/tsing-yi-nature-trails.html)

簡介經精簡以適合手機；東灣保留黃昏海景而不把向東海面描述為日落方向。未核實的全年煙花、具體古蹟年數及魚餌「必殺／完全」等絕對說法不作知識事實呈現。
