import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "";

export default function SmsSettingsPage() {
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/sms-config`);
        const data = await res.json();
        if (mounted) setEnabled(data.enabled !== false);
      } catch (e: any) {
        if (mounted) setError(e?.message ?? "Failed to load");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  async function toggle(next: boolean) {
    setSaving(true);
    setError(null);
    const previous = enabled;
    setEnabled(next);
    try {
      const res = await fetch(`${API_BASE}/api/sms-config`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Save failed (${res.status})`);
      }
    } catch (e: any) {
      setEnabled(previous);
      setError(e?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="max-w-xl mx-auto px-6 py-8">
        <div className="text-sm text-gray-500">Loading…</div>
      </main>
    );
  }

  return (
    <main className="max-w-xl mx-auto px-6 py-8" data-testid="sms-settings-page">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">SMS Settings</h2>
        <p className="text-sm text-gray-500 mt-1">Master switch for OTP and booking SMS.</p>
      </div>

      {/* Big status banner */}
      <div
        data-testid="sms-status-banner"
        className={`rounded-2xl p-6 mb-6 text-center ${
          enabled
            ? "bg-green-50 border-2 border-green-400"
            : "bg-amber-50 border-2 border-amber-400"
        }`}
      >
        <div className={`text-4xl mb-2`}>{enabled ? "✅" : "🚫"}</div>
        <div className={`text-xl font-black ${enabled ? "text-green-800" : "text-amber-800"}`}>
          SMS is {enabled ? "ON" : "OFF"}
        </div>
        <div className={`text-sm mt-1 ${enabled ? "text-green-700" : "text-amber-700"}`}>
          {enabled
            ? "Real SMS will be sent to users"
            : "No SMS will be sent. OTP appears on screen instead."}
        </div>
      </div>

      {/* Turn ON button */}
      {!enabled && (
        <button
          data-testid="sms-turn-on-btn"
          onClick={() => toggle(true)}
          disabled={saving}
          className="w-full py-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-lg mb-3 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving…" : "Turn SMS ON"}
        </button>
      )}

      {/* Turn OFF button */}
      {enabled && (
        <button
          data-testid="sms-turn-off-btn"
          onClick={() => toggle(false)}
          disabled={saving}
          className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-lg mb-3 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving…" : "Turn SMS OFF"}
        </button>
      )}

      {error && (
        <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      <p className="mt-4 text-xs text-gray-400 text-center">
        Changes apply within 10 seconds on the server.
      </p>
    </main>
  );
}
