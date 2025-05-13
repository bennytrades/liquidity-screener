import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

type PairAlert = {
  id: string;
  name: string;
  level: "PDH" | "PDL" | "PWH" | "PWL" | "UNKNOWN";
  checked?: boolean;
};

export default function ScreenerDashboard() {
  const [alerts, setAlerts] = useState<PairAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(collection(db, "webhooks"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedAlerts: PairAlert[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedAlerts.push({
            id: doc.id,
            name: data.name,
            level: data.level,
            checked: false,
          });
        });

        setAlerts(fetchedAlerts);
      } catch (error) {
        console.error("❌ Error fetching data from Firestore:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleChecked = (index: number) => {
    const updated = [...alerts];
    updated[index].checked = !updated[index].checked;
    setAlerts(updated);
  };

  const count = alerts.length;
  const heading =
    count === 0 ? "No Liquidity Events Yet" : `${count} ${count === 1 ? "Tap" : "Taps"} Detected`;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-900 min-h-screen text-white">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">{heading}</h1>
      </div>

      {loading ? (
        <p className="text-gray-400 italic">Loading data from Firestore...</p>
      ) : count === 0 ? (
        <p className="text-gray-400 italic">Waiting for liquidity sweeps…</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alerts.map((alert, index) => (
            <div
              key={alert.id}
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
                {alert.checked ? "❤️" : "🤍"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
