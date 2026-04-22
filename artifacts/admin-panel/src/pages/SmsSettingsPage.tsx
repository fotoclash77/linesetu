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
    return () => {
      mounted = false;
    };
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

  return (
    <main className="max-w-3xl mx-auto px-6 py-8" data-testid="sms-settings-page">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">SMS Settings</h2>
        <p className="text-sm text-gray-500 mt-1">Master switch for OTP and booking SMS.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        {loading ? (
          <div className="text-sm text-gray-500">Loading…</div>
        ) : (
          <div className="flex items-center justify-between gap-6">
            <div>
              <div className="text-base font-semibold text-gray-900">
                SMS sending {enabled ? "enabled" : "disabled"}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {enabled
                  ? "OTP and booking confirmation SMS will be sent normally."
                  : "All SMS will be skipped by the server."}
              </div>
            </div>
            <button
              role="switch"
              aria-checked={enabled}
              onClick={() => toggle(!enabled)}
              disabled={saving}
              data-testid="sms-toggle"
              className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${enabled ? "bg-teal-600" : "bg-gray-300"}`}
            >
              <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`}
              />
            </button>
          </div>
        )}

        {error && <div className="mt-4 text-sm text-red-600">{error}</div>}
      </div>
    </main>
  );
}
