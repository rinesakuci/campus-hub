import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api";
import { format } from "date-fns";
import { FiBookOpen, FiCalendar, FiArrowLeft } from "react-icons/fi";

export default function CourseDetails() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const courseResponse = await api.get(`/courses/${courseId}`);
        setCourse(courseResponse.data);

        const assignmentsResponse = await api.get(`/assignments/by-course/${courseId}`);
        setAssignments(assignmentsResponse.data);

        const eventsResponse = await api.get(`/events/by-course/${courseId}`);
        setEvents(eventsResponse.data);

      } catch (error) {
        console.error("Failed to fetch course details:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500 text-lg">
        Loading...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-500 text-lg">
        <p>Course not found.</p>
        <Link to="/courses" className="mt-4 text-purple-600 hover:underline">
          Go back to Courses
        </Link>
      </div>
    );
  }

  return ( 
    <div className="container mx-auto px-4 py-8">
      <Link to="/courses" className="text-gray-600 hover:text-gray-900 flex items-center mb-6">
        <FiArrowLeft className="mr-2" />
        Back to Courses
      </Link>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center mb-4">
          <FiBookOpen className="text-4xl text-purple-600 mr-4" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{course.name}</h1>
            <p className="text-xl font-medium text-gray-500">{course.code}</p>
          </div>
        </div>
        {course.description && (
          <p className="text-gray-700 mt-4 leading-relaxed">{course.description}</p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8 mt-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <FiBookOpen className="mr-2 text-blue-500" />
            Assignments
            </h2>
            <ul className="space-y-4">
            {assignments.length > 0 ? (
                assignments.map(assignment => (
                <li key={assignment.id} className="border-b pb-2 last:border-b-0">
                    <Link 
                    to={`/assignments/${assignment.id}`}
                    className="font-semibold text-lg text-blue-600 hover:text-blue-800 transition-colors duration-300 block"
                    >
                    {assignment.title}
                    </Link>
                    <p className="text-sm text-gray-600">Due: {format(new Date(assignment.dueAt), "MMM d, yyyy")}</p>
                </li>
                ))
            ) : (
                <p className="text-gray-500 italic">No assignments for this course.</p>
            )}
            </ul>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <FiCalendar className="mr-2 text-green-500" />
            Events
            </h2>
            <ul className="space-y-4">
            {events.length > 0 ? (
                events.map(event => (
                <li key={event.id} className="border-b pb-2 last:border-b-0">
                    <Link 
                    to={`/events/${event.id}`}
                    className="font-semibold text-lg text-green-600 hover:text-green-800 transition-colors duration-300 block"
                    >
                    {event.title}
                    </Link>
                    <p className="text-sm text-gray-600">
                    {format(new Date(event.date), "MMM d, yyyy")}
                    {event.location && ` at ${event.location}`}
                    </p>
                </li>
                ))
            ) : (
                <p className="text-gray-500 italic">No events for this course.</p>
            )}
            </ul>
        </div>
      </div>
    </div>
  );
}