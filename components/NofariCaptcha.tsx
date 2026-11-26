import React from "react";
import { View, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";

type Props = {
  onToken: (token: string) => void;
};

export default function NofariCaptcha({ onToken }: Props) {
  const siteKey = process.env.EXPO_PUBLIC_TURNSTILE_SITE_KEY;

  return (
    <View style={{ height: 120, width: "100%" }}>
      <WebView
        originWhitelist={["https://*"]}
        source={{ uri: "https://nofame.org/nofari-captcha" }}
        javaScriptEnabled
        startInLoadingState
        renderLoading={() => <ActivityIndicator />}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === "turnstile") {
              if (typeof data.token === "string") {
                onToken(data.token);
              } else {
                onToken("");
              }
            }
          } catch {
            // Ignore unrelated messages.
          }
        }}
      />
    </View>
  );
}
