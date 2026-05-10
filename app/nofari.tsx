import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Animated,
  Image,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import { activateKeepAwake, deactivateKeepAwake } from "expo-keep-awake";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "../lib/supabase";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

type Message = {
  id: string;
  role: "user" | "nofari";
  text: string;
};

const STORAGE_KEY = "nofari_messages";
const BACKEND_URL = `${process.env.EXPO_PUBLIC_API_URL}/nofari`;


console.log("API URL:", process.env.EXPO_PUBLIC_API_URL);
console.log("BACKEND URL:", BACKEND_URL);

export default function NofariScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [thinking, setThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showCircle, setShowCircle] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const [circleDailyMessage, setCircleDailyMessage] = useState(
    "Your support message is loading..."
  );

  const glowAnim = useRef(new Animated.Value(1)).current;
  const circleGlow = useRef(new Animated.Value(1)).current;

  const speakBar1 = useRef(new Animated.Value(1)).current;
  const speakBar2 = useRef(new Animated.Value(1)).current;
  const speakBar3 = useRef(new Animated.Value(1)).current;

  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getSession();
      const email = data?.session?.user?.email || "";
      setUserEmail(email);
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (params?.circle === "true") {
      setShowCircle(true);
    }
  }, [params]);

  useEffect(() => {
    activateKeepAwake();
    return () => deactivateKeepAwake();
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved) setMessages(JSON.parse(saved));
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (!showCircle) return;

    fetch(`${process.env.EXPO_PUBLIC_API_URL}/circle-message`)
      .then(res => res.json())
      .then(data => {
        if (data?.message) {
          setCircleDailyMessage(data.message);
        }
      })
      .catch(() => {
        setCircleDailyMessage(
          "Even small steps forward still move your life ahead."
        );
      });
  }, [showCircle]);

  /* =========================
     AUTO RETURN FROM CIRCLE
     prevents freeze if user
     leaves Circle open
  ========================= */

  useEffect(() => {
    if (!showCircle) return;

    const timer = setTimeout(() => {
      setShowCircle(false);
    }, 60000);

    return () => clearTimeout(timer);
  }, [showCircle]);

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1.15,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.9,
          duration: 1400,
          useNativeDriver: true,
        }),
      ])
    );

    anim.start();
    return () => anim.stop();
  }, [showCircle]);

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(circleGlow, {
          toValue: 1.18,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(circleGlow, {
          toValue: 1,
          duration: 1600,
          useNativeDriver: true,
        }),
      ])
    );

    anim.start();
    return () => anim.stop();
  }, [showCircle]);

  useEffect(() => {
    if (!isSpeaking) return;

    const animateBar = (bar: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bar, {
            toValue: 1.8,
            duration: 250,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(bar, {
            toValue: 0.6,
            duration: 250,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animateBar(speakBar1, 0);
    animateBar(speakBar2, 120);
    animateBar(speakBar3, 240);
  }, [isSpeaking]);

  async function playAudioFromUrl(url: string) {

    console.log("PLAY AUDIO FUNCTION CALLED");
    const fullUrl = url.startsWith("http")
  ? url
  : `${process.env.EXPO_PUBLIC_API_URL}${url}`;

console.log("PLAYING AUDIO:", fullUrl);

    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch {}
      soundRef.current = null;
    }
    
await Audio.setAudioModeAsync({
  playsInSilentModeIOS: true,
  staysActiveInBackground: false,
  shouldDuckAndroid: true,
});


    const { sound } = await Audio.Sound.createAsync(
      { uri: fullUrl },
      { shouldPlay: true }
    );

    soundRef.current = sound;
    setIsSpeaking(true);

    sound.setOnPlaybackStatusUpdate((status) => {
      if (!status.isLoaded) return;
      if (status.didJustFinish) {
        setIsSpeaking(false);
        sound.unloadAsync();
        soundRef.current = null;
      }
    });

    await sound.playAsync();
  }
const uploadAndSend = async (file: any) => {

  setSelectedFile(file);

  const autoMessage = "User uploaded a file";

  const userMessage: Message = {
    id: Date.now().toString(),
    role: "user",
    text: autoMessage,
  };

  setMessages((prev) => [userMessage, ...prev]);
  setThinking(true);

  try {

    const formData = new FormData();

    formData.append("message", autoMessage);
    formData.append("email", userEmail);

    formData.append("file", {
      uri: file.uri,
      name: file.name || "upload",
      type: file.mimeType || file.type || "application/octet-stream",
    } as any);

    const res = await fetch(BACKEND_URL, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    setMessages((prev) => [
      {
        id: `${Date.now()}-n`,
        role: "nofari",
        text: data.reply,
      },
      ...prev,
    ]);

    if (data.audioUrl) {
      await playAudioFromUrl(data.audioUrl);
    }

  } catch (err) {

    console.log("UPLOAD SEND ERROR:", err);

  } finally {

    setSelectedFile(null);
    setThinking(false);

  }

};

const pickFile = async () => {

  Alert.alert(
    "Upload",
    "Choose a source",
    [
      {
        text: "Photos",
        onPress: async () => {

          const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

          if (!permission.granted) return;

          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
          });

          if (result.canceled) return;

          await uploadAndSend(result.assets[0]);

        },
      },

      {
        text: "Files",
        onPress: async () => {

          const result = await DocumentPicker.getDocumentAsync({
            type: ["image/*", "application/pdf"],
            copyToCacheDirectory: true,
          });

          if (result.canceled) return;

          await uploadAndSend(result.assets[0]);

        },
      },

      {
        text: "Cancel",
        style: "cancel",
      },
    ]
  );

};
  const sendMessage = async () => {
    if (!input.trim() || isSpeaking) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      text: input,
    };

    setMessages((prev) => [userMessage, ...prev]);
    setInput("");
    setThinking(true);

    try {
      let res;

if (selectedFile) {

  const formData = new FormData();

  formData.append("message", userMessage.text);
  formData.append("email", userEmail);

  formData.append("file", {
    uri: selectedFile.uri,
    name: selectedFile.name || "upload",
    type: selectedFile.mimeType || "application/octet-stream",
  } as any);

  res = await fetch(BACKEND_URL, {
    method: "POST",
    body: formData,
  });

} else {

  res = await fetch(BACKEND_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: userMessage.text,
      email: userEmail,
    }),
  });

}

      const data = await res.json();
      console.log("FULL RESPONSE:", data);
