import { useEffect, useState } from "react";
import { getComplaints, createComplaint } from "./api/complaints";
import LoginPage from "./pages/LoginPage";

const ORG_ID = "bank-a";

function App() {
  const [complaints, setComplaints] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!user) return; // only load complaints after login (simple behavior)
    getComplaints(ORG_ID).then(setComplaints);
  }, [user]);

  const addComplaint = async () => {
    const newItem = await createComplaint(ORG_ID, {
      title: "ATM swallowed card",
      description: "ATM at branch X",
      type: "banking",
    });
    setComplaints((prev) => [newItem, ...prev]);
  };

  if (!user) {
    // Show login page as the first screen
    return <LoginPage onLogin={(u) => setUser(u)} />;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Welcome, {user.username}</h1>
        <button
          className="text-sm text-gray-500 underline"
          onClick={() => setUser(null)}
        >
          Sign out
        </button>
      </div>

      <div className="mt-4">
        <button
          className="bg-black text-white rounded-xl px-4 py-2"
          onClick={addComplaint}
        >
          Add Complaint
        </button>
      </div>

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
