package com.rgbworkshop.islandfishing;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.content.res.AssetFileDescriptor;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;
import androidx.webkit.WebViewAssetLoader;
import org.json.JSONObject;
import org.json.JSONTokener;
import java.io.ByteArrayInputStream;
import java.io.FilterInputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

public class MainActivity extends androidx.activity.ComponentActivity {
    private static final String HOST = "appassets.androidplatform.net";
    private static final String START = "https://" + HOST + "/assets/game/index.html";
    private WebView web;
    private FrameLayout root;
    private View video;
    private WebChromeClient.CustomViewCallback videoCallback;
    private String pendingSave;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        root = new FrameLayout(this); root.setBackgroundColor(Color.BLACK); setContentView(root);
        web = new WebView(this); web.setBackgroundColor(Color.BLACK);
        root.addView(web, new FrameLayout.LayoutParams(-1, -1));
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true); settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false); settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setMediaPlaybackRequiresUserGesture(false);
        WebView.setWebContentsDebuggingEnabled((getApplicationInfo().flags & android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE) != 0);
        WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this)).build();
        web.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (!HOST.equals(uri.getHost())) return null;
                String range = request.getRequestHeaders().get("Range");
                if (range == null) range = request.getRequestHeaders().get("range");
                if (range != null && uri.getPath().endsWith(".mp4")) return movieRange(uri, range);
                String localPath = uri.getPath().replace("離島旅程-3d.png", "island-vacation-3d.png");
                if (localPath.endsWith("/")) localPath += "index.html";
                Uri local = uri.buildUpon().path(localPath).build();
                WebResourceResponse result = loader.shouldInterceptRequest(local);
                return result != null ? result : missing(); // Local content never falls back to the internet.
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if ("https".equals(uri.getScheme()) && HOST.equals(uri.getHost())) return false;
                if (!request.isForMainFrame()) return true;
                if ("island-save".equals(uri.getScheme()) && view.getUrl() != null && view.getUrl().startsWith("https://"+HOST+"/")) {
                    if ("export".equals(uri.getHost())) exportSave();
                    else if ("import".equals(uri.getHost())) importSave();
                    return true;
                }
                if ("https".equals(uri.getScheme()) || "http".equals(uri.getScheme()) || "mailto".equals(uri.getScheme())) {
                    try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); }
                    catch (Exception e) { toast("未找到可開啟此連結的應用程式"); }
                }
                return true;
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override public void onShowCustomView(View view, CustomViewCallback callback) {
                if (video != null) { callback.onCustomViewHidden(); return; }
                video = view; videoCallback = callback; root.addView(view, new FrameLayout.LayoutParams(-1, -1)); web.setVisibility(View.GONE); immersive();
            }
            @Override public void onHideCustomView() { hideVideo(); }
        });
        root.setOnApplyWindowInsetsListener((view, insets) -> {
            if (Build.VERSION.SDK_INT >= 30) {
                android.graphics.Insets safe = insets.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
                view.setPadding(safe.left, safe.top, safe.right, safe.bottom);
            } else view.setPadding(insets.getSystemWindowInsetLeft(), insets.getSystemWindowInsetTop(), insets.getSystemWindowInsetRight(), insets.getSystemWindowInsetBottom());
            return insets;
        });
        getOnBackPressedDispatcher().addCallback(this, new androidx.activity.OnBackPressedCallback(true) {
            @Override public void handleOnBackPressed() { confirmExit(); }
        });
        immersive(); web.loadUrl(START);
    }
    private void immersive() {
        if (Build.VERSION.SDK_INT >= 30) {
            WindowInsetsController controller = getWindow().getInsetsController();
            if (controller != null) { controller.hide(WindowInsets.Type.systemBars()); controller.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE); }
        } else getWindow().getDecorView().setSystemUiVisibility(5894);
    }
    private Map<String,String> headers(String... values){Map<String,String> result=new HashMap<>();for(int i=0;i<values.length;i+=2)result.put(values[i],values[i+1]);return result;}
    private WebResourceResponse missing() { return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found", new HashMap<>(), new ByteArrayInputStream(new byte[0])); }
    private WebResourceResponse movieRange(Uri uri, String range) {
        try {
            String path = uri.getPath();
            if (!path.startsWith("/assets/game/") || path.contains("..") || !range.matches("bytes=\\d*-\\d*")) return missing();
            AssetFileDescriptor descriptor = getAssets().openFd(path.substring(8));
            long size = descriptor.getLength();
            String[] parts = range.substring(6).split("-", -1);
            long start = parts[0].isEmpty() ? Math.max(0, size-Long.parseLong(parts[1])) : Long.parseLong(parts[0]);
            long end = parts[0].isEmpty() || parts[1].isEmpty() ? size-1 : Math.min(size-1, Long.parseLong(parts[1]));
            if (start > end || start >= size) { descriptor.close(); return new WebResourceResponse("video/mp4", null, 416, "Range Not Satisfiable", headers("Content-Range", "bytes */"+size), new ByteArrayInputStream(new byte[0])); }
            InputStream input = descriptor.createInputStream();
            long skipped = 0; while (skipped < start) { long n = input.skip(start-skipped); if (n <= 0) { input.close(); return missing(); } skipped += n; }
            long length = end-start+1;
            InputStream limited = new FilterInputStream(input) {
                long remaining = length;
                @Override public int read() throws java.io.IOException { if (remaining <= 0) return -1; int b=super.read(); if(b>=0)remaining--;return b; }
                @Override public int read(byte[] b, int off, int len) throws java.io.IOException { if(remaining<=0)return -1;int n=in.read(b,off,(int)Math.min(len,remaining));if(n>0)remaining-=n;return n; }
            };
            return new WebResourceResponse("video/mp4", null, 206, "Partial Content", headers("Content-Range", "bytes "+start+"-"+end+"/"+size, "Content-Length", ""+length, "Accept-Ranges", "bytes"), limited);
        } catch (Exception e) { return missing(); }
    }
    private void exportSave() {
        web.evaluateJavascript("JSON.stringify(save)", result -> {
            try {
                pendingSave = (String)new JSONTokener(result).nextValue();
                Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT).setType("application/json").addCategory(Intent.CATEGORY_OPENABLE).putExtra(Intent.EXTRA_TITLE,"island-save-"+System.currentTimeMillis()+".json");
                startActivityForResult(intent, 10);
            } catch (Exception e) { toast("未能匯出存檔"); }
        });
    }
    private void importSave() {
        new AlertDialog.Builder(this).setTitle("匯入存檔備份")
            .setMessage("選擇從舊版或網頁版下載的 JSON 備份。匯入會取代此 App 目前進度，建議先匯出備份。")
            .setNegativeButton("取消", null).setPositiveButton("選擇備份", (d,w) -> startActivityForResult(new Intent(Intent.ACTION_OPEN_DOCUMENT).setType("*/*").addCategory(Intent.CATEGORY_OPENABLE), 11)).show();
    }
    @Override protected void onActivityResult(int request, int result, Intent data) {
        super.onActivityResult(request,result,data);
        if(result!=RESULT_OK||data==null||data.getData()==null)return;
        try {
            if(request==10 && pendingSave!=null) {
                try(OutputStream out=getContentResolver().openOutputStream(data.getData())){out.write(pendingSave.getBytes(StandardCharsets.UTF_8));}
                pendingSave=null;toast("存檔備份已匯出");
            } else if(request==11) {
                byte[] bytes;
                try(InputStream in=getContentResolver().openInputStream(data.getData())){
                    java.io.ByteArrayOutputStream out=new java.io.ByteArrayOutputStream();byte[] buffer=new byte[8192];int n;
                    while((n=in.read(buffer))!=-1){out.write(buffer,0,n);if(out.size()>5_000_000)throw new Exception("too large");}bytes=out.toByteArray();
                }
                JSONObject save=new JSONObject(new String(bytes,StandardCharsets.UTF_8));
                if(save.optJSONArray("bag")==null||!(save.opt("score") instanceof Number))throw new Exception("invalid save");
                web.evaluateJavascript("localStorage.setItem('coastline-sport-save-v1',"+JSONObject.quote(save.toString())+");location.reload();",null);
                toast("已匯入存檔");
            }
        }catch(Exception e){toast("未能讀寫備份，請選擇有效的遊戲 JSON 存檔");}
    }
    private void toast(String text){Toast.makeText(this,text,Toast.LENGTH_LONG).show();}
    private void hideVideo(){if(video!=null){root.removeView(video);video=null;web.setVisibility(View.VISIBLE);videoCallback.onCustomViewHidden();videoCallback=null;immersive();}}
    private void confirmExit(){if(video!=null){hideVideo();return;}new AlertDialog.Builder(this).setMessage("離開遊戲？進度已保存在此手機。").setNegativeButton("繼續遊戲",null).setPositiveButton("離開",(d,w)->{web.evaluateJavascript("persist()",value->finish());}).show();}
    @Override protected void onPause(){web.evaluateJavascript("if(typeof persist==='function')persist()",null);web.onPause();super.onPause();}
    @Override protected void onResume(){super.onResume();if(web!=null)web.onResume();immersive();}
    @Override protected void onDestroy(){web.destroy();super.onDestroy();}
}
