import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <p className="footer-brand">RunClub Hub</p>
          <p>
            The running club of Tunisia: weekly trainings, 10K races, trails and marathons for
            every pace.
          </p>
        </div>

        <div>
          <p className="footer-title">Explore</p>
          <Link to="/">Home</Link>
          <Link to="/events">All events</Link>
          <Link to="/events?period=upcoming">Upcoming runs</Link>
        </div>

        <div>
          <p className="footer-title">Contact</p>
          <span>Les Berges du Lac, Tunis</span>
          <span>contact@runclub.tn</span>
          <span>+216 71 000 000</span>
        </div>
      </div>
      <p className="footer-copy">© {new Date().getFullYear()} RunClub Hub · Every pace belongs.</p>
    </footer>
  );
}
