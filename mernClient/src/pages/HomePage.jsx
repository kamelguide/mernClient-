import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import Countdown from "../components/Countdown";
import EventCard from "../components/EventCard";
import { EVENT_TYPES, formatDate } from "../constants";
import useLoadEvents from "../hooks/useLoadEvents";

export default function HomePage() {
  const { user } = useSelector((state) => state.auth);
  const { items: events, loading, error } = useLoadEvents();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axiosClient
      .get("/stats")
      .then((response) => setStats(response.data))
      .catch(() => setStats(null));
  }, []);

  const now = new Date();
  const upcomingEvents = events.filter((event) => new Date(event.date) >= now);
  const nextEvent = upcomingEvents[0];

  return (
    <main className="page-container">
      <header className="page-heading">
        <div className="page-heading-copy">
          <p className="eyebrow">Good miles. Great people.</p>
          <h1>Your next finish line starts here.</h1>
          <p>Find a run, get your bib number, meet your people and make every mile count.</p>
          <div className="hero-actions">
            <Link className="hero-link" to="/events">
              Explore club events <span aria-hidden="true">→</span>
            </Link>
            {!user && (
              <Link className="hero-link hero-link-ghost" to="/register">
                Join the club
              </Link>
            )}
          </div>
        </div>

        {nextEvent ? (
          <Link className="next-event" to={`/events/${nextEvent._id}`}>
            <span className="next-event-label">Next run</span>
            <strong>{nextEvent.title}</strong>
            <span>
              {formatDate(nextEvent.date)} · {nextEvent.location}
            </span>
            <Countdown date={nextEvent.date} />
          </Link>
        ) : (
          <div className="hero-note">
            <span className="hero-note-icon" aria-hidden="true">✦</span>
            <span>Every pace belongs.</span>
          </div>
        )}
      </header>

      {stats && (
        <section className="stats-bar" aria-label="Club in numbers">
          <div>
            <strong>{stats.events}</strong>
            <span>Events</span>
          </div>
          <div>
            <strong>{stats.members}</strong>
            <span>Members</span>
          </div>
          <div>
            <strong>{stats.registrations}</strong>
            <span>Registrations</span>
          </div>
          <div>
            <strong>{stats.totalKm}</strong>
            <span>Kilometres</span>
          </div>
        </section>
      )}

      <section className="events-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Choose your style</p>
            <h2>Find your kind of run</h2>
          </div>
        </div>

        <div className="category-grid">
          {EVENT_TYPES.map((type) => (
            <Link className="category-tile" key={type.value} to={`/events?type=${type.value}`}>
              <span className="category-icon" aria-hidden="true">{type.icon}</span>
              <strong>{type.label}</strong>
              <span>
                {events.filter((event) => event.type === type.value).length} events
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="events-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Make a plan</p>
            <h2>Runs worth getting up for</h2>
            <p>The next club events open for registration.</p>
          </div>
          <Link className="see-all" to="/events?period=upcoming">
            See all events →
          </Link>
        </div>

        {loading && events.length === 0 && (
          <div className="event-grid">
            {[1, 2, 3, 4].map((key) => (
              <div className="event-skeleton" key={key} />
            ))}
          </div>
        )}
        {error && <p role="alert">{error}</p>}

        <div className="event-grid">
          {upcomingEvents.slice(0, 4).map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      </section>

      {!user && (
        <section className="cta-band">
          <div>
            <h2>Ready for your next race?</h2>
            <p>Create a free account to register, get your bib number and review events.</p>
          </div>
          <Link className="hero-link" to="/register">
            Create my account
          </Link>
        </section>
      )}
    </main>
  );
}
