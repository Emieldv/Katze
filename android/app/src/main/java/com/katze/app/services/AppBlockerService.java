package com.katze.app.services;

import android.accessibilityservice.AccessibilityService;
import android.accessibilityservice.AccessibilityServiceInfo;
import android.app.ActivityManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.util.Log;
import android.view.accessibility.AccessibilityEvent;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Accessibility service that monitors foreground app changes and sends the user
 * to the home screen when a non-whitelisted app is launched while lock is active.
 */
public class AppBlockerService extends AccessibilityService {

    private static final String PREFS_NAME = "katze_native_prefs";
    private static final String KEY_LOCKED = "locked";
    private static final String KEY_WHITELIST = "whitelist";

    private Set<String> launcherPackages;

    @Override
    public void onServiceConnected() {
        launcherPackages = detectLauncherPackages();
        Log.d("KatzeBlocker", "Accessibility service connected");
        AccessibilityServiceInfo info = new AccessibilityServiceInfo();
        info.eventTypes = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED
                | AccessibilityEvent.TYPE_WINDOWS_CHANGED;
        info.feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC;
        info.notificationTimeout = 0;
        setServiceInfo(info);
    }

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        if (event.getEventType() != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED
                && event.getEventType() != AccessibilityEvent.TYPE_WINDOWS_CHANGED) {
            return;
        }

        CharSequence packageNameCs = event.getPackageName();
        if (packageNameCs == null) return;
        String packageName = packageNameCs.toString();

        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        boolean locked = prefs.getBoolean(KEY_LOCKED, false);

        Log.d("KatzeBlocker", "Event: " + packageName + " | locked=" + locked);

        if (!locked) return;

        Set<String> whitelist = prefs.getStringSet(KEY_WHITELIST, null);
        if (whitelist != null && whitelist.contains(packageName)) {
            Log.d("KatzeBlocker", "Whitelisted: " + packageName);
            return;
        }

        // Allow system-critical packages through
        if (isSystemPackage(packageName) || isPureSystemApp(packageName)) {
            Log.d("KatzeBlocker", "System package, allowing: " + packageName);
            return;
        }

        Log.d("KatzeBlocker", "Blocking: " + packageName);
        performGlobalAction(GLOBAL_ACTION_HOME);

        // Kill the background process to remove it from recents
        ActivityManager am = (ActivityManager) getSystemService(Context.ACTIVITY_SERVICE);
        if (am != null) {
            am.killBackgroundProcesses(packageName);
        }
    }

    private boolean isSystemPackage(String packageName) {
        // Katze itself
        if (packageName.equals("com.katze.app")) return true;

        // System UI: notification shade, quick settings, status bar
        if (packageName.equals("com.android.systemui")) return true;
        if (packageName.equals("android")) return true;

        // Settings (any variant)
        if (packageName.contains("settings")) return true;

        // Launchers / home screen / recents (dynamically detected)
        if (launcherPackages != null && launcherPackages.contains(packageName)) return true;

        // System dialogs, permissions, package installer
        if (packageName.equals("com.android.packageinstaller")) return true;
        if (packageName.equals("com.google.android.packageinstaller")) return true;
        if (packageName.equals("com.android.permissioncontroller")) return true;

        // Keyboard / input methods
        if (packageName.contains("inputmethod")) return true;
        if (packageName.contains("keyboard")) return true;
        if (packageName.contains("honeyboard")) return true;

        return false;
    }

    private Set<String> detectLauncherPackages() {
        Set<String> launchers = new HashSet<>();
        PackageManager pm = getPackageManager();

        // Query all apps that can handle the HOME intent (launchers)
        Intent homeIntent = new Intent(Intent.ACTION_MAIN);
        homeIntent.addCategory(Intent.CATEGORY_HOME);
        List<ResolveInfo> homeApps = pm.queryIntentActivities(homeIntent, 0);
        for (ResolveInfo ri : homeApps) {
            launchers.add(ri.activityInfo.packageName);
        }

        // Also resolve the default launcher specifically
        ResolveInfo defaultHome = pm.resolveActivity(homeIntent, PackageManager.MATCH_DEFAULT_ONLY);
        if (defaultHome != null && defaultHome.activityInfo != null) {
            launchers.add(defaultHome.activityInfo.packageName);
        }

        Log.d("KatzeBlocker", "Detected launcher packages: " + launchers);
        return launchers;
    }

    private boolean isPureSystemApp(String packageName) {
        try {
            PackageManager pm = getPackageManager();
            ApplicationInfo info = pm.getApplicationInfo(packageName, 0);
            boolean isSystem = (info.flags & ApplicationInfo.FLAG_SYSTEM) != 0;
            boolean isUpdated = (info.flags & ApplicationInfo.FLAG_UPDATED_SYSTEM_APP) != 0;
            return isSystem && !isUpdated;
        } catch (PackageManager.NameNotFoundException e) {
            return false;
        }
    }

    @Override
    public void onInterrupt() {
        // Required override
    }
}
