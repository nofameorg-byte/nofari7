import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { io } from "socket.io-client";

const socket = io(process.env.EXPO_PUBLIC_API_URL as string, {
  transports: ["websocket"],
});

export default function IncomingCall() {
  const router = useRouter();
  const { from, room } = useLocalSearchParams();

  const acceptCall = () => {
    socket.emit("accept-call", { roomId: room });

    router.push({
      pathname: "/videoCall",
      params: { room },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.text}>Incoming Call</Text>
        <Text style={styles.text}>From: {from}</Text>

        <TouchableOpacity style={styles.accept} onPress={acceptCall}>
          <Text style={styles.btnText}>ACCEPT</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#020925" },
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { color: "#fff", fontSize: 22, marginBottom: 20 },
  accept: {
    backgroundColor: "#00ffc6",
    padding: 20,
    borderRadius: 40,
  },
  btnText: { color: "#020925", fontWeight: "bold" },
});