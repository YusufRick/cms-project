import { useEffect, useState } from "react";
import { getComplaints, createComplaint } from "./api/complaints";

const ORG_ID = "bank-a";

function App() {
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    getComplaints(ORG_ID).then(setComplaints);
  }, []);

  const addComplaint = async () => {
    const newItem = await createComplaint(ORG_ID, {
      title: "ATM swallowed card",
      description: "ATM at branch X",
      type: "banking",
    });
    setComplaints((prev) => [newItem, ...prev]);
  };

  return (
    <div className="p-8">
      <button
        className="bg-black text-white rounded-xl px-4 py-2"
        onClick={addComplaint}
      >
        Add Complaint
      </button>

      <div className="mt-4 space-y-2">
        {complaints.map((c) => (
          <div key={c.id} className="p-4 bg-gray-100 rounded-xl">
            <div className="font-semibold">{c.title}</div>
            <div className="text-sm">{c.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
