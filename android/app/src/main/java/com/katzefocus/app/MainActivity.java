package com.katzefocus.app;

import android.content.Intent;
import android.os.Bundle;

import com.getcapacitor.BridgeActivity;
import com.katzefocus.app.plugins.KatzePlugin;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(KatzePlugin.class);
        super.onCreate(savedInstanceState);

        // Process NFC intent that launched the app (cold start)
        handleNfcFromIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleNfcFromIntent(intent);
    }

    private void handleNfcFromIntent(Intent intent) {
        if (intent == null) return;

        KatzePlugin plugin = null;
        try {
            plugin = (KatzePlugin) getBridge().getPlugin("KatzePlugin").getInstance();
        } catch (Exception e) {
            // Bridge not ready yet
        }

        if (plugin != null) {
            plugin.handleNfcIntent(intent);
        }
    }
}
