import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export function Callback() {
  const { auth, login } = useAuth();
  const { hash } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth) {
      navigate("/login", { replace: true });
      return;
    }

    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get("access_token");
    const idToken = params.get("id_token");
    const state = params.get("state");

    if (accessToken && idToken && state) {
      login(accessToken, idToken, state);
    }

    navigate("/login", { replace: true });
  }, [hash]);

  return <div>Loading...</div>;
}
