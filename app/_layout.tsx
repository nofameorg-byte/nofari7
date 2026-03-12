import { Stack, useRouter } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect } from "react";
import { OneSignal } from "react-native-onesignal";

export default function RootLayout() {

  const router = useRouter();

  useEffect(() => {

    OneSignal.initialize(process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID!);

    setTimeout(() => {
      OneSignal.Notifications.requestPermission(true);
      OneSignal.User.pushSubscription.optIn();
    }, 1000);

    /* PUSH CLICK LISTENER */

    OneSignal.Notifications.addEventListener("click", (event) => {

      const data = event?.notification?.additionalData;

      if (data?.screen === "circle") {

        // delay ensures router is ready when app opens
        setTimeout(() => {
          router.replace("/nofari?circle=true");
        }, 300);

      }

    });

  }, []);

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="nofari" />
      </Stack>
    </SafeAreaProvider>
  );
}