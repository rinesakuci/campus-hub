import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, Link, NavLink, Outlet } from "react-router-dom";
import "./index.css";
import { bootstrapAuth, getUser, api } from "./api";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Courses from "./pages/Courses.jsx";
import Events from "./pages/Events.jsx";
import Admin from "./pages/Admin.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";

function App(){
  const [u, setU] = React.useState(getUser());
  React.useEffect(()=>{ bootstrapAuth().then(()=> setU(getUser())); },[]);

  async function logout(){ await api.post("/auth/logout"); window.location.href = "/login"; }
  const nav=[{to:"/dashboard",label:"Dashboard"},{to:"/courses",label:"Courses"},{to:"/events",label:"Events"}];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow mb-6">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/dashboard" className="font-semibold">CampusHub</Link>
          <nav className="hidden md:flex gap-2 ml-4">
            {nav.map(n=> <NavLink key={n.to} to={n.to} className={({isActive})=>"px-3 py-1.5 rounded "+(isActive?"bg-slate-900 text-white":"hover:bg-slate-100")}>{n.label}</NavLink>)}
            <NavLink to="/admin" className={({isActive})=>"px-3 py-1.5 rounded "+(isActive?"bg-slate-900 text-white":"hover:bg-slate-100")}>Admin</NavLink>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            {u? (<>
              <span className="text-sm text-slate-600">{u.fullName} • {u.role}</span>
              <button onClick={logout} className="px-3 py-1.5 rounded border">Logout</button>
            </>):(
              <Link to="/login" className="px-3 py-1.5 rounded border">Login</Link>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4"><Outlet/></main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App/>}>
          <Route index element={<Navigate to="/dashboard"/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
          <Route path="/courses" element={<ProtectedRoute><Courses/></ProtectedRoute>} />
          <Route path="/events" element={<ProtectedRoute><Events/></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><Admin/></AdminRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);