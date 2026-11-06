import logo from "../../public/logo.png";
import { useCallback, useState } from "react";
import "./login.scss";
import { useAuthContext } from "../auth/AuthContext";

const Login = () => {
  const auth = useAuthContext();
  const login = auth?.login;
  const error = auth?.error;
  // const user = auth?.user;
  const loading = auth?.loading;
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (event: any) => {
    event.preventDefault();
    setSubmitted(true);
    if (login) login(userName, password, rememberMe);
  };

  const onChangeEvent = useCallback((checked: any) => {
    setRememberMe(checked)
  }, [])

  return (
    <>
      <div className="login-area">
        <br />
        <div id="app-img">
          <img src={logo} alt="Open Science Publications" />
        </div>
        <br />
        <form noValidate className="form-signin" onSubmit={handleSubmit}>
          <div className="form-floating">
            <input
              type="email"
              name="user_name"
              required
              placeholder="Email address"
              className={`form-control ${
                submitted && error ? "is-invalid" : ""
              }`}
              onChange={(e) => setUserName(e.target.value)}
            />
            <label>Email address</label>
          </div>
          <div className="form-floating mb-2">
            <div className="form-floating">
              <input
                type="password"
                name="password"
                required
                placeholder="Password"
                className={`form-control ${
                  submitted && error ? "is-invalid" : ""
                }`}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label>Password</label>
              <div className="invalid-feedback w100">{error}</div>
            </div>
          </div>

          <div className="checkbox mb-2">
            <label>
              <input type="checkbox" value="remember-me" checked={rememberMe} onChange={(e) => onChangeEvent(e.target.checked)} /> Remember me
            </label>
          </div>

          <div className="d-grid gap-2">
            <button className="btn btn-primary" type="submit">
              {submitted && loading && <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>}
              Login
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Login;
