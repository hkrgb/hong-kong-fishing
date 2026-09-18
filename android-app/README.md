# 離島旅程 Android

- 套件：`com.rgbworkshop.islandfishing`
- 版本：1.0.0 (1)
- Android 8.0+；target / compile SDK 36。
- 使用 Google Android Browser Helper 的 Trusted Web Activity；原有 Google 登入、下載存檔及同源小遊戲在瀏覽器安全環境運作。
- 正式網址： https://hkrgb.github.io/hong-kong-fishing/?source=android
- 需要網絡。斷線顯示重試頁，不宣稱完整離線遊玩。

## 建置

使用 JDK 21、Android SDK 36 及 Gradle wrapper 8.13。在 Windows 請將此目錄複製到只有 ASCII 字元的建置路徑（例如 `%TEMP%/island-android-build/project`），避免 Android/Java 工具對非 ASCII 路徑的限制。

設定 `JAVA_HOME`、`ANDROID_HOME`。正式簽署時，透過環境變數設定 `ISLAND_KEYSTORE`（金鑰檔案）、`ISLAND_STORE_PASSWORD`；別名為 `island-upload`。禁止將金鑰或密碼提交至 Git。

執行 `gradlew.bat --no-daemon bundleRelease assembleRelease lintRelease`。

輸出：`app/build/outputs/bundle/release/app-release.aab` 及 `app/build/outputs/apk/release/app-release.apk`。

## 網站驗證與 Play 簽署

網站驗證檔位於 https://hkrgb.github.io/.well-known/assetlinks.json （hkrgb/hkrgb.github.io 儲存庫）。

本機 APK 使用上傳金鑰簽署。Google Play 如選擇由 Google 產生正式 App signing key，必須把 Play Console「應用程式完整性」所示的正式簽署 SHA-256 憑證指紋加入 `sha256_cert_fingerprints`，並保留本機 APK 指紋。上傳金鑰指紋不能代替 Play 正式簽署指紋。驗證失敗時瀏覽器會安全地退回含工具列的 Custom Tab，不可關閉驗證來掩蓋問題。

## 檢查

`lintRelease`、APK 簽署檢查、Play Bundle 格式驗證及網站測試。發佈前仍需真實 Android 裝置測試 Google 登入、跨小遊戲收藏、影片、返回操作和網絡中斷。商店內容分級、資料安全、目標年齡與開發者聲明需依實際情況完成。
