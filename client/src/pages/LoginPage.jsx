import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import LoginForm from "../components/LoginForm";
import { loginSuccess } from "../redux/authSlice";

export default function LoginPage() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/" replace />;
  }

  async function handleLogin(email, password) {
    const response = await axiosClient.post("/auth/login", { email, password });
    dispatch(loginSuccess(response.data));
    navigate("/");
  }

  return (
    <main className="auth-page">
      <LoginForm onLogin={handleLogin} />
      <p>
        New to the club? <Link to="/register">Create an account</Link>
      </p>
    </main>
  );
}
