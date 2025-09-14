import { Navigate } from "react-router-dom";
import { getUser } from "../api";

export default function ProtectedRoute({ children }){
  const u = getUser();
  if(!u) return <Navigate to="/login" replace/>;
  return children;
}