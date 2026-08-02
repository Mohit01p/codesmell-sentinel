import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import "./App.css";

function AppContent() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <p style={{ padding: "2rem" }}>Loading...</p>;
  }

  if (!user) {
    return <Login />;
  }

  return <Dashboard />;
}

function App() {
  return (
    <AuthProvider>
      <div style={{ fontFamily: "sans-serif" }}>
        <AppContent />
      </div>
    </AuthProvider>
  );
}

export default App;