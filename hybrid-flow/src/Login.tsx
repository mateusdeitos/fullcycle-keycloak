import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { loginURL } from "./utils";

export function Login() {
  const { auth } = useAuth();

  useEffect(() => {
    if (!auth) {
      window.location.href = loginURL();
      return;
    }
  }, [auth]);

  if (auth) {
    return <Navigate to="/admin" />;
  }

  return <div>Loading...</div>;
}
