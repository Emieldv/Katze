package com.katze.app.services;

import android.accessibilityservice.AccessibilityService;
import android.accessibilityservice.AccessibilityServiceInfo;
import android.content.Context;
import android.content.SharedPreferences;
import android.view.accessibility.AccessibilityEvent;

import java.util.Set;

/**
 * Accessibility service that monitors foreground app changes and sends the user
 * to the home screen when a non-whitelisted app is launched while lock is active.
 */
public class AppBlockerService extends AccessibilityService {

    private static final String PREFS_NAME = "katze_native_prefs";
    private static final String KEY_LOCKED = "locked";
    private static final String KEY_WHITELIST = "whitelist";

    @Override
    public void onServiceConnected() {
        AccessibilityServiceInfo info = new AccessibilityServiceInfo();
        info.eventTypes = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED;
        info.feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC;
        info.notificationTimeout = 100;
        setServiceInfo(info);
    }

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        if (event.getEventType() != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            return;
        }

        CharSequence packageNameCs = event.getPackageName();
        if (packageNameCs == null) return;
        String packageName = packageNameCs.toString();

        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        boolean locked = prefs.getBoolean(KEY_LOCKED, false);
        if (!locked) return;

        Set<String> whitelist = prefs.getStringSet(KEY_WHITELIST, null);
        if (whitelist != null && whitelist.contains(packageName)) return;

        // Allow system-critical packages through
        if (isSystemPackage(packageName)) {
            return;
        }

        // Send user to home screen
        performGlobalAction(GLOBAL_ACTION_HOME);
    }

    private boolean isSystemPackage(String packageName) {
        // System UI: notification shade, quick settings, status bar
        if (packageName.equals("com.android.systemui")) return true;

        // Launchers / home screen
        if (packageName.startsWith("com.android.launcher")) return true;
        if (packageName.equals("com.google.android.apps.nexuslauncher")) return true;
        if (packageName.equals("com.sec.android.app.launcher")) return true;
        if (packageName.equals("com.miui.home")) return true;
        if (packageName.equals("com.huawei.android.launcher")) return true;
        if (packageName.equals("com.oppo.launcher")) return true;
        if (packageName.equals("com.oneplus.launcher")) return true;

        // Settings
        if (packageName.equals("com.android.settings")) return true;
        if (packageName.equals("com.samsung.android.app.settings")) return true;

        // Recent apps / overview
        if (packageName.equals("com.android.quickstep")) return true;
        if (packageName.equals("com.google.android.apps.nexuslauncher")) return true;

        // System dialogs, permissions, package installer
        if (packageName.equals("android")) return true;
        if (packageName.equals("com.android.packageinstaller")) return true;
        if (packageName.equals("com.google.android.packageinstaller")) return true;
        if (packageName.equals("com.android.permissioncontroller")) return true;

        // Keyboard / input
        if (packageName.equals("com.google.android.inputmethod.latin")) return true;
        if (packageName.equals("com.samsung.android.honeyboard")) return true;
        if (packageName.equals("com.android.inputmethod.latin")) return true;

        // Katze itself
        if (packageName.equals("com.katze.app")) return true;

        return false;
    }

    @Override
    public void onInterrupt() {
        // Required override
    }
}
