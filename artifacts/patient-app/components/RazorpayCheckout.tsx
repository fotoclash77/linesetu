import React from "react";
import { Modal, View, StyleSheet, Platform, Pressable, Text, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";
import { Feather } from "@expo/vector-icons";

interface RazorpayOptions {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefillName?: string;
  prefillContact?: string;
  prefillEmail?: string;
}

interface Props {
  visible: boolean;
  options: RazorpayOptions;
  onSuccess: (paymentId: string, orderId: string, signature: string) => void;
  onFailure: (error: string) => void;
  onDismiss: () => void;
}

export default function RazorpayCheckout({ visible, options, onSuccess, onFailure, onDismiss }: Props) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0A0E1A; display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: -apple-system, sans-serif; }
    .loading { color: #818CF8; font-size: 16px; text-align: center; }
  </style>
</head>
<body>
  <div class="loading">Opening Razorpay...</div>
  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  <script>
    window.onload = function() {
      var options = {
        key: "${options.keyId}",
        amount: ${options.amount},
        currency: "${options.currency}",
        order_id: "${options.orderId}",
        name: "${options.name}",
        description: "${options.description}",
        prefill: {
          name: "${options.prefillName ?? ""}",
          contact: "${options.prefillContact ?? ""}",
          email: "${options.prefillEmail ?? ""}"
        },
        theme: { color: "#4F46E5" },
        modal: { backdropclose: false, escape: false },
        handler: function(response) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: "success",
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature
          }));
        }
      };
      var rzp = new Razorpay(options);
      rzp.on("payment.failed", function(response) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: "failure",
          error: response.error.description
        }));
      });
      rzp.open();
    };
  </script>
</body>
</html>`;

  function handleMessage(event: any) {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "success") {
        onSuccess(data.paymentId, data.orderId, data.signature);
      } else if (data.type === "failure") {
        onFailure(data.error ?? "Payment failed");
      }
    } catch {}
  }

  if (Platform.OS === "web") {
    return null;
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onDismiss}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Text style={styles.topBarTitle}>Secure Payment</Text>
          <Pressable onPress={onDismiss} style={styles.closeBtn}>
            <Feather name="x" size={18} color="rgba(255,255,255,0.7)" />
          </Pressable>
        </View>
        <WebView
          source={{ html }}
          onMessage={handleMessage}
          style={{ flex: 1, backgroundColor: "#0A0E1A" }}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color="#4F46E5" />
              <Text style={styles.loadingTxt}>Loading payment gateway...</Text>
            </View>
          )}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0E1A" },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18, paddingTop: 50, paddingBottom: 12, backgroundColor: "#0A0E1A", borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.07)" },
  topBarTitle: { fontSize: 15, fontWeight: "700", color: "#FFF" },
  closeBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" },
  loading: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center", backgroundColor: "#0A0E1A", gap: 12 },
  loadingTxt: { fontSize: 13, color: "rgba(255,255,255,0.5)" },
});
