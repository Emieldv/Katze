package com.katzefocus.app.plugins;

import android.Manifest;
import android.app.NotificationManager;
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
import android.os.Build;
import android.provider.Settings;
import android.util.Base64;
import android.util.Log;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

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
    private static final String KEY_LOCKED_AT = "locked_at";
    private static final String KEY_TIMER_HOURS = "timer_hours";
    private static final String KEY_TIMER_MINUTES = "timer_minutes";
    private static final int NOTIFICATION_PERMISSION_REQUEST = 1001;

    private NfcAdapter nfcAdapter;
    private String pendingNfcUid = null;

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

            // Hide pure system apps (keep updated system apps like Chrome, Gmail, etc.)
            boolean isSystem = (appInfo.flags & ApplicationInfo.FLAG_SYSTEM) != 0;
            boolean isUpdated = (appInfo.flags & ApplicationInfo.FLAG_UPDATED_SYSTEM_APP) != 0;
            if (isSystem && !isUpdated) continue;

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
        int timerHours = call.getInt("timerHours", 0);
        int timerMinutes = call.getInt("timerMinutes", 0);

        SharedPreferences prefs = getContext().getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putBoolean(KEY_LOCKED, locked);

        if (locked) {
            editor.putLong(KEY_LOCKED_AT, System.currentTimeMillis());
            editor.putInt(KEY_TIMER_HOURS, timerHours);
            editor.putInt(KEY_TIMER_MINUTES, timerMinutes);
        } else {
            editor.putLong(KEY_LOCKED_AT, 0);
        }

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
        whitelist.add("com.katzefocus.app");
        whitelist.add("com.android.settings");
        whitelist.add("com.samsung.android.app.settings");
        editor.putStringSet(KEY_WHITELIST, whitelist);
        editor.apply();

        Log.d("KatzeBlocker", "setLockState: locked=" + locked + " whitelist=" + whitelist);

        call.resolve();
    }

    @PluginMethod
    public void requestNotificationPermission(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(getContext(), Manifest.permission.POST_NOTIFICATIONS)
                    != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(
                        getActivity(),
                        new String[]{Manifest.permission.POST_NOTIFICATIONS},
                        NOTIFICATION_PERMISSION_REQUEST);
            }
        }
        call.resolve();
    }

    @PluginMethod
    public void isDndPolicyGranted(PluginCall call) {
        NotificationManager nm = (NotificationManager) getContext().getSystemService(Context.NOTIFICATION_SERVICE);
        JSObject result = new JSObject();
        result.put("granted", nm != null && nm.isNotificationPolicyAccessGranted());
        call.resolve(result);
    }

    @PluginMethod
    public void openDndSettings(PluginCall call) {
        // Try app-specific notification policy settings first
        try {
            Intent intent = new Intent(Settings.ACTION_NOTIFICATION_POLICY_ACCESS_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
        } catch (Exception e) {
            // Fallback to general notification settings
            Intent fallback = new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS);
            fallback.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(fallback);
        }
        call.resolve();
    }

    @PluginMethod
    public void getNativeLockState(PluginCall call) {
        SharedPreferences prefs = getContext().getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        boolean locked = prefs.getBoolean(KEY_LOCKED, false);
        JSObject result = new JSObject();
        result.put("locked", locked);
        call.resolve(result);
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

    @PluginMethod
    public void getPendingNfcTag(PluginCall call) {
        JSObject result = new JSObject();
        result.put("uid", pendingNfcUid);
        pendingNfcUid = null;
        call.resolve(result);
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

                if (hasListeners("nfcTagDetected")) {
                    notifyListeners("nfcTagDetected", data);
                } else {
                    // Store for later retrieval when JS is ready
                    pendingNfcUid = uid;
                    Log.d("KatzeBlocker", "NFC tag stored as pending: " + uid);
                }
            }
        }
    }

    private boolean isAccessibilityServiceEnabled() {
        String prefString = Settings.Secure.getString(
                getContext().getContentResolver(),
                Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES);

        if (prefString == null) return false;

        String serviceName = getContext().getPackageName() +
                "/com.katzefocus.app.services.AppBlockerService";
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
