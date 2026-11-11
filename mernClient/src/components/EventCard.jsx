import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { formatDate, getEventImage } from "../constants";
import { removeEvent } from "../redux/eventsSlice";
import { clearEventFeedback } from "../redux/feedbackSlice";
import SpotsBar from "./SpotsBar";

export default function EventCard({ event }) {
  const [error, setError] = useState("");
  const [imageUnavailable, setImageUnavailable] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const eventId = String(event._id);
  const isUpcoming = new Date(event.date) >= new Date();
  const authorId = event.author?._id || event.author;
  const isOwner = user && String(authorId) === String(user.id);

  async function handleDelete() {
    if (!window.confirm(`Delete "${event.title}" and all its reviews?`)) {
      return;
    }

    setError("");

    try {
      await axiosClient.delete(`/events/${eventId}`);
      dispatch(removeEvent(eventId));
      dispatch(clearEventFeedback(eventId));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not delete the event.");
    }
  }

  return (
    <article className="event-card">
      <Link
        to={`/events/${eventId}`}
        className={`event-card-image ${imageUnavailable ? "image-unavailable" : ""}`}
      >
        {!imageUnavailable && (
          <img
            src={getEventImage(event)}
            alt={`${event.title} poster`}
            loading="lazy"
            onError={() => setImageUnavailable(true)}
          />
        )}
        <span className={`event-status ${isUpcoming ? "upcoming" : "past"}`}>
          {isUpcoming ? "Upcoming" : "Past"}
        </span>
        <span className="event-type">{event.type}</span>
      </Link>

      <div className="event-card-content">
        <div className="event-card-heading">
          <h2>
            <Link to={`/events/${eventId}`}>{event.title}</Link>
          </h2>
          <span className="event-distance">{event.distanceKm} km</span>
        </div>

        <p className="event-meta">
          <span aria-hidden="true">⌖</span> {event.location}
        </p>
        <p className="event-meta">
          <span aria-hidden="true">◷</span> {formatDate(event.date)}
        </p>

        {isUpcoming && <SpotsBar registered={event.registeredCount || 0} capacity={event.capacity || 50} />}

        <div className="event-card-footer">
          <span className="event-organizer">
            With {event.author?.name || "your running club"}
          </span>
          <span className="event-rating">
            <span aria-hidden="true">★</span>{" "}
            {event.averageRating ? `${event.averageRating} (${event.feedbackCount})` : "New"}
          </span>
        </div>

        {error && <p role="alert">{error}</p>}

        <div className="event-actions">
          <Link className="button-link" to={`/events/${eventId}`}>
            {isUpcoming ? "Details & registration" : "Details & reviews"}
          </Link>

          {isOwner && (
            <button className="button-danger" type="button" onClick={handleDelete}>
              Delete
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
