import { createSlice } from "@reduxjs/toolkit";

// Read the event ID whether the API returned it as an ID or a populated object.
function getEventId(feedback) {
  return String(feedback.event?._id || feedback.event);
}

const feedbackSlice = createSlice({
  name: "feedback",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    // Replace only the selected event's feedback, keeping other event lists.
    setFeedback: (state, action) => {
      const { eventId, items } = action.payload;
      state.items = state.items.filter((feedback) => getEventId(feedback) !== eventId);
      state.items.push(...items);
      state.loading = false;
      state.error = null;
    },
    // Add newly submitted feedback to the top of the list.
    addFeedback: (state, action) => {
      state.items.unshift(action.payload);
    },
    // Remove feedback from the list by its MongoDB ID.
    removeFeedback: (state, action) => {
      state.items = state.items.filter((feedback) => feedback._id !== action.payload);
    },
    // Clear feedback when its event is deleted.
    clearEventFeedback: (state, action) => {
      state.items = state.items.filter((feedback) => getEventId(feedback) !== action.payload);
    },
    // Record whether the feedback request is currently running.
    setFeedbackLoading: (state, action) => {
      state.loading = action.payload;
    },
    // Save a feedback request error and stop its loading state.
    setFeedbackError: (state, action) => {
      state.error = action.payload;
      if (action.payload) {
        state.loading = false;
      }
    },
  },
});

export const {
  setFeedback,
  addFeedback,
  removeFeedback,
  clearEventFeedback,
  setFeedbackLoading,
  setFeedbackError,
} = feedbackSlice.actions;

export default feedbackSlice.reducer;
