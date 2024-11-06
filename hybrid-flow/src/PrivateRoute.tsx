import { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export function PrivateRoute({ children }: PropsWithChildren<{}>) {
  const { auth } = useAuth();

  if (!auth) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}
