import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, Navigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import EventCard from "../components/EventCard";
import { formatDate } from "../constants";
import useLoadEvents from "../hooks/useLoadEvents";

function RegistrationRow({ registration }) {
  const { event } = registration;

  return (
    <Link className="my-race" to={`/events/${event._id}`}>
      <span className="my-race-bib">#{registration.bibNumber}</span>
      <span className="my-race-info">
        <strong>{event.title}</strong>
        <span>
          {formatDate(event.date)} · {event.location}
        </span>
      </span>
      <span className="event-distance">{event.distanceKm} km</span>
    </Link>
  );
}

export default function MyPage() {
  const { user } = useSelector((state) => state.auth);
  const { items: events } = useLoadEvents();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      return;
    }

    axiosClient
      .get("/registrations/me")
      .then((response) => setRegistrations(response.data))
      .catch((requestError) =>
        setError(requestError.response?.data?.message || "Could not load your races."),
      )
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const now = new Date();
  const upcoming = registrations
    .filter((registration) => new Date(registration.event.date) >= now)
    .sort((a, b) => new Date(a.event.date) - new Date(b.event.date));
  const past = registrations.filter((registration) => new Date(registration.event.date) < now);
  const totalKm = past.reduce((total, registration) => total + registration.event.distanceKm, 0);
  const myEvents = events.filter(
    (event) => String(event.author?._id || event.author) === String(user.id),
  );

  return (
    <main className="page-container">
      <header className="page-banner">
        <div>
          <p className="eyebrow">My space</p>
          <h1>Hi, {user.name}</h1>
          <p>{user.email}</p>
        </div>
        <div className="profile-stats">
          <div>
            <strong>{upcoming.length}</strong>
            <span>Upcoming</span>
          </div>
          <div>
            <strong>{past.length}</strong>
            <span>Finished</span>
          </div>
          <div>
            <strong>{Math.round(totalKm * 10) / 10}</strong>
            <span>km run</span>
          </div>
        </div>
      </header>

      {loading && <p>Loading your races...</p>}
      {error && <p role="alert">{error}</p>}

      <section className="events-section">
        <div className="section-heading">
          <h2>My next races</h2>
        </div>
        {upcoming.length === 0 && !loading ? (
          <p>
            No registration yet. <Link to="/events?period=upcoming">Find your next run</Link>
          </p>
        ) : (
          <div className="my-races">
            {upcoming.map((registration) => (
              <RegistrationRow key={registration._id} registration={registration} />
            ))}
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section className="events-section">
          <div className="section-heading">
            <h2>Finished races</h2>
          </div>
          <div className="my-races">
            {past.map((registration) => (
              <RegistrationRow key={registration._id} registration={registration} />
            ))}
          </div>
        </section>
      )}

      <section className="events-section">
        <div className="section-heading">
          <h2>Events I organise · {myEvents.length}</h2>
          <Link className="see-all" to="/events">
            + Create an event
          </Link>
        </div>
        <div className="event-grid">
          {myEvents.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      </section>
    </main>
  );
}
