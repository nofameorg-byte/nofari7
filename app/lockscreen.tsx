import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  AppState,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LockScreen() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  const authenticate = async () => {
    setChecking(true);

    // delay so FaceID / biometrics trigger properly
    await new Promise((resolve) => setTimeout(resolve, 700));

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Unlock NOFARI",
      fallbackLabel: "Use Passcode",
      disableDeviceFallback: false,
    });

    if (result.success) {
      await AsyncStorage.removeItem("nofari_locked");
      router.replace("/nofari");
    } else {
      setChecking(false);
    }
  };

  useEffect(() => {
    authenticate();

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        authenticate();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {checking ? (
          <>
            <ActivityIndicator size="large" color="#00ffc6" />
            <Text style={styles.text}>Unlocking...</Text>
          </>
        ) : (
          <Text style={styles.text}>Authentication Failed</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#020925" },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#ffffff",
    marginTop: 20,
    fontSize: 18,
  },
});