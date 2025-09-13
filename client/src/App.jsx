import { Link, Outlet } from "react-router-dom";

export default function App() {
return (
  <div className="min-h-screen bg-gray-50">
    <nav className="bg-white shadow mb-6">
      <div className="max-w-5xl mx-auto px-4 py-3 flex gap-4">
        <Link to="/dashboard" className="font-semibold">CampusHub</Link>
        <Link to="/courses">Courses</Link>
        <Link to="/events">Events</Link>
      </div>
    </nav>
    <main className="max-w-5xl mx-auto px-4">
      <Outlet />
    </main>
  </div>
);
}