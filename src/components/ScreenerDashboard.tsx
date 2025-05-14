import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

type PairAlert = {
  id: string;
  name: string;
  level: "PDH" | "PDL" | "PWH" | "PWL" | "UNKNOWN";
};

const levelColors: Record<string, string> = {
  PDH: "bg-green-500",
  PDL: "bg-blue-500",
  PWH: "bg-yellow-500",
  PWL: "bg-red-500",
  UNKNOWN: "bg-gray-500",
};

export default function ScreenerDashboard() {
  const [alerts, setAlerts] = useState<PairAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "webhooks"), orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedAlerts: PairAlert[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedAlerts.push({
          id: doc.id,
          name: data.name,
          level: data.level,
        });
      });

      setAlerts(fetchedAlerts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold tracking-wide">
          🚀 Liquidity Screener
        </h1>
        <span className="text-gray-400">
          {loading
            ? "Loading..."
            : alerts.length === 0
            ? "No Events Yet"
            : `${alerts.length} ${alerts.length === 1 ? "Event" : "Events"}`}
        </span>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="bg-gray-800 rounded-lg shadow-lg p-6 transition transform hover:scale-105 hover:shadow-2xl duration-300 ease-in-out flex items-center justify-between"
          >
            <div>
              <div className="text-xl font-bold">{alert.name}</div>
              <div className="text-sm text-gray-400">Level Hit:</div>
              <span
                className={`inline-block mt-1 px-3 py-1 text-xs font-semibold text-white rounded-full ${
                  levelColors[alert.level] || "bg-gray-500"
                }`}
              >
                {alert.level}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
