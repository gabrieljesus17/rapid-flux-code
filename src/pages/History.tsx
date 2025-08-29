import { useState, useEffect } from "react";

interface HistoryEntry {
  text: string;
  time: string;
}

const History = () => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const storedHistory = JSON.parse(
      localStorage.getItem("aviator_history") || "[]"
    );
    setHistory(storedHistory);
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md">
      <h2 className="text-4xl font-bold mb-4">Histórico de Previsões</h2>
      {history.length > 0 ? (
        <ul className="w-full space-y-4">
          {history.map((entry, index) => (
            <li
              key={index}
              className="bg-gray-800 p-4 rounded-lg flex justify-between items-center"
            >
              <span className="text-xl">{entry.text}</span>
              <span className="text-md text-gray-400">{entry.time}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xl text-gray-400">Nenhuma previsão gerada ainda.</p>
      )}
    </div>
  );
};

export default History;