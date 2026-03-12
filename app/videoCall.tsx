import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { io } from "socket.io-client";
import {
  mediaDevices,
  RTCPeerConnection,
  RTCView,
  RTCSessionDescription,
  RTCIceCandidate,
  MediaStream
} from "react-native-webrtc";

export default function VideoCall() {

  const { room } = useLocalSearchParams();

  const socketRef = useRef<any>(null);
  const pcRef = useRef<any>(null);

  const [localStream, setLocalStream] = useState<any>(null);
  const [remoteStream, setRemoteStream] = useState<any>(null);

  useEffect(() => {
    startCall();
    return () => cleanup();
  }, []);

  const startCall = async () => {

    const socket = io(process.env.EXPO_PUBLIC_API_URL as string, {
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.emit("join-room", room);

    const stream = await mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    setLocalStream(stream);

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" }
      ],
    });

    pcRef.current = pc;

    stream.getTracks().forEach((track: any) => {
      pc.addTrack(track, stream);
    });

    pc.ontrack = (event: any) => {
      const inboundStream = new MediaStream();
      event.streams[0].getTracks().forEach((track: any) => {
        inboundStream.addTrack(track);
      });
      setRemoteStream(inboundStream);
    };

    pc.onicecandidate = (event: any) => {
      if (event.candidate) {
        socket.emit("signal", {
          roomId: room,
          data: { candidate: event.candidate },
        });
      }
    };

    socket.on("user-joined", async () => {

      const offer = await pc.createOffer();

      await pc.setLocalDescription(offer);

      socket.emit("signal", {
        roomId: room,
        data: { sdp: offer },
      });

    });

    socket.on("signal", async (data: any) => {

      if (data.sdp) {

        await pc.setRemoteDescription(
          new RTCSessionDescription(data.sdp)
        );

        if (data.sdp.type === "offer") {

          const answer = await pc.createAnswer();

          await pc.setLocalDescription(answer);

          socket.emit("signal", {
            roomId: room,
            data: { sdp: answer },
          });

        }

      }

      if (data.candidate) {

        try {
          await pc.addIceCandidate(
            new RTCIceCandidate(data.candidate)
          );
        } catch (err) {}

      }

    });

  };

  const cleanup = () => {

    if (pcRef.current) pcRef.current.close();

    if (socketRef.current) socketRef.current.disconnect();

  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {remoteStream && (
          <RTCView
            streamURL={remoteStream.toURL()}
            style={styles.remote}
            objectFit="cover"
          />
        )}

        {localStream && (
          <RTCView
            streamURL={localStream.toURL()}
            style={styles.local}
            objectFit="cover"
          />
        )}

      </View>
    </SafeAreaView>
  );

}

const styles = StyleSheet.create({

  safe: { flex: 1, backgroundColor: "black" },

  container: { flex: 1 },

  remote: { flex: 1 },

  local: {
    width: 120,
    height: 180,
    position: "absolute",
    top: 20,
    right: 20,
    borderRadius: 12,
  },

});