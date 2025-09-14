import { Navigate } from "react-router-dom";
import { getUser } from "../api";

export default function AdminRoute({ children }){
  const u = getUser();
  if(!u) return <Navigate to="/login" replace/>;
  if(u.role !== "admin") return <Navigate to="/dashboard" replace/>;
  return children;
}