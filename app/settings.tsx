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

              const { data } = await supabase.auth.getSession();
              const email = data?.session?.user?.email;

              if (email) {

                await fetch(`${process.env.EXPO_PUBLIC_API_URL}/delete-user-data`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ email }),
                });

              }

            } catch (err) {

              console.log("Delete request failed:", err);

            }

            await AsyncStorage.clear();

            await supabase.auth.signOut();

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