import Constants from "expo-constants";
import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";

const APP_ID = "doctor-app";
const POLL_MS = 30_000;

function isOutdated(current: string, minimum: string): boolean {
  const parse = (v: string) => v.split(".").map((n) => parseInt(n, 10));
  const c = parse(current);
  const m = parse(minimum);
  for (let i = 0; i < 3; i++) {
    const cv = c[i] ?? 0;
    const mv = m[i] ?? 0;
    if (cv < mv) return true;
    if (cv > mv) return false;
  }
  return false;
}

export interface ForceUpdateState {
  required: boolean;
  message: string;
  storeUrl: string;
}

export function useForceUpdate(): ForceUpdateState {
  const [state, setState] = useState<ForceUpdateState>({
    required: false,
    message: "",
    storeUrl: "",
  });

  const check = useCallback(async () => {
    try {
      const domain = process.env.EXPO_PUBLIC_DOMAIN;
      if (!domain) return;
      const res = await fetch(`https://${domain}/api/app-config/${APP_ID}`);
      if (!res.ok) return;
      const data = await res.json();

      const currentVersion = Constants.expoConfig?.version ?? "1.0.0";
      const outdated =
        data.forceUpdate === true || isOutdated(currentVersion, data.minVersion ?? "1.0.0");

      const storeUrl: string =
        Platform.OS === "ios" ? (data.appStoreUrl ?? "") : (data.playStoreUrl ?? "");

      setState({
        required: outdated,
        message:
          data.updateMessage ||
          "A new version of the app is available. Please update to continue.",
        storeUrl,
      });
    } catch {
      // silent — never block the app on a network error
    }
  }, []);

  useEffect(() => {
    check();
    const id = setInterval(check, POLL_MS);
    return () => clearInterval(id);
  }, [check]);

  return state;
}
