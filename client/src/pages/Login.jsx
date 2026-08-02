import { useAuth } from "../context/AuthContext";

function Login() {
  const { login } = useAuth();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        gap: "1.5rem",
      }}
    >
      <h1>CodeSmell Sentinel</h1>
      <p style={{ color: "#94a3b8" }}>
        Automated PR reviews powered by static analysis + AI.
      </p>
      <button
        onClick={login}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.75rem 1.5rem",
          fontSize: "1rem",
          borderRadius: "8px",
          border: "none",
          background: "#24292f",
          color: "white",
          cursor: "pointer",
        }}
      >
        Login with GitHub
      </button>
    </div>
  );
}

export default Login;