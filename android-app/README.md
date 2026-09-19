# 離島旅程 Android 1.1.0

- 套件：`com.rgbworkshop.islandfishing`；版本代碼 3，Android 8.0+，target / compile SDK 36。
- 使用 Android WebViewAssetLoader 載入隨 App 安裝的全部遊戲內容。首次啟動即可離線玩，不需先開網站、不需快取或額外下載。
- 啟動網址為 App 私有本機來源 `https://appassets.androidplatform.net/assets/game/index.html`，不會對此來源作網絡回退。
- 即時天氣、YouTube、外部網站需網絡。Google 登入在外部瀏覽器的網頁版使用；App 內不使用 WebView Google OAuth。
- App 本機存檔與 1.0.0 的瀏覽器存檔分開。原存檔保留；從網頁版／舊版匯出 JSON 後，可在 App 按「匯入舊版存檔」。匯入前應先備份現有 App 進度。
- 本機資源包括影片；支援 byte range 讀取、影片全屏、Android 返回手勢、系統檔案選擇器備份匯入／匯出。沒有 JavaScriptInterface；外部連結由瀏覽器開啟。

## 建置

使用 Node.js、JDK 21、Android SDK 36、Gradle 8.13。先在遊戲根目錄執行 `node tools/build-offline-manifest.cjs`。Gradle 的 bundleGame 會依清單產生 assets，核對內容雜湊，禁止打包編輯器和私密資料。

設定 `JAVA_HOME`、`ANDROID_HOME`、`ISLAND_KEYSTORE`、`ISLAND_STORE_PASSWORD`；金鑰別名 `island-upload`。不要提交私密金鑰／密碼。

執行 `gradlew.bat --no-daemon bundleRelease assembleRelease lintRelease`。Windows 如需 ASCII 建置路徑，先執行 `node tools/package-android.cjs`，把 android-app 及 `app/build/generated/gameAssets` 複製到 ASCII 路徑，再使用 `-x bundleGame` 建置已核對的資源。

輸出 `app/build/outputs/bundle/release/app-release.aab`、`app/build/outputs/apk/release/app-release.apk`。生成 assets 不提交 Git；原資源已在遊戲儲存庫。

## 驗證

`tests/native-bundle.browser.cjs`：以打包資源模擬 App 本機來源，封鎖所有外部請求、停用 Service Worker，驗證首次啟動、所有資源、風景、四段影片、拋竿、平安包、書店、重新啟動及進度。另執行 Android lint、AAB 格式／APK 簽署驗證，逐項核對安裝包內容雜湊。仍需 Android 實機驗證安裝、影片、系統返回、檔案備份及長時間遊玩。

1.1.0 已不使用 TWA，因此不需要 assetlinks 才能離線或全屏。舊版 1.0.0 的網站驗證設定可保留。
