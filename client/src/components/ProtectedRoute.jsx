import { Navigate } from "react-router-dom";
import { getUser } from "../api";
import { useState } from "react";
import { useEffect } from "react";

export default function ProtectedRoute({ children }){
  const [ready, setReady] = useState(false);
  const [u, setU] = useState(null);

  useEffect(()=>{
    setTimeout(()=> { setU(getUser()); setReady(true); }, 0);
  },[]);

  if(!ready) return null;
  if(!u) return <Navigate to="/login" replace/>;
  return children;
}
