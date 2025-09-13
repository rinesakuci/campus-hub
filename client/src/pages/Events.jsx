import React, { useEffect, useState } from "react";
import { api } from "../api";
import { format } from "date-fns";
import { FiPlus, FiCalendar } from "react-icons/fi";
import Modal from "../components/Modal";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = () => {
    api.get("/events").then(r => setEvents(r.data));
  };

  const createEvent = async (e) => {
    e.preventDefault();
    await api.post("/events", { title, date, location, description });
    setTitle(""); setDate(""); setLocation(""); setDescription("");
    setIsModalOpen(false);
    loadEvents();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Events</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-green-700 transition duration-300 flex items-center"
        >
          <FiPlus className="mr-2" />
          Add Event
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(event => (
          <div key={event.id} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
            <div className="flex items-center mb-4">
              <FiCalendar className="text-3xl text-green-500 mr-4" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{event.title}</h2>
                <p className="text-sm text-gray-500 font-medium">
                  {format(new Date(event.date), "EEE, MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
            </div>
            {event.location && (
              <p className="text-gray-600">Location: <span className="font-medium">{event.location}</span></p>
            )}
            {event.description && (
              <p className="text-gray-600 mt-2 line-clamp-3">{event.description}</p>
            )}
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={createEvent} className="space-y-4">
          <h3 className="text-2xl font-semibold mb-2">Create New Event</h3>
          <input
            className="w-full border-2 border-gray-200 p-3 rounded-lg focus:outline-none focus:border-green-500 transition-colors"
            placeholder="Event Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
          <input
            type="datetime-local"
            className="w-full border-2 border-gray-200 p-3 rounded-lg focus:outline-none focus:border-green-500 transition-colors"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
          />
          <input
            className="w-full border-2 border-gray-200 p-3 rounded-lg focus:outline-none focus:border-green-500 transition-colors"
            placeholder="Location (e.g., Room 101)"
            value={location}
            onChange={e => setLocation(e.target.value)}
          />
          <textarea
            className="w-full border-2 border-gray-200 p-3 rounded-lg focus:outline-none focus:border-green-500 transition-colors"
            placeholder="Description (optional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows="4"
          />
          <button
            type="submit"
            className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition duration-300"
          >
            Create Event
          </button>
        </form>
      </Modal>
    </div>
  );
}