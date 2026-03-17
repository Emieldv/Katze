package com.katze.app.plugins;

import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.drawable.Drawable;
import android.nfc.NfcAdapter;
import android.nfc.Tag;
import android.provider.Settings;
import android.util.Base64;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.ByteArrayOutputStream;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@CapacitorPlugin(name = "KatzePlugin")
public class KatzePlugin extends Plugin {

    private static final String PREFS_NAME = "katze_native_prefs";
    private static final String KEY_LOCKED = "locked";
    private static final String KEY_WHITELIST = "whitelist";

    private NfcAdapter nfcAdapter;

    @Override
    public void load() {
        nfcAdapter = NfcAdapter.getDefaultAdapter(getActivity());
    }

    @PluginMethod
    public void getInstalledApps(PluginCall call) {
        PackageManager pm = getContext().getPackageManager();
        List<ApplicationInfo> packages = pm.getInstalledApplications(PackageManager.GET_META_DATA);
        JSArray appsArray = new JSArray();

        for (ApplicationInfo appInfo : packages) {
            // Only include user-visible apps (apps with a launcher intent)
            Intent launchIntent = pm.getLaunchIntentForPackage(appInfo.packageName);
            if (launchIntent == null) continue;

            JSObject app = new JSObject();
            app.put("packageName", appInfo.packageName);
            app.put("appName", pm.getApplicationLabel(appInfo).toString());

            try {
                Drawable icon = pm.getApplicationIcon(appInfo.packageName);
                app.put("icon", drawableToBase64(icon));
            } catch (PackageManager.NameNotFoundException e) {
                app.put("icon", "");
            }

            appsArray.put(app);
        }

        JSObject result = new JSObject();
        result.put("apps", appsArray);
        call.resolve(result);
    }

    @PluginMethod
    public void setLockState(PluginCall call) {
        boolean locked = call.getBoolean("locked", false);
        JSArray whitelistArray = call.getArray("whitelist");

        SharedPreferences prefs = getContext().getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putBoolean(KEY_LOCKED, locked);

        Set<String> whitelist = new HashSet<>();
        if (whitelistArray != null) {
            try {
                for (int i = 0; i < whitelistArray.length(); i++) {
                    whitelist.add(whitelistArray.getString(i));
                }
            } catch (Exception e) {
                // ignore
            }
        }
        // Always whitelist Katze and Settings
        whitelist.add("com.katze.app");
        whitelist.add("com.android.settings");
        whitelist.add("com.samsung.android.app.settings");
        editor.putStringSet(KEY_WHITELIST, whitelist);
        editor.apply();

        call.resolve();
    }

    @PluginMethod
    public void isAccessibilityEnabled(PluginCall call) {
        boolean enabled = isAccessibilityServiceEnabled();
        JSObject result = new JSObject();
        result.put("enabled", enabled);
        call.resolve(result);
    }

    @PluginMethod
    public void openAccessibilitySettings(PluginCall call) {
        Intent intent = new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(intent);
        call.resolve();
    }

    @PluginMethod
    public void startNfcScan(PluginCall call) {
        if (nfcAdapter == null) {
            call.reject("NFC not available on this device");
            return;
        }

        getActivity().runOnUiThread(() -> {
            Intent intent = new Intent(getActivity(), getActivity().getClass());
            intent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
            PendingIntent pendingIntent = PendingIntent.getActivity(
                    getActivity(), 0, intent, PendingIntent.FLAG_MUTABLE);

            IntentFilter[] filters = new IntentFilter[]{};
            nfcAdapter.enableForegroundDispatch(getActivity(), pendingIntent, filters, null);
        });

        call.resolve();
    }

    @PluginMethod
    public void stopNfcScan(PluginCall call) {
        if (nfcAdapter != null) {
            getActivity().runOnUiThread(() -> {
                nfcAdapter.disableForegroundDispatch(getActivity());
            });
        }
        call.resolve();
    }

    /**
     * Called from MainActivity when an NFC intent is received.
     */
    public void handleNfcIntent(Intent intent) {
        if (NfcAdapter.ACTION_TAG_DISCOVERED.equals(intent.getAction()) ||
                NfcAdapter.ACTION_TECH_DISCOVERED.equals(intent.getAction()) ||
                NfcAdapter.ACTION_NDEF_DISCOVERED.equals(intent.getAction())) {

            Tag tag = intent.getParcelableExtra(NfcAdapter.EXTRA_TAG);
            if (tag != null) {
                String uid = bytesToHex(tag.getId());
                JSObject data = new JSObject();
                data.put("uid", uid);
                notifyListeners("nfcTagDetected", data);
            }
        }
    }

    private boolean isAccessibilityServiceEnabled() {
        String prefString = Settings.Secure.getString(
                getContext().getContentResolver(),
                Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES);

        if (prefString == null) return false;

        String serviceName = getContext().getPackageName() +
                "/com.katze.app.services.AppBlockerService";
        return prefString.contains(serviceName);
    }

    private String drawableToBase64(Drawable drawable) {
        int width = Math.max(drawable.getIntrinsicWidth(), 1);
        int height = Math.max(drawable.getIntrinsicHeight(), 1);

        // Scale down large icons
        if (width > 96) { width = 96; height = 96; }

        Bitmap bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(bitmap);
        drawable.setBounds(0, 0, canvas.getWidth(), canvas.getHeight());
        drawable.draw(canvas);

        ByteArrayOutputStream stream = new ByteArrayOutputStream();
        bitmap.compress(Bitmap.CompressFormat.PNG, 80, stream);
        byte[] bytes = stream.toByteArray();
        bitmap.recycle();

        return Base64.encodeToString(bytes, Base64.NO_WRAP);
    }

    private static String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02X", b));
        }
        return sb.toString();
    }
}
