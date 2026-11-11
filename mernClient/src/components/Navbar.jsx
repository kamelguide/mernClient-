import { useDispatch, useSelector } from "react-redux";
import { Link, NavLink } from "react-router-dom";
import { logout } from "../redux/authSlice";

export default function Navbar() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  return (
    <nav className="navbar" aria-label="Main navigation">
      <Link className="navbar-brand" to="/">
        RunClub Hub
      </Link>

      <div className="navbar-links">
        <NavLink to="/" end>
          Home
        </NavLink>
        <NavLink to="/events">Events</NavLink>
        {user ? (
          <>
            <NavLink to="/me">My space</NavLink>
            <span className="user-badge">Hi, {user.name}</span>
            <button type="button" onClick={() => dispatch(logout())}>
              Log out
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Log in</NavLink>
            <NavLink className="nav-cta" to="/register">
              Join the club
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}
