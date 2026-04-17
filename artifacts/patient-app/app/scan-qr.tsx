import { FeatherIcon as Feather } from "@/components/FeatherIcon";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const isWeb = Platform.OS === "web";

// expo-camera uses `getUserMedia` on web. Some browsers (or insecure contexts)
// don't expose the camera at all, so we have to load the module defensively.
let CameraView: any = null;
let useCameraPermissions: any = null;
try {
  const cam = require("expo-camera");
  CameraView = cam.CameraView ?? null;
  useCameraPermissions = cam.useCameraPermissions ?? null;
} catch {
  CameraView = null;
  useCameraPermissions = null;
}

/**
 * Parse a scanned QR payload and extract a doctor ID if it points to a
 * LINESETU doctor profile. Returns null for any payload that isn't a
 * recognised LINESETU doctor link — we deliberately reject arbitrary URLs
 * and bare IDs so unrelated QR codes don't get treated as valid links.
 *
 * Accepted shapes:
 *   - patient-app://doctor/{id}                       (app deep link)
 *   - https://<host>/patient-app/doctor/{id}          (universal/web link)
 *   - https://<host>/patient-app/doctor/{id}?...      (with query/hash)
 *
 * Doctor IDs are Firestore document IDs (20 chars, alphanumeric).
 */
