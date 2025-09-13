
import React, { useEffect, useState } from "react";
import { api } from "../api";
import { format } from "date-fns";
import { FiCalendar, FiBookOpen } from "react-icons/fi";

import DashboardCard from "../components/DashboardCard";

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    api.get("/events?_sort=date&_order=asc&_limit=3").then(r => setEvents(r.data));
    api.get("/assignments?_sort=dueAt&_order=asc&_limit=3").then(r => setAssignments(r.data));
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-gray-800">Welcome to Campus Hub! 👋</h1>
        <p className="text-lg text-gray-500 mt-2">Your central place for academic life.</p>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        <DashboardCard title="Upcoming Events" icon={<FiCalendar className="text-3xl text-purple-500" />}>
          {events.length > 0 ? (
            <ul className="space-y-4">
              {events.map(event => (
                <li key={event.id} className="p-4 bg-gray-50 rounded-lg transition-transform transform hover:scale-105">
                  <h3 className="font-semibold text-lg">{event.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">{format(new Date(event.date), "MMM d, yyyy")}</span> at{" "}
                    <span className="font-medium">{event.location}</span>
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No upcoming events.</p>
          )}
        </DashboardCard>

        <DashboardCard title="Recent Assignments" icon={<FiBookOpen className="text-3xl text-blue-500" />}>
          {assignments.length > 0 ? (
            <ul className="space-y-4">
              {assignments.map(assignment => (
                <li key={assignment.id} className="p-4 bg-gray-50 rounded-lg transition-transform transform hover:scale-105">
                  <h3 className="font-semibold text-lg">{assignment.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Due: <span className="font-medium">{format(new Date(assignment.dueAt), "MMM d, yyyy")}</span>
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No recent assignments.</p>
          )}
        </DashboardCard>
      </div>
    </div>
  );
}