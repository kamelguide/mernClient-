import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import RegisterForm from "../components/RegisterForm";
import { loginSuccess } from "../redux/authSlice";

export default function RegisterPage() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/" replace />;
  }

  async function handleRegister(name, email, password) {
    const response = await axiosClient.post("/auth/register", { name, email, password });
    dispatch(loginSuccess(response.data));
    navigate("/");
  }

  return (
    <main className="auth-page">
      <RegisterForm onRegister={handleRegister} />
      <p>
        Already a member? <Link to="/login">Log in</Link>
      </p>
    </main>
  );
}
