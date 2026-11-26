import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NofariCaptcha from "../components/NofariCaptcha";

export default function IndexScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [reviewerPassword, setReviewerPassword] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const locked = await AsyncStorage.getItem("nofari_locked");

      if (session) {
        if (locked === "true") {
          router.replace("/lockscreen");
          return;
        }

        router.replace("/nofari");
        return;
      }

      setCheckingSession(false);
    };

    checkSession();
  }, []);

  const sendOtp = async () => {
    if (!email || !email.includes("@")) {
      Alert.alert("Enter valid email");
      return;
    }

    if (!captchaToken) {
      Alert.alert("Verification Required", "Please complete the security check.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        captchaToken: captchaToken ?? undefined,
      },
    });

    setLoading(false);

    if (error) {
      Alert.alert("OTP Error", error.message);
      return;
    }

    setStep("code");
  };

  const reviewerLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: reviewerPassword,
    });
    setLoading(false);

    if (error) {
      Alert.alert("Login Error", error.message);
      return;
    }

    router.replace("/nofari");
  };

  const verifyOtp = async () => {
    if (!code) return;

    setLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });

    if (error) {
      setLoading(false);
      Alert.alert("Invalid code");
      return;
    }

    setLoading(false);
    router.replace("/nofari");
  };

  if (checkingSession) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#00ffc6" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Image
            source={require("../assets/NOFARI-3.0.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.title}>NOFARI</Text>

          {step === "email" && (
            <>
              <TextInput
                placeholder="Enter your email"
                placeholderTextColor="#9aa4c7"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              {email.trim().toLowerCase() === "reviewer1@nofamai.com" && (
                <TextInput
                  placeholder="Reviewer password"
                  placeholderTextColor="#9aa4c7"
                  value={reviewerPassword}
                  onChangeText={setReviewerPassword}
                  style={styles.input}
                  secureTextEntry
                  autoCapitalize="none"
                />
              )}

              <TouchableOpacity
                style={styles.button}
                onPress={
                  email.trim().toLowerCase() === "reviewer1@nofamai.com"
                    ? reviewerLogin
                    : sendOtp
                }
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#020925" />
                ) : (
                  <Text style={styles.buttonText}>TAP IN</Text>
                )}
              </TouchableOpacity>

              <Text style={styles.subText}>(SEND CODE)</Text>

              <NofariCaptcha onToken={setCaptchaToken} />
            </>
          )}

          {step === "code" && (
            <>
              <TextInput
                placeholder="Enter 6-digit code"
                placeholderTextColor="#9aa4c7"
                value={code}
                onChangeText={setCode}
                style={styles.input}
                keyboardType="number-pad"
              />

              <TouchableOpacity
                style={styles.button}
                onPress={verifyOtp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#020925" />
                ) : (
                  <Text style={styles.buttonText}>VERIFY</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#020925" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  logo: { width: 140, height: 140, marginBottom: 16 },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 40,
  },
  input: {
    width: "100%",
    backgroundColor: "#04122b",
    color: "#ffffff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
  },
  button: {
    width: "100%",
    backgroundColor: "#00ffc6",
    padding: 16,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    fontWeight: "800",
    color: "#020925",
    fontSize: 16,
  },
  subText: {
    color: "#6fdcc8",
    fontSize: 12,
    marginTop: 6,
  },
});