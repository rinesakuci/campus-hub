import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api";
import { format } from "date-fns";
import { FiCalendar, FiMapPin, FiMessageSquare, FiSend, FiArrowLeft } from "react-icons/fi";

export default function EventDetails() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const eventResponse = await api.get(`/events/${eventId}`);
        setEvent(eventResponse.data);

        const commentsResponse = await api.get(`/comments/event/${eventId}`);
        setComments(commentsResponse.data);
      } catch (error) {
        console.error("Failed to fetch event details:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [eventId]);

  async function handleAddComment(e) {
    e.preventDefault();
    if (!newComment.trim()) return;

    const commentData = {
      entityType: "event",
      entityId: Number(eventId),
      author: "Anonymous User",
      text: newComment,
    };
    await api.post("/comments", commentData);
    setNewComment("");
    const commentsResponse = await api.get(`/comments/event/${eventId}`);
    setComments(commentsResponse.data);
  }

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (!event) return <div className="text-center py-10">Event not found.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to={`/courses/${event.courseId}`} className="text-gray-600 hover:text-gray-900 flex items-center mb-6">
        <FiArrowLeft className="mr-2" />
        Back to Course
      </Link>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center mb-4">
          <FiCalendar className="text-4xl text-green-600 mr-4" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
            <p className="text-md font-medium text-gray-500">
              <span className="flex items-center mt-2">
                {format(new Date(event.date), "MMMM d, yyyy 'at' p")}
              </span>
            </p>
          </div>
        </div>
        {event.location && (
          <p className="text-gray-700 mt-2 flex items-center">
            <FiMapPin className="mr-1 text-lg text-gray-500" />
            Location: <span className="font-semibold ml-1">{event.location}</span>
          </p>
        )}
        {event.description && (
          <p className="text-gray-700 mt-4 leading-relaxed">{event.description}</p>
        )}
      </div>

      <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <FiMessageSquare className="mr-2 text-purple-600" /> Comments
        </h2>
        <form onSubmit={handleAddComment} className="mb-6 flex">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-grow border-2 border-gray-200 p-3 rounded-l-lg focus:outline-none focus:border-purple-500 transition-colors"
          />
          <button type="submit" className="bg-purple-600 text-white px-6 py-3 rounded-r-lg hover:bg-purple-700 transition duration-300">
            <FiSend />
          </button>
        </form>
        <ul className="space-y-4">
          {comments.length > 0 ? (
            comments.map(comment => (
              <li key={comment.id} className="bg-gray-50 p-4 rounded-lg border-l-4 border-purple-500">
                <p className="font-semibold">{comment.author}</p>
                <p className="text-sm text-gray-700 mt-1">{comment.text}</p>
                <p className="text-xs text-gray-400 mt-2">{format(new Date(comment.createdAt), "MMM d, yyyy")}</p>
              </li>
            ))
          ) : (
            <p className="text-gray-500 italic">No comments yet. Be the first to add one!</p>
          )}
        </ul>
      </div>
    </div>
  );
}