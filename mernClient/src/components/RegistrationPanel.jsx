import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { updateEvent } from "../redux/eventsSlice";

export default function RegistrationPanel({ event, registrations, onChange }) {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [category, setCategory] = useState("men");
  const [tshirtSize, setTshirtSize] = useState("M");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const isUpcoming = new Date(event.date) >= new Date();
  const myRegistration = user
    ? registrations.find((registration) => String(registration.user?._id) === String(user.id))
    : null;
  const isFull = registrations.length >= event.capacity;

  function saveRegistrations(nextRegistrations) {
    onChange(nextRegistrations);
    dispatch(updateEvent({ _id: event._id, registeredCount: nextRegistrations.length }));
  }

  async function handleRegister(formEvent) {
    formEvent.preventDefault();
    setError("");
    setSaving(true);

    try {
      const response = await axiosClient.post(`/events/${event._id}/registrations`, {
        category,
        tshirtSize,
      });
      saveRegistrations([...registrations, response.data]);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not register.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCancel() {
    if (!window.confirm("Cancel your registration and free your bib number?")) {
      return;
    }

    setError("");
    setSaving(true);

    try {
      await axiosClient.delete(`/events/${event._id}/registrations`);
      saveRegistrations(registrations.filter((registration) => registration._id !== myRegistration._id));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not cancel the registration.");
    } finally {
      setSaving(false);
    }
  }

  if (myRegistration) {
    return (
      <div className="bib-card">
        <span className="bib-label">You are registered</span>
        <strong className="bib-number">#{myRegistration.bibNumber}</strong>
        <span>
          {myRegistration.category === "men" ? "Men" : "Women"} · T-shirt {myRegistration.tshirtSize}
        </span>
        {error && <p role="alert">{error}</p>}
        {isUpcoming && (
          <button className="button-danger" type="button" onClick={handleCancel} disabled={saving}>
            Cancel my registration
          </button>
        )}
      </div>
    );
  }

  if (!isUpcoming) {
    return <p className="panel-note">Registrations are closed: this event has already taken place.</p>;
  }

  if (isFull) {
    return <p className="panel-note">This event is sold out. Check the other club events!</p>;
  }

  if (!user) {
    return (
      <div className="panel-note">
        <p>Log in to register and get your bib number.</p>
        <Link className="button-link" to="/login">
          Log in to register
        </Link>
      </div>
    );
  }

  return (
    <form className="registration-form" onSubmit={handleRegister}>
      <h3>Register now</h3>
      {error && <p role="alert">{error}</p>}

      <label>
        Category
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="men">Men</option>
          <option value="women">Women</option>
        </select>
      </label>

      <label>
        T-shirt size
        <select value={tshirtSize} onChange={(e) => setTshirtSize(e.target.value)}>
          {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>

      <button type="submit" disabled={saving}>
        {saving ? "Registering..." : "Get my bib number"}
      </button>
    </form>
  );
}
