import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axiosClient from "../api/axiosClient";
import { setEvents, setEventsError, setEventsLoading } from "../redux/eventsSlice";

export default function useLoadEvents() {
  const dispatch = useDispatch();
  const eventsState = useSelector((state) => state.events);

  useEffect(() => {
    let isCurrent = true;

    async function loadEvents() {
      dispatch(setEventsError(null));
      dispatch(setEventsLoading(true));

      try {
        const response = await axiosClient.get("/events");
        if (isCurrent) {
          dispatch(setEvents(response.data));
        }
      } catch (requestError) {
        if (isCurrent) {
          dispatch(setEventsError(requestError.response?.data?.message || "Could not load events."));
        }
      }
    }

    loadEvents();

    return () => {
      isCurrent = false;
    };
  }, [dispatch]);

  return eventsState;
}
