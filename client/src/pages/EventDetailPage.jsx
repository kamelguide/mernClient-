import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import Countdown from "../components/Countdown";
import FeedbackForm from "../components/FeedbackForm";
import FeedbackList from "../components/FeedbackList";
import RegistrationPanel from "../components/RegistrationPanel";
import SpotsBar from "../components/SpotsBar";
import { formatDate, getEventImage } from "../constants";

export default function EventDetailPage() {
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCurrent = true;

    async function loadEvent() {
      setLoading(true);
      setError("");

      try {
        const [eventResponse, registrationsResponse] = await Promise.all([
          axiosClient.get(`/events/${id}`),
          axiosClient.get(`/events/${id}/registrations`),
        ]);

        if (isCurrent) {
          setEvent(eventResponse.data);
          setRegistrations(registrationsResponse.data);
        }
      } catch (requestError) {
        if (isCurrent) {
          setError(requestError.response?.data?.message || "Could not load this event.");
        }
      } finally {
        if (isCurrent) {
          setLoading(false);
        }
      }
    }

    loadEvent();

    return () => {
      isCurrent = false;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="page-container">
        <div className="detail-skeleton" />
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className="auth-page">
        <h1>Event not found</h1>
        <p role="alert">{error}</p>
        <Link to="/events">Back to events</Link>
      </main>
    );
  }

  const isUpcoming = new Date(event.date) >= new Date();
  const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(event.location + ", Tunisia")}&output=embed`;

  return (
    <main className="page-container">
      <Link className="back-link" to="/events">
        ← All events
      </Link>

      <header
        className="detail-hero"
        style={{ backgroundImage: `url(${getEventImage(event, 1600)})` }}
      >
        <div className="detail-hero-content">
          <div className="detail-badges">
            <span className={`event-status ${isUpcoming ? "upcoming" : "past"}`}>
              {isUpcoming ? "Upcoming" : "Past"}
            </span>
            <span className="event-type">{event.type}</span>
          </div>
          <h1>{event.title}</h1>
          <p>
            ◷ {formatDate(event.date, true)} · ⌖ {event.location}
          </p>
        </div>
      </header>

      <div className="detail-layout">
        <div className="detail-main">
          <section className="detail-card">
            <h2>About this run</h2>
            <div className="detail-facts">
              <div>
                <span>Distance</span>
                <strong>{event.distanceKm} km</strong>
              </div>
              <div>
                <span>Type</span>
                <strong className="capitalize">{event.type}</strong>
              </div>
              <div>
                <span>Organizer</span>
                <strong>{event.author?.name || "RunClub Hub"}</strong>
              </div>
              <div>
                <span>Rating</span>
                <strong>
                  ★ {event.averageRating ? `${event.averageRating} / 5` : "New"}
                </strong>
              </div>
            </div>
            <p className="detail-description">
              {event.description || "The organizer has not added a description yet."}
            </p>
          </section>

          <section className="detail-card">
            <h2>Meeting point</h2>
            <iframe
              className="detail-map"
              title={`Map of ${event.location}`}
              src={mapUrl}
              loading="lazy"
            />
          </section>

          <section className="detail-card">
            <h2>Registered runners · {registrations.length}</h2>
            {registrations.length === 0 ? (
              <p>No runners yet. Be the first one!</p>
            ) : (
              <table className="runners-table">
                <thead>
                  <tr>
                    <th>Bib</th>
                    <th>Runner</th>
                    <th>Category</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((registration) => (
                    <tr key={registration._id}>
                      <td>#{registration.bibNumber}</td>
                      <td>{registration.user?.name || "Club member"}</td>
                      <td>{registration.category === "men" ? "Men" : "Women"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <section className="detail-card">
            <h2>Reviews</h2>
            {!isUpcoming && user && <FeedbackForm eventId={event._id} />}
            {isUpcoming && <p>Reviews open after the race.</p>}
            <FeedbackList eventId={event._id} />
          </section>
        </div>

        <aside className="detail-sidebar">
          <div className="detail-card sticky-card">
            {isUpcoming && (
              <>
                <p className="eyebrow">Starts in</p>
                <Countdown date={event.date} />
              </>
            )}
            <SpotsBar registered={registrations.length} capacity={event.capacity || 50} />
            <RegistrationPanel
              event={event}
              registrations={registrations}
              onChange={setRegistrations}
            />
          </div>
        </aside>
      </div>
    </main>
  );
}
