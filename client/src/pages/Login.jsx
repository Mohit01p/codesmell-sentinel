import { useAuth } from "../context/AuthContext";

function Login() {
  const { login } = useAuth();

  return (
    <div className="login">
      <div className="login__scanline" />
      <div className="login__card">
        <div className="brand brand--center">
          <span className="brand__mark" />
          <span className="brand__name">CodeSmell Sentinel</span>
        </div>

        <p className="login__tagline">
          Automated pull request reviews. Static analysis catches what's
          provable; AI explains what it means.
        </p>

        <div className="login__log">
          <p><span className="mono muted">$</span> eslint --changed-lines</p>
          <p><span className="mono muted">$</span> semgrep --config=auto</p>
          <p><span className="tag tag--high" style={{ marginRight: "0.5rem" }}>high</span>hardcoded secret on line 14</p>
        </div>

        <button className="btn btn--primary btn--wide" onClick={login}>
          Login with GitHub
        </button>
      </div>
    </div>
  );
}

export default Login;