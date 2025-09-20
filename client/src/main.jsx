import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import "./index.css";
import { bootstrapAuth, getUser, api, clearAuth, subscribeAuth } from "./api";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Courses from "./pages/Courses.jsx";
import Events from "./pages/Events.jsx";
import Admin from "./pages/Admin.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import { FiLogOut } from "react-icons/fi";
import CourseDetails from "./pages/CourseDetails.jsx";

function App() {
  const [u, setU] = React.useState(getUser());
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const nav = useNavigate();

  React.useEffect(() => {
    bootstrapAuth().then(() => setU(getUser()));
    const unsub = subscribeAuth((nextUser) => setU(nextUser));
    return unsub;
  }, []);

  async function logout() {
    try { 
      await api.post("/auth/logout"); 
    } finally {
      clearAuth();
      setMobileMenuOpen(false);
      nav("/login", { replace: true });
    }
  }

  const menu = u ? [
    { to: "/dashboard", label: "Paneli" },
    { to: "/courses", label: "Lëndët" },
    { to: "/events", label: "Konsultime & Provime" },
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link 
              to={u ? "/dashboard" : "/login"} 
              className="flex items-center space-x-2 text-indigo-600 font-bold text-xl"
            >
              <span className="bg-indigo-600 text-white p-1.5 rounded-lg">CH</span>
              <span>CampusHub</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-1">
              {menu.map(n => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-indigo-100 text-indigo-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`
                  }
                >
                  {n.label}
                </NavLink>
              ))}
              {u && u.role === "admin" && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-purple-100 text-purple-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`
                  }
                >
                  Admin
                </NavLink>
              )}
            </nav>

            <div className="flex items-center">
              {u ? (
                <div className="flex items-center space-x-3">
                  <div className="hidden sm:flex flex-col text-right mr-2">
                    <span className="text-sm font-medium text-gray-800">{u.fullName}</span>
                    <span className="text-xs text-gray-500 capitalize">{u.role}</span>
                  </div>
                  <div className="relative h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-indigo-800 text-sm font-medium">
                      {u.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="hidden md:flex items-center cursor-pointer px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  >
                    <span className="mr-1.5"><FiLogOut/></span>
                    Logout
                  </button>
                  
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                  >
                    <svg
                      className="h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      {mobileMenuOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      )}
                    </svg>
                  </button>
                </div>
              ) : ''}
            </div>
          </div>
        </div>

        {mobileMenuOpen && u && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {menu.map(n => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                      isActive
                        ? "bg-indigo-100 text-indigo-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`
                  }
                >
                  <span className="mr-2">{n.icon}</span>
                  {n.label}
                </NavLink>
              ))}
              {u.role === "admin" && (
                <NavLink
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                      isActive
                        ? "bg-purple-100 text-purple-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`
                  }
                >
                  <span className="mr-2">⚙️</span>
                  Admin
                </NavLink>
              )}
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="flex items-center px-5">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-indigo-800 text-sm font-medium">
                      {u.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{u.fullName}</div>
                    <div className="text-sm font-medium text-gray-500 capitalize">{u.role}</div>
                  </div>
                </div>
                <div className="mt-3 px-2 space-y-1">
                  <button
                    onClick={logout}
                    className="flex items-center w-full cursor-pointer px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
                  >
                    <span className="mr-1.5"><FiLogOut/></span>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

function IndexRedirect() {
  return getUser()
    ? <Navigate to="/dashboard" replace />
    : <Navigate to="/login" replace />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<IndexRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
          <Route path="/courses/:id" element={<ProtectedRoute><CourseDetails/></ProtectedRoute>} />
          <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);