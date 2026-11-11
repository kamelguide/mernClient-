import { useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import EventCard from "../components/EventCard";
import EventForm from "../components/EventForm";
import { EVENT_TYPES } from "../constants";
import useLoadEvents from "../hooks/useLoadEvents";

const PERIODS = [
  { value: "all", label: "All dates" },
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
];

export default function EventsPage() {
  const { user } = useSelector((state) => state.auth);
  const { items: events, loading, error } = useLoadEvents();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const selectedType = searchParams.get("type") || "all";
  const period = searchParams.get("period") || "all";

  function updateFilter(name, value) {
    const params = new URLSearchParams(searchParams);
    if (value === "all") {
      params.delete(name);
    } else {
      params.set(name, value);
    }
    setSearchParams(params);
  }

  const now = new Date();
  const searchText = search.trim().toLowerCase();
  const filteredEvents = events.filter((event) => {
    const isUpcoming = new Date(event.date) >= now;
    const matchesType = selectedType === "all" || event.type === selectedType;
    const matchesPeriod =
      period === "all" || (period === "upcoming" && isUpcoming) || (period === "past" && !isUpcoming);
    const matchesSearch =
      !searchText ||
      event.title.toLowerCase().includes(searchText) ||
      event.location.toLowerCase().includes(searchText);

    return matchesType && matchesPeriod && matchesSearch;
  });

  const upcoming = filteredEvents.filter((event) => new Date(event.date) >= now);
  const past = filteredEvents
    .filter((event) => new Date(event.date) < now)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <main className="page-container">
      <header className="page-banner">
        <div>
          <p className="eyebrow">Club calendar</p>
          <h1>All events</h1>
          <p>Trainings, 10K races, trails and marathons organised by our members.</p>
        </div>
        {user && (
          <button type="button" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Close form" : "+ Create an event"}
          </button>
        )}
      </header>

      {user && showForm && <EventForm onCreated={() => setShowForm(false)} />}

      <section className="filters-panel" aria-label="Event filters">
        <label className="search-field">
          Search
          <input
            type="search"
            placeholder="Title or city: Tunis, Djerba, Tozeur..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>

        <div className="chip-row" role="group" aria-label="Sport type">
          <button
            type="button"
            className={`chip ${selectedType === "all" ? "active" : ""}`}
            onClick={() => updateFilter("type", "all")}
          >
            All sports
          </button>
          {EVENT_TYPES.map((type) => (
            <button
              type="button"
              key={type.value}
              className={`chip ${selectedType === type.value ? "active" : ""}`}
              onClick={() => updateFilter("type", type.value)}
            >
              {type.icon} {type.label}
            </button>
          ))}
        </div>

        <div className="chip-row" role="group" aria-label="Period">
          {PERIODS.map((item) => (
            <button
              type="button"
              key={item.value}
              className={`chip ${period === item.value ? "active" : ""}`}
              onClick={() => updateFilter("period", item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <p className="results-count">
        Showing {filteredEvents.length} of {events.length} club events
      </p>

      {loading && events.length === 0 && (
        <div className="event-grid">
          {[1, 2, 3, 4].map((key) => (
            <div className="event-skeleton" key={key} />
          ))}
        </div>
      )}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && filteredEvents.length === 0 && (
        <div className="empty-events">
          <span aria-hidden="true">🏃</span>
          <h3>No runs on this route yet</h3>
          <p>Try another filter, or check back soon for new club plans.</p>
        </div>
      )}

      {upcoming.length > 0 && (
        <section className="events-section">
          <div className="section-heading">
            <h2>Upcoming · {upcoming.length}</h2>
          </div>
          <div className="event-grid">
            {upcoming.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section className="events-section">
          <div className="section-heading">
            <h2>Past events · {past.length}</h2>
          </div>
          <div className="event-grid">
            {past.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
