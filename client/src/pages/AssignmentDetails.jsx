import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api";
import { format } from "date-fns";
import { FiBookOpen, FiClock, FiMessageSquare, FiSend, FiArrowLeft } from "react-icons/fi";

export default function AssignmentDetails() {
  const { assignmentId } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const assignmentResponse = await api.get(`/assignments/${assignmentId}`);
        setAssignment(assignmentResponse.data);

        const commentsResponse = await api.get(`/comments/assignment/${assignmentId}`);
        setComments(commentsResponse.data);
      } catch (error) {
        console.error("Failed to fetch assignment details:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [assignmentId]);

  async function handleAddComment(e) {
    e.preventDefault();
    if (!newComment.trim()) return;

    const commentData = {
      entityType: "assignment",
      entityId: Number(assignmentId),
      author: "Anonymous User",
      text: newComment,
    };
    await api.post("/comments", commentData);
    setNewComment("");
    const commentsResponse = await api.get(`/comments/assignment/${assignmentId}`);
    setComments(commentsResponse.data);
  }

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (!assignment) return <div className="text-center py-10">Assignment not found.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to={`/courses/${assignment.courseId}`} className="text-gray-600 hover:text-gray-900 flex items-center mb-6">
         <FiArrowLeft className="mr-2" />
         Back to Course
      </Link>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center mb-4">
          <FiBookOpen className="text-4xl text-blue-600 mr-4" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{assignment.title}</h1>
            <p className="text-md font-medium text-gray-500">
              <span className="flex items-center mt-2">
                <FiClock className="mr-1 text-sm" /> Due: {format(new Date(assignment.dueAt), "MMMM d, yyyy 'at' p")}
              </span>
            </p>
          </div>
        </div>
        {assignment.description && (
          <p className="text-gray-700 mt-4 leading-relaxed">{assignment.description}</p>
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