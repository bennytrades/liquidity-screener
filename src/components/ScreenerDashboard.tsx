import React, { useState, useEffect } from "react";

type PairAlert = {
  name: string;
  level: 'PDH' | 'PDL' | 'PWH' | 'PWL' | 'UNKNOWN';
  checked?: boolean;
};

const RESET_HOUR_EST = 17;
const STORAGE_KEY = "live_pairs";

const getResetTimestamp = () => {
  const now = new Date();
  const estNow = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  estNow.setHours(RESET_HOUR_EST, 0, 0, 0);
  if (now > estNow) estNow.setDate(estNow.getDate() + 1);
  return estNow.getTime();
};

export default function ScreenerDashboard() {
  const [alerts, setAlerts] = useState<PairAlert[]>([]);

  useEffect(() => {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

    const data: PairAlert[] = raw.map((item: any) =>
      typeof item === "string"
        ? { name: item, level: "UNKNOWN", checked: false }
        : { ...item, checked: item.checked ?? false }
    );

    const expiry = parseInt(localStorage.getItem("reset_time") || "0", 10);
    const now = Date.now();

    if (now > expiry) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      localStorage.setItem("reset_time", getResetTimestamp().toString());
      setAlerts([]);
    } else {
      setAlerts(data);
    }
  }, []);

  const handleWebhookData = (newAlert: PairAlert) => {
    const alreadyExists = alerts.some(
      (a) => a.name === newAlert.name && a.level === newAlert.level
    );
    if (!alreadyExists) {
      const updated = [...alerts, { ...newAlert, checked: false }];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setAlerts(updated);
    }
  };

  const toggleChecked = (index: number) => {
    const updated = [...alerts];
    updated[index].checked = !updated[index].checked;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setAlerts(updated);
  };

  const simulateWebhook = () => {
    const levels = ['PDH', 'PDL', 'PWH', 'PWL'];
    const testAlert: PairAlert = {
      name: `PAIR-${Math.floor(Math.random() * 1000)}`,
      level: levels[Math.floor(Math.random() * levels.length)] as PairAlert["level"]
    };
    handleWebhookData(testAlert);
  };

  const clearScreen = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    setAlerts([]);
  };

  const count = alerts.length;
  const heading = count === 0
    ? "No Liquidity Events Yet"
    : `${count} ${count === 1 ? "Tap" : "Taps"} Detected`;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-900 min-h-screen text-white">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">{heading}</h1>
        <div className="flex gap-2">
          <button
            onClick={simulateWebhook}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
          >
            Simulate Webhook
          </button>
          <button
            onClick={clearScreen}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
          >
            Clear All
          </button>
        </div>
      </div>

      {count === 0 ? (
        <p className="text-gray-400 italic">Waiting for liquidity sweeps…</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className="transition transform hover:scale-105 hover:shadow-xl bg-white border border-gray-300 text-black duration-300 ease-in-out p-4 flex justify-between items-center rounded"
            >
              <div>
                <div className="text-lg font-semibold">{alert.name}</div>
                <div className="text-sm text-gray-600">Level: {alert.level}</div>
              </div>
              <button
                onClick={() => toggleChecked(index)}
                className="text-2xl focus:outline-none"
                title="Mark as checked"
              >
                {alert.checked ? '❤️' : '🤍'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
