import React from "react";
import { View, Text, StyleSheet, ScrollView, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function InstructionsScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Instructions</Text>

        <Text style={styles.sectionTitle}>Using NOFARI</Text>
        <Text style={styles.text}>
          NOFARI is here to support you through conversation, voice, and guidance.
          You can type or speak naturally—just say what&apos;s on your mind.
        </Text>

        <Text style={styles.sectionTitle}>Magic Link Sign-In</Text>
        <Text style={styles.text}>
          NOFARI uses a secure email magic link sign-in system.
          {"\n\n"}
          When you enter your email address, a one-time login link or code is sent
          to your email. Tap the link or enter the code to securely access your
          account.
          {"\n\n"}
          This method allows you to sign in without creating or remembering a
          password.
        </Text>

        <Text style={styles.sectionTitle}>Language</Text>
        <Text style={styles.text}>
          If you want NOFARI to speak your language just tell her in the CHAT.
        </Text>

        <Text style={styles.sectionTitle}>Voice Features</Text>
        <Text style={styles.text}>
          NOFARI supports text-to-speech and speech-to-text.
          {"\n\n"}
          If you do not see the microphone on your Android keyboard (including Samsung devices):
          {"\n\n"}
          Step 1: Make sure Gboard is your keyboard
          {"\n"}
          • Open Phone Settings{"\n"}
          • Tap General management{"\n"}
          • Tap Keyboard list and default{"\n"}
          • Set Default keyboard to Gboard{"\n\n"}
          Step 2: Turn on voice typing in Gboard
          {"\n"}
          • Open Settings{"\n"}
          • Tap General management{"\n"}
          • Tap Gboard settings{"\n"}
          • Tap Voice typing{"\n"}
          • Turn ON “Use voice typing”
          {"\n\n"}
          Step 3: Allow microphone access for NOFARI
          {"\n"}
          • Open Settings → Apps{"\n"}
          • Select NOFARI{"\n"}
          • Tap Permissions{"\n"}
          • Set Microphone to “Allow while using the app”
        </Text>

        <Text style={styles.sectionTitle}>NOFARI&apos;s Circle</Text>
        <Text style={styles.text}>
          NOFARI&apos;s Circle is a community feature that provides daily supportive
          messages and encouragement for users.
          {"\n\n"}
          The Circle is designed to promote positive support and community
          interaction while respecting user privacy.
        </Text>

        <Text style={styles.sectionTitle}>Push Notifications</Text>
        <Text style={styles.text}>
          NOFARI may send push notifications to inform you about new messages,
          daily support messages from NOFARI&apos;s Circle, and important updates.
          {"\n\n"}
          You can disable notifications anytime in your device settings.
        </Text>

        <Text style={styles.sectionTitle}>Lock App</Text>
        <Text style={styles.text}>
          The Lock App feature helps protect your conversations by requiring
          device authentication when reopening the app.
          {"\n\n"}
          Depending on your device settings this may include Face ID,
          fingerprint, or passcode verification.
        </Text>

        <Text style={styles.sectionTitle}>Scroll</Text>
        <Text style={styles.text}>
          To scroll and view full messages Tap screen once, and scroll.
        </Text>

        <Text style={styles.sectionTitle}>Log Out vs Delete</Text>
        <Text style={styles.text}>
          Logging out signs you out of the app but keeps your conversation data
          available for when you log back in.
          {"\n\n"}
          Deleting your account permanently removes your account access and
          associated data according to the NOFARI Privacy Policy.
        </Text>

        <View style={styles.footer}>
          <Text
            style={styles.link}
            onPress={() => Linking.openURL("https://www.nofame.org")}
          >
            www.nofame.org
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#020925" },
  container: { padding: 20, paddingBottom: 60 },
  title: {
    color: "#d6b24a",
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 20,
  },
  sectionTitle: {
    color: "#d6b24a",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 24,
    marginBottom: 10,
  },
  text: {
    color: "#ffffff",
    fontSize: 16,
    lineHeight: 24,
  },
  footer: {
    marginTop: 40,
    alignItems: "center",
  },
  link: {
    color: "#d6b24a",
    fontSize: 16,
    fontWeight: "600",
  },
});