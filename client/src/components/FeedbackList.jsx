import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axiosClient from "../api/axiosClient";
import {
  removeFeedback,
  setFeedback,
  setFeedbackError,
  setFeedbackLoading,
} from "../redux/feedbackSlice";

export default function FeedbackList({ eventId }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items, loading, error } = useSelector((state) => state.feedback);

  // Only display feedback that belongs to this event.
  const feedbacks = items.filter(
    (feedback) => String(feedback.event?._id || feedback.event) === eventId,
  );

  // Load this event's feedback when the list is first shown.
  useEffect(() => {
    let isCurrent = true;

    async function loadFeedback() {
      dispatch(setFeedbackLoading(true));
      dispatch(setFeedbackError(null));

      try {
        const response = await axiosClient.get(`/events/${eventId}/feedbacks`);
        if (isCurrent) {
          dispatch(setFeedback({ eventId, items: response.data }));
        }
      } catch (requestError) {
        if (isCurrent) {
          dispatch(
            setFeedbackError(
              requestError.response?.data?.message || "Could not load feedback.",
            ),
          );
        }
      }
    }

    loadFeedback();

    return () => {
      isCurrent = false;
    };
  }, [dispatch, eventId]);

  // Delete feedback only if the server confirms the signed-in member owns it.
  async function handleDelete(feedbackId) {
    try {
      await axiosClient.delete(`/feedbacks/${feedbackId}`);
      dispatch(removeFeedback(feedbackId));
    } catch (requestError) {
      dispatch(
        setFeedbackError(
          requestError.response?.data?.message || "Could not delete feedback.",
        ),
      );
    }
  }

  if (loading && feedbacks.length === 0) {
    return <p>Loading feedback...</p>;
  }

  return (
    <section className="feedback-list" aria-label="Event feedback">
      <h3>Member feedback</h3>
      {error && <p role="alert">{error}</p>}
      {feedbacks.length === 0 && !error && <p>No feedback yet.</p>}

      {feedbacks.map((feedback) => {
        const authorId = feedback.author?._id || feedback.author;
        const isOwner = user && String(authorId) === String(user.id);

        return (
          <article className="feedback-item" key={feedback._id}>
            <p>{feedback.text}</p>
            <p>
              Rating: {feedback.rating}/5 · By {feedback.author?.name || "Club member"}
            </p>
            {isOwner && (
              <button type="button" onClick={() => handleDelete(feedback._id)}>
                Delete feedback
              </button>
            )}
          </article>
        );
      })}
    </section>
  );
}
