import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { exchangeCodeForToken } from "./utils";

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
    const code = params.get("code") as string;
    const state = params.get("state") as string;
    const id_token = params.get("id_token") as string;
    exchangeCodeForToken(code).then((data) => {
      login(data.access_token, data.refresh_token, id_token, state);
      navigate("/login", { replace: true });
    });
  }, [hash]);

  return <div>Loading...</div>;
}
