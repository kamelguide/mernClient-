import { useState } from "react";
import { useDispatch } from "react-redux";
import axiosClient from "../api/axiosClient";
import { addFeedback } from "../redux/feedbackSlice";

export default function FeedbackForm({ eventId }) {
  const [text, setText] = useState("");
  const [rating, setRating] = useState("5");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const dispatch = useDispatch();

  // Send the review to the event-specific API route.
  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      const response = await axiosClient.post(`/events/${eventId}/feedbacks`, {
        text,
        rating: Number(rating),
      });
      dispatch(addFeedback(response.data));
      setText("");
      setRating("5");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not submit feedback.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="feedback-form" onSubmit={handleSubmit}>
      <h3>Add feedback</h3>
      {error && <p role="alert">{error}</p>}

      <label>
        Your feedback
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          required
        />
      </label>

      <label>
        Rating
        <select value={rating} onChange={(event) => setRating(event.target.value)}>
          <option value="5">5 - Excellent</option>
          <option value="4">4 - Good</option>
          <option value="3">3 - Okay</option>
          <option value="2">2 - Poor</option>
          <option value="1">1 - Bad</option>
        </select>
      </label>

      <button type="submit" disabled={saving}>
        {saving ? "Sending..." : "Send feedback"}
      </button>
    </form>
  );
}
