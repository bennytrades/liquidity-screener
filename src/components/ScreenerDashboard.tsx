import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

type PairAlert = {
  id: string;
  name: string;
  level: "PDH" | "PDL" | "PWH" | "PWL" | "UNKNOWN";
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

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-900 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-4">
        {loading
          ? "Loading Data..."
          : alerts.length === 0
          ? "No Liquidity Events Yet"
          : `${alerts.length} ${alerts.length === 1 ? "Tap" : "Taps"} Detected`}
      </h1>

      {alerts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="transition transform hover:scale-105 hover:shadow-xl bg-white border border-gray-300 text-black duration-300 ease-in-out p-4 flex justify-between items-center rounded"
            >
              <div>
                <div className="text-lg font-semibold">{alert.name}</div>
                <div className="text-sm text-gray-600">Level: {alert.level}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
