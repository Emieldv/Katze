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

        // Allow system UI packages through (notification shade, system dialogs, etc.)
        if (packageName.equals("com.android.systemui") ||
                packageName.equals("com.android.launcher") ||
                packageName.equals("com.android.launcher3") ||
                packageName.equals("com.google.android.apps.nexuslauncher") ||
                packageName.startsWith("com.android.launcher")) {
            return;
        }

        // Send user to home screen
        performGlobalAction(GLOBAL_ACTION_HOME);
    }

    @Override
    public void onInterrupt() {
        // Required override
    }
}