function parseDoctorIdFromQr(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const data = String(raw).trim();
  if (!data) return null;

  // App deep-link: patient-app://doctor/<id>
  const schemeMatch = data.match(/^patient-app:\/\/doctor\/([A-Za-z0-9]{16,32})(?:[/?#]|$)/);
  if (schemeMatch) return schemeMatch[1];

  // Universal/web link: must include the LINESETU patient-app base path.
  // This rejects unrelated /doctor/... URLs from other sites.
  const httpsMatch = data.match(/^https?:\/\/[^/]+\/patient-app\/doctor\/([A-Za-z0-9]{16,32})(?:[/?#]|$)/);
  if (httpsMatch) return httpsMatch[1];

  return null;
}

export default function ScanQRScreen() {
  const insets = useSafeAreaInsets();
  const topPad = isWeb ? 24 : insets.top + 4;

  const permissionHook = useCameraPermissions ? useCameraPermissions() : [null, null];
  const permission = permissionHook[0];
  const requestPermission = permissionHook[1];

  const [error, setError] = useState<string | null>(null);
  const handledRef = useRef(false);

  // Auto-prompt on first mount if permission is undetermined.
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain && requestPermission) {
      requestPermission().catch(() => {});
    }
  }, [permission?.granted, permission?.canAskAgain, requestPermission]);

  const handleScanned = useCallback((event: { data?: string }) => {
    if (handledRef.current) return;
    const id = parseDoctorIdFromQr(event?.data);
    if (!id) {
      handledRef.current = true;
      setError("This QR code isn't a LINESETU doctor link. Please scan a doctor's profile QR.");
      // Allow re-scan after a short delay
      setTimeout(() => { handledRef.current = false; }, 1500);
      return;
    }
    handledRef.current = true;
    setError(null);
    // Replace so back button returns to home, not the scanner
    router.replace({ pathname: `/doctor/${id}` as any });
  }, []);

  const close = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)");
  }, []);

  // ── Web fallback: expo-camera works in modern browsers but only over HTTPS
  // and requires explicit user permission. On the workspace preview the iframe
  // sandbox blocks getUserMedia, so show a friendly message instead of crashing.
  if (isWeb || !CameraView) {
    return (
      <View style={styles.container}>
        <View style={styles.orb1} />
        <View style={styles.orb2} />
        <View style={[styles.topBar, { paddingTop: topPad }]}>
          <Pressable style={styles.iconBtn} onPress={close}>
            <Feather name="x" size={20} color="#FFF" />
          </Pressable>
          <Text style={styles.title}>Scan QR</Text>
          <View style={{ width: 38 }} />
        </View>
        <View style={styles.centerBlock}>
          <View style={styles.bigIconWrap}>
            <Feather name="smartphone" size={36} color="#F59E0B" />
          </View>
          <Text style={styles.bigTitle}>Open on your phone</Text>
          <Text style={styles.bigSub}>
            QR scanning uses your device camera and isn't available in the web preview. Please open the LINESETU app on your phone to scan a doctor's profile QR.
          </Text>
          <Pressable style={[styles.primaryBtn, { marginTop: 24 }]} onPress={close}>
            <LinearGradient colors={["#4F46E5", "#6366F1", "#0EA5E9"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
            <Feather name="arrow-left" size={16} color="#FFF" />
            <Text style={styles.primaryBtnTxt}>Back to Home</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ── Permission states ────────────────────────────────────────────
  if (!permission) {
    return (
      <View style={[styles.container, { alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#F59E0B" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.orb1} />
        <View style={styles.orb2} />
        <View style={[styles.topBar, { paddingTop: topPad }]}>
          <Pressable style={styles.iconBtn} onPress={close}>
            <Feather name="x" size={20} color="#FFF" />
          </Pressable>
          <Text style={styles.title}>Scan QR</Text>
          <View style={{ width: 38 }} />
        </View>
        <View style={styles.centerBlock}>
          <View style={styles.bigIconWrap}>
            <Feather name="camera-off" size={36} color="#F59E0B" />
          </View>
          <Text style={styles.bigTitle}>Camera permission needed</Text>
          <Text style={styles.bigSub}>
            LINESETU needs access to your camera to scan doctor profile QR codes. Your camera feed never leaves your device.
          </Text>
          {permission.canAskAgain ? (
            <Pressable style={[styles.primaryBtn, { marginTop: 24 }]} onPress={() => requestPermission && requestPermission()}>
              <LinearGradient colors={["#F59E0B", "#FB923C"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
              <Feather name="camera" size={16} color="#FFF" />
              <Text style={styles.primaryBtnTxt}>Allow camera</Text>
            </Pressable>
          ) : (
            <Pressable style={[styles.primaryBtn, { marginTop: 24 }]} onPress={() => Linking.openSettings()}>
              <LinearGradient colors={["#F59E0B", "#FB923C"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
              <Feather name="settings" size={16} color="#FFF" />
              <Text style={styles.primaryBtnTxt}>Open settings</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  }

  // ── Live scanner ─────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={handleScanned}
      />

      {/* Dim overlay with a transparent square in the middle */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.overlayDim} />
        <View style={styles.viewfinderRow}>
          <View style={styles.overlayDim} />
          <View style={styles.viewfinder}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
          <View style={styles.overlayDim} />
        </View>
        <View style={styles.overlayDim} />
      </View>

      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: topPad, position: "absolute", top: 0, left: 0, right: 0 }]}>
        <Pressable style={styles.iconBtn} onPress={close}>
          <Feather name="x" size={20} color="#FFF" />
        </Pressable>
        <Text style={styles.title}>Scan QR</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* Hint pill */}
      <View style={styles.hintWrap} pointerEvents="none">
        <View style={styles.hintPill}>
          <Feather name="grid" size={13} color="#F59E0B" />
          <Text style={styles.hintTxt}>Point camera at a doctor's QR code</Text>
        </View>
      </View>

      {/* Error toast */}
      {error && (
        <View style={[styles.errorWrap, { bottom: 32 + insets.bottom }]}>
          <View style={styles.errorPill}>
            <Feather name="alert-circle" size={14} color="#F87171" />
            <Text style={styles.errorTxt}>{error}</Text>
          </View>
          <Pressable style={styles.scanAgainBtn} onPress={() => { setError(null); handledRef.current = false; }}>
            <Feather name="refresh-cw" size={13} color="#FFF" />
            <Text style={styles.scanAgainTxt}>Scan again</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const VIEWFINDER = 260;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#060A14" },
  orb1: { position: "absolute", top: -40, left: -40, width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(245,158,11,0.15)" },
  orb2: { position: "absolute", bottom: -60, right: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: "rgba(99,102,241,0.14)" },

  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 10 },
  iconBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(10,14,26,0.7)", borderWidth: 1, borderColor: "rgba(255,255,255,0.14)", alignItems: "center", justifyContent: "center" },
  title: { fontSize: 15, fontWeight: "700", color: "#FFF" },

  centerBlock: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 28 },
  bigIconWrap: { width: 84, height: 84, borderRadius: 24, backgroundColor: "rgba(245,158,11,0.14)", borderWidth: 1, borderColor: "rgba(245,158,11,0.35)", alignItems: "center", justifyContent: "center", marginBottom: 22 },
  bigTitle: { fontSize: 19, fontWeight: "900", color: "#FFF", textAlign: "center", marginBottom: 8 },
  bigSub: { fontSize: 13, lineHeight: 19, color: "rgba(255,255,255,0.55)", textAlign: "center" },

  primaryBtn: { height: 48, paddingHorizontal: 22, borderRadius: 14, overflow: "hidden", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  primaryBtnTxt: { fontSize: 14, fontWeight: "700", color: "#FFF" },

  // Viewfinder mask: 3 horizontal bands; middle band has [dim | window | dim]
  overlayDim: { flex: 1, backgroundColor: "rgba(6,10,20,0.65)" },
  viewfinderRow: { flexDirection: "row", height: VIEWFINDER },
  viewfinder: { width: VIEWFINDER, height: VIEWFINDER, position: "relative" },
  corner: { position: "absolute", width: 28, height: 28, borderColor: "#F59E0B", borderWidth: 0 },
  cornerTL: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 8 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 8 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 8 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 8 },

  hintWrap: { position: "absolute", top: "50%", marginTop: VIEWFINDER / 2 + 18, left: 0, right: 0, alignItems: "center" },
  hintPill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: "rgba(10,14,26,0.78)", borderWidth: 1, borderColor: "rgba(245,158,11,0.4)" },
  hintTxt: { fontSize: 12, fontWeight: "700", color: "rgba(255,255,255,0.85)" },

  errorWrap: { position: "absolute", left: 18, right: 18, gap: 10, alignItems: "center" },
  errorPill: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, backgroundColor: "rgba(239,68,68,0.18)", borderWidth: 1, borderColor: "rgba(239,68,68,0.5)" },
  errorTxt: { flex: 1, fontSize: 12, fontWeight: "600", color: "#FCA5A5" },
  scanAgainBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: "rgba(245,158,11,0.22)", borderWidth: 1, borderColor: "rgba(245,158,11,0.55)" },
  scanAgainTxt: { fontSize: 13, fontWeight: "700", color: "#FCD34D" },
});