console.log("AUDIO URL TYPE:", typeof data.audioUrl);
console.log("AUDIO URL VALUE:", data.audioUrl);

      setMessages((prev) => [
        {
          id: `${Date.now()}-n`,
          role: "nofari",
          text: data.reply,
        },
        ...prev,
      ]);

      console.log("AUDIO URL:", data.audioUrl);

if (data.audioUrl) {
  await playAudioFromUrl(data.audioUrl);
}

    } catch (err) {
      console.error("NOFARI frontend error:", err);
    } finally {
      setSelectedFile(null);
      setThinking(false);
    }
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isUser = item.role === "user";
    return (
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.nofariBubble,
          isUser ? styles.right : styles.left,
        ]}
      >
        <Text style={styles.bubbleText}>{item.text}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>

      {!showCircle && (
        <>
          <View style={styles.header}>

            <Animated.View
              style={[styles.glow, { transform: [{ scale: glowAnim }] }]}
            />

            <Image
              source={require("../assets/images/nofari-face.png")}
              style={[styles.logo,{opacity:1}]}
            />

            {isSpeaking && (
              <View style={styles.speakingBars}>
                <Animated.View style={[styles.bar,{transform:[{scaleY:speakBar1}]}]} />
                <Animated.View style={[styles.bar,{transform:[{scaleY:speakBar2}]}]} />
                <Animated.View style={[styles.bar,{transform:[{scaleY:speakBar3}]}]} />
              </View>
            )}

          </View>

          <KeyboardAvoidingView
            style={styles.keyboardArea}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <FlatList
              data={messages}
              inverted
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.chatContent}
            />

            {thinking && (
              <View style={styles.thinkingBar}>
                <Text style={styles.thinking}>NOFARI is thinking...</Text>
              </View>
            )}

            <View style={styles.inputBar}>

  <TouchableOpacity onPress={pickFile} style={{ marginRight: 6 }}>
    <Ionicons name="attach-outline" size={26} color="#00ffc6" />
  </TouchableOpacity>

  <TextInput
    value={input}
    onChangeText={setInput}
    placeholder="Talk to NOFARI..."
    placeholderTextColor="#6fdcc8"
    style={styles.input}
    multiline
  />

  <TouchableOpacity
    style={styles.sendBtn}
    onPress={sendMessage}
  >
    <Text style={styles.sendText}>CHAT</Text>
  </TouchableOpacity>

</View>
          </KeyboardAvoidingView>
        </>
      )}

      {showCircle && (
  <View style={{ flex:1 }}>
    <FlatList
      data={[{ id:"circle" }]}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      renderItem={() => (
        <View style={styles.circleContainer}>

          <View style={styles.circleTopArea}>

            <Animated.View
              style={[
                styles.goldPulse,
                { transform: [{ scale: circleGlow }] }
              ]}
            />

            <Image
              source={require("../assets/images/circle.png")}
              style={[styles.circleImage,{opacity:1}]}
            />

          </View>

          <Text style={styles.circleTitle}>NOFARI'S CIRCLE</Text>

          <View style={styles.circleBubble}>
            <Text style={styles.circleBubbleText}>
              Daily support affirmations
            </Text>
          </View>

          <View style={styles.circleMessageBox}>
            <Text style={styles.circleSub}>
              {circleDailyMessage}
            </Text>
          </View>

        </View>
      )}
    />
  </View>
)}

      <SafeAreaView edges={["bottom"]} style={styles.bottomSafe}>
        <View style={styles.bottomBar}>

          <TouchableOpacity onPress={() => setShowCircle(true)}>
            <Image
              source={require("../assets/images/circle.png")}
              style={{ width: 30, height: 30 }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setShowCircle(false);
              router.replace("/nofari");
            }}
          >
            <Text style={styles.bottomText}>NOFARI</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/settings")}>
            <Ionicons name="settings-outline" size={34} color="#00ffc6" />
          </TouchableOpacity>

        </View>
      </SafeAreaView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:{flex:1,backgroundColor:"#020925"},
  header:{alignItems:"center",paddingVertical:12},
  glow:{
    position:"absolute",
    width:150,
    height:150,
    borderRadius:60,
    backgroundColor:"#00ffc6",
    opacity:0.25
  },
  logo:{
  width:130,
  height:130,
  resizeMode:"contain",
  transform:[{scale:0.82}]
},
  speakingBars:{flexDirection:"row",marginTop:8,gap:4},
  bar:{width:4,height:16,backgroundColor:"#00ffc6",borderRadius:2},
  keyboardArea:{flex:1},
  chatContent:{paddingHorizontal:14,paddingTop:10,paddingBottom:10},
  bubble:{maxWidth:"75%",padding:14,borderRadius:18,marginVertical:6},
  userBubble:{backgroundColor:"#00ffc6"},
  nofariBubble:{backgroundColor:"#102a38"},
  bubbleText:{color:"#ffffff",fontSize:16,lineHeight:22},
  right:{alignSelf:"flex-end"},
  left:{alignSelf:"flex-start"},
  thinkingBar:{paddingVertical:6,alignItems:"center"},
  thinking:{color:"#6fdcc8",fontSize:14},
  inputBar:{
    flexDirection:"row",
    alignItems:"flex-end",
    padding:10,
    borderTopWidth:0.5,
    borderTopColor:"#0c2a3a"
  },
  input:{
    flex:1,
    backgroundColor:"#071d2b",
    borderRadius:20,
    padding:10,
    color:"#fff"
  },
  sendBtn:{
    backgroundColor:"#00ffc6",
    borderRadius:22,
    paddingHorizontal:18,
    justifyContent:"center",
    marginLeft:8,
    height:44
  },
  sendText:{color:"#021e19",fontWeight:"bold"},
  circleContainer:{
    flex:1,
    alignItems:"center",
    paddingTop:40,
    paddingHorizontal:30
  },
  circleTopArea:{
    width:200,
    height:200,
    alignItems:"center",
    justifyContent:"center",
    marginBottom:20
  },
  goldPulse:{
    position:"absolute",
    width:200,
    height:200,
    borderRadius:100,
    backgroundColor:"#FFD700",
    opacity:0.3
  },
  circleImage:{width:140,height:140},
  circleTitle:{color:"#ffffff",fontSize:22,fontWeight:"700",marginBottom:14},
  circleBubble:{
  backgroundColor:"#102a38",
  paddingVertical:10,
  paddingHorizontal:18,
  borderRadius:20,
  marginBottom:16,
  alignSelf:"center",
  maxWidth:"90%"   // 🔑 prevents squeezing + keeps one line
},
  circleBubbleText:{
  color:"#FFD700",
  fontSize:16,
  fontWeight:"600",
  textAlign:"center",
  flexWrap:"nowrap"   // 🔑 stops stacking
},
  circleMessageBox:{
    width:"100%",
    minHeight:120,
    borderRadius:14,
    borderWidth:1,
    borderColor:"#FFD700",
    padding:18,
    backgroundColor:"#071d2b"
  },
  circleSub:{color:"#9edfd3",fontSize:16,textAlign:"center",lineHeight:24},
  bottomSafe:{backgroundColor:"#020925"},
  bottomBar:{
    height:58,
    borderTopWidth:0.6,
    borderTopColor:"#0c2a3a",
    paddingHorizontal:20,
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center"
  },
  bottomText:{color:"#ffffff",fontWeight:"600",fontSize:16}
});