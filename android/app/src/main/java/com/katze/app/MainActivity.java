package com.katze.app;

import android.content.Intent;
import android.os.Bundle;

import com.getcapacitor.BridgeActivity;
import com.katze.app.plugins.KatzePlugin;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(KatzePlugin.class);
        super.onCreate(savedInstanceState);
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);

        // Forward NFC intents to the plugin
        KatzePlugin plugin = (KatzePlugin) getBridge().getPlugin("KatzePlugin").getInstance();
        if (plugin != null) {
            plugin.handleNfcIntent(intent);
        }
    }
}
