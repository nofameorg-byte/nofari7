import React from "react";
import { ScrollView, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Privacy Policy</Text>

        <Text style={styles.text}>
          NOFARI is designed to respect your privacy while providing meaningful
          conversational support. Microphone input only if you use voice features.
        </Text>

        <Text style={styles.section}>Information We Collect</Text>
        <Text style={styles.text}>
          NOFARI may collect limited information such as your email address and
          messages you choose to share within the app. This information is used
          only to provide core app functionality including account access and
          restoring conversations.
        </Text>

        <Text style={styles.section}>Push Notifications</Text>
        <Text style={styles.text}>
          NOFARI may send push notifications related to app functionality,
          including conversation alerts, updates, and NOFARI&apos;s Circle
          messages.
        </Text>

        <Text style={styles.section}>Use of Information</Text>
        <Text style={styles.text}>
          Information collected by NOFARI is used solely to operate and maintain
          the app and improve the user experience.
        </Text>

        <Text style={styles.section}>Data Storage</Text>
        <Text style={styles.text}>
          Some information may be stored locally on your device and securely
          within application systems to support conversation continuity and app
          functionality.
        </Text>

        <Text style={styles.section}>Account Deletion</Text>
        <Text style={styles.text}>
          The delete account option within the app removes locally stored data
          and account access. Additional data removal requests may be submitted
          by email.
        </Text>

        <Text style={styles.section}>Children&apos;s Privacy</Text>
        <Text style={styles.text}>
          NOFARI does not knowingly collect personal information from children
          under the age of 13.
        </Text>

        <Text style={styles.section}>Contact</Text>
        <Text style={styles.email}>contact@nofameai.com</Text>

        <Text style={styles.footer}>
          Last Updated: December 1, 2025
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#020925" },
  container: { padding: 20, paddingBottom: 40 },
  title: {
    color: "#ffffff",
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 16,
  },
  section: {
    color: "#d6b24a",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 8,
  },
  text: {
    color: "#e6e6e6",
    fontSize: 15,
    lineHeight: 22,
  },
  email: {
    color: "#00ffc6",
    fontSize: 16,
    marginTop: 6,
    fontWeight: "600",
  },
  footer: {
    marginTop: 30,
    color: "#8a8a8a",
    fontSize: 13,
  },
});