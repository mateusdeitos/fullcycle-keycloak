import { useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { logoutURL } from "./utils";

export function Logout() {
  const { auth, logout } = useAuth();

  useEffect(() => {
    if (!auth) {
      window.location.href = logoutURL();
      return;
    }

    logout();
  }, [auth]);

  return (
    <div>
      <h1>Logging you out...</h1>
    </div>
  );
}
