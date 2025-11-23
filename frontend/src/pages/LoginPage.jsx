import { useState } from "react";

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e) => {
    e.preventDefault();
    // Placeholder: in a real app you'd call an auth API here.
    // We'll consider any non-empty username/password a success.
    if (username.trim() && password.trim()) {
      onLogin({ username });
    } else {
      alert("Enter username and password to continue");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        className="w-full max-w-sm bg-white p-8 rounded-xl shadow"
        onSubmit={submit}
      >
        <h2 className="text-2xl font-semibold mb-4">Login</h2>

        <label className="block mb-3">
          <span className="text-sm text-gray-600">Username</span>
          <input
            className="mt-1 block w-full rounded-md border-gray-200 shadow-sm px-3 py-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="your username"
          />
        </label>

        <label className="block mb-4">
          <span className="text-sm text-gray-600">Password</span>
          <input
            type="password"
            className="mt-1 block w-full rounded-md border-gray-200 shadow-sm px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
          />
        </label>

        <button
          type="submit"
          className="w-full bg-black text-white rounded-lg px-4 py-2"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
