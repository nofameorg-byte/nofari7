import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabase";

export default function SettingsScreen() {

  const router = useRouter();

  const handleLock = async () => {

    await AsyncStorage.setItem("nofari_locked", "true");

    router.replace("/lockscreen");

  };

  const handleDelete = async () => {

    Alert.alert(
      "Delete Local Data",
      "This removes NOFARI data stored on this device and clears your conversation history.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {

            try {

              const { data, error: sessionError } = await supabase.auth.getSession();

              if (sessionError || !data.session?.access_token) {
                throw new Error("No valid login session");
              }

              const response = await fetch(
                `${process.env.EXPO_PUBLIC_API_URL}/delete-user-data`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${data.session.access_token}`,
                  },
                }
              );

              const result = await response.json();

              if (!response.ok || !result.success) {
                throw new Error("Account deletion failed");
              }

            } catch (err) {

              console.log("Delete request failed:", err);

              Alert.alert(
                "Account Deletion Failed",
                "Your account could not be deleted. Please try again."
              );

              return;

            }

            const { error: signOutError } = await supabase.auth.signOut();

            if (signOutError) {
              Alert.alert(
                "Sign Out Failed",
                "Please try again. Your session could not be cleared."
              );
              return;
            }

            await AsyncStorage.clear();

            router.replace("/");

          },
        },
      ]
    );

  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>

      <ScrollView contentContainerStyle={styles.container}>

        <TouchableOpacity
          style={styles.linkCard}
          onPress={() => router.push("/instructions")}
        >
          <Text style={styles.linkText}>Instructions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkCard}
          onPress={() => router.push("/privacy")}
        >
          <Text style={styles.linkText}>Privacy Policy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkCard}
          onPress={() => router.push("/terms")}
        >
          <Text style={styles.linkText}>Terms of Service</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLock}>
          <Text style={styles.logoutText}>Lock App</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>

      </ScrollView>

    </SafeAreaView>
  );

}

const styles = StyleSheet.create({

  safe: {
    flex: 1,
    backgroundColor: "#020925",
  },

  container: {
    padding: 20,
    paddingBottom: 40,
  },

  linkCard: {
    backgroundColor: "#0b0b0b",
    borderRadius: 16,
    padding: 18,
    marginTop: 18,
  },

  linkText: {
    color: "#d6b24a",
    fontSize: 18,
    fontWeight: "600",
  },

  logoutBtn: {
    marginTop: 36,
    backgroundColor: "#3a3a3a",
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
  },

  logoutText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },

  deleteBtn: {
    marginTop: 16,
    backgroundColor: "#8b0000",
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
  },

  deleteText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },

});