import { useAuth } from "./context/authContext";
import LoginPage from "./pages/LoginPage";

function App() {
  const { user } = useAuth();

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold">Welcome, {user.name}</h1>
    </div>
  );
}

export default App;
