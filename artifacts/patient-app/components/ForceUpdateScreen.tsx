import React from "react";
import {
  Dimensions,
  Linking,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const INDIGO = "#818CF8";
const INDIGO_DIM = "rgba(129,140,248,0.15)";
const BG = "#0A0E1A";

interface Props {
  message: string;
  storeUrl: string;
}

export function ForceUpdateScreen({ message, storeUrl }: Props) {
  const handleUpdate = () => {
    if (storeUrl) {
      Linking.openURL(storeUrl).catch(() => {});
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      <View style={styles.iconWrap}>
        <Text style={styles.iconEmoji}>🚀</Text>
      </View>

      <Text style={styles.brand}>LINESETU</Text>
      <Text style={styles.patientLabel}>PATIENT APP</Text>

      <View style={styles.card}>
        <Text style={styles.title}>Update Required</Text>
        <Text style={styles.body}>{message}</Text>
      </View>

      <TouchableOpacity
        style={styles.btn}
        onPress={handleUpdate}
        activeOpacity={0.85}
      >
        <Text style={styles.btnText}>
          {Platform.OS === "ios" ? "Open App Store" : "Update on Play Store"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.hint}>You must update to access the app</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: BG,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    zIndex: 9999,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: INDIGO_DIM,
    borderWidth: 1.5,
    borderColor: "rgba(129,140,248,0.35)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  iconEmoji: { fontSize: 38 },
  brand: {
    fontSize: 26,
    fontWeight: "900",
    color: "#FFF",
    letterSpacing: 4,
    marginBottom: 2,
  },
  patientLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: INDIGO,
    letterSpacing: 3,
    marginBottom: 36,
  },
  card: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
    padding: 24,
    marginBottom: 28,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFF",
    marginBottom: 12,
    textAlign: "center",
  },
  body: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    lineHeight: 22,
  },
  btn: {
    width: Math.min(width - 64, 300),
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: INDIGO,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: INDIGO,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  btnText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: 0.5,
  },
  hint: {
    fontSize: 11,
    color: "rgba(255,255,255,0.25)",
    fontWeight: "500",
  },
});
