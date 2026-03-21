package com.katzefocus.app.services;

import android.accessibilityservice.AccessibilityService;
import android.accessibilityservice.AccessibilityServiceInfo;
import android.app.ActivityManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
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
    private static final String KEY_LOCKED_AT = "locked_at";
    private static final String KEY_TIMER_HOURS = "timer_hours";
    private static final String KEY_TIMER_MINUTES = "timer_minutes";
    private static final String CHANNEL_ID = "katze_blocker";
    private static final int NOTIFICATION_ID = 1;
    private static final long NOTIFICATION_UPDATE_INTERVAL = 30_000; // 30 seconds

    private Set<String> launcherPackages;
    private boolean notificationShowing = false;
    private Handler handler;
    private final Runnable notificationUpdater = new Runnable() {
        @Override
        public void run() {
            if (checkAndHandleTimerExpiry()) return;
            updateNotificationTime();
            handler.postDelayed(this, NOTIFICATION_UPDATE_INTERVAL);
        }
    };

    @Override
    public void onServiceConnected() {
        launcherPackages = detectLauncherPackages();
        handler = new Handler(Looper.getMainLooper());
        createNotificationChannel();
        Log.d("KatzeBlocker", "Accessibility service connected");
        AccessibilityServiceInfo info = new AccessibilityServiceInfo();
        info.eventTypes = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED
                | AccessibilityEvent.TYPE_WINDOWS_CHANGED;
        info.feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC;
        info.notificationTimeout = 0;
        setServiceInfo(info);

        // Show notification and enable DND if already locked when service starts
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        if (prefs.getBoolean(KEY_LOCKED, false)) {
            showBlockingNotification();
            startNotificationUpdater();
            setDndEnabled(true);
        }
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

        if (!locked) {
            dismissBlockingNotification();
            stopNotificationUpdater();
            setDndEnabled(false);
            return;
        }

        // Check if timer has expired
        if (checkAndHandleTimerExpiry()) return;

        showBlockingNotification();
        startNotificationUpdater();
        setDndEnabled(true);

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

    /**
     * Checks if the lock timer has expired. If so, auto-unlocks and dismisses notification.
     * @return true if timer expired and lock was released
     */
    private boolean checkAndHandleTimerExpiry() {
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        long lockedAt = prefs.getLong(KEY_LOCKED_AT, 0);
        int hours = prefs.getInt(KEY_TIMER_HOURS, 0);
        int minutes = prefs.getInt(KEY_TIMER_MINUTES, 0);

        if (lockedAt == 0) return false;

        long timerMs = ((long) hours * 60 + minutes) * 60 * 1000;
        if (timerMs <= 0) return false;

        long elapsed = System.currentTimeMillis() - lockedAt;
        if (elapsed >= timerMs) {
            Log.d("KatzeBlocker", "Timer expired, auto-unlocking");
            prefs.edit().putBoolean(KEY_LOCKED, false).putLong(KEY_LOCKED_AT, 0).apply();
            dismissBlockingNotification();
            stopNotificationUpdater();
            setDndEnabled(false);
            return true;
        }

        return false;
    }

    private long getRemainingTimeMs() {
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        long lockedAt = prefs.getLong(KEY_LOCKED_AT, 0);
        int hours = prefs.getInt(KEY_TIMER_HOURS, 0);
        int minutes = prefs.getInt(KEY_TIMER_MINUTES, 0);

        if (lockedAt == 0) return -1;

        long timerMs = ((long) hours * 60 + minutes) * 60 * 1000;
        if (timerMs <= 0) return -1;

        long remaining = timerMs - (System.currentTimeMillis() - lockedAt);
        return Math.max(remaining, 0);
    }

    private String formatRemainingTime(long remainingMs) {
        long totalMinutes = remainingMs / 60_000;
        long hrs = totalMinutes / 60;
        long mins = totalMinutes % 60;

        if (hrs > 0) {
            return hrs + "h " + mins + "m remaining";
        } else if (mins > 0) {
            return mins + "m remaining";
        } else {
            return "Less than a minute remaining";
        }
    }

    private boolean isSystemPackage(String packageName) {
        // Katze itself
        if (packageName.equals("com.katzefocus.app")) return true;

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

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "App Blocker",
                    NotificationManager.IMPORTANCE_LOW);
            channel.setDescription("Shows when Katze is actively blocking apps");
            channel.setShowBadge(false);
            channel.setBypassDnd(true);
            NotificationManager nm = getSystemService(NotificationManager.class);
            if (nm != null) {
                nm.createNotificationChannel(channel);
            }
        }
    }

    private void showBlockingNotification() {
        String contentText = "Apps are currently locked";

        long remainingMs = getRemainingTimeMs();
        if (remainingMs > 0) {
            contentText = formatRemainingTime(remainingMs);
        }

        // Always update the notification to refresh the time
        Notification.Builder builder;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            builder = new Notification.Builder(this, CHANNEL_ID);
        } else {
            builder = new Notification.Builder(this);
        }

        Notification notification = builder
                .setSmallIcon(com.katzefocus.app.R.drawable.ic_notification)
                .setContentTitle("Katze is active")
                .setContentText(contentText)
                .setOngoing(true)
                .build();

        NotificationManager nm = getSystemService(NotificationManager.class);
        if (nm != null) {
            nm.notify(NOTIFICATION_ID, notification);
            notificationShowing = true;
        }
    }

    private void updateNotificationTime() {
        if (!notificationShowing) return;
        showBlockingNotification();
    }

    private void startNotificationUpdater() {
        handler.removeCallbacks(notificationUpdater);
        handler.postDelayed(notificationUpdater, NOTIFICATION_UPDATE_INTERVAL);
    }

    private void stopNotificationUpdater() {
        handler.removeCallbacks(notificationUpdater);
    }

    private void dismissBlockingNotification() {
        if (!notificationShowing) return;

        NotificationManager nm = getSystemService(NotificationManager.class);
        if (nm != null) {
            nm.cancel(NOTIFICATION_ID);
            notificationShowing = false;
        }
    }

    private void setDndEnabled(boolean enabled) {
        NotificationManager nm = getSystemService(NotificationManager.class);
        if (nm == null || !nm.isNotificationPolicyAccessGranted()) return;

        if (enabled) {
            // Priority mode: allow calls and messages, block other notifications
            nm.setNotificationPolicy(new NotificationManager.Policy(
                    NotificationManager.Policy.PRIORITY_CATEGORY_CALLS
                            | NotificationManager.Policy.PRIORITY_CATEGORY_MESSAGES
                            | NotificationManager.Policy.PRIORITY_CATEGORY_REPEAT_CALLERS,
                    NotificationManager.Policy.PRIORITY_SENDERS_ANY,
                    NotificationManager.Policy.PRIORITY_SENDERS_ANY));
            nm.setInterruptionFilter(NotificationManager.INTERRUPTION_FILTER_PRIORITY);
            Log.d("KatzeBlocker", "DND enabled (priority mode)");
        } else {
            nm.setInterruptionFilter(NotificationManager.INTERRUPTION_FILTER_ALL);
            Log.d("KatzeBlocker", "DND disabled");
        }
    }

    @Override
    public void onInterrupt() {
        // Required override
    }

    @Override
    public void onDestroy() {
        stopNotificationUpdater();
        setDndEnabled(false);
        super.onDestroy();
    }
}
