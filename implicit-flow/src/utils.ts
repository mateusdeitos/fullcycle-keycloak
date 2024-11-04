import { decodeJwt } from "jose";
import Cookies from "js-cookie";

export function loginURL() {
  const nonce = Math.random().toString(36);
  const state = Math.random().toString(36);

  Cookies.set("nonce", nonce);
  Cookies.set("state", state);

  const params = new URLSearchParams({
    client_id: "fullcycle-client",
    redirect_uri: "http://localhost:3000/callback",
    response_type: "token id_token",
    scope: "openid",
    nonce,
    state,
  });

  const url = new URL(
    "http://localhost:8080/realms/master/protocol/openid-connect/auth"
  );

  url.search = params.toString();

  return url.toString();
}

export function logoutURL() {
  const params = new URLSearchParams({
    client_id: "fullcycle-client",
    id_token_hint: Cookies.get("id_token") as string,
    post_logout_redirect_uri: "http://localhost:3000/login",
  });

  const url = new URL(
    "http://localhost:8080/realms/master/protocol/openid-connect/logout"
  );

  url.search = params.toString();
  const urlStr = url.toString();

  handleLogoutCallback();

  return urlStr;
}

export function handleLoginCallback(
  accessToken: string,
  idToken: string,
  state: string
) {
  const stateCookie = Cookies.get("state");
  if (stateCookie !== state) {
    throw new Error("Invalid state");
  }

  let decodedAccessToken, decodedIdToken;
  try {
    decodedAccessToken = decodeJwt(accessToken);
    decodedIdToken = decodeJwt(idToken);
  } catch (error) {
    throw new Error("Invalid token");
  }

  if (decodedAccessToken.nonce !== Cookies.get("nonce")) {
    throw new Error("Invalid nonce");
  }

  if (decodedIdToken.nonce !== Cookies.get("nonce")) {
    throw new Error("Invalid nonce");
  }

  Cookies.set("access_token", accessToken);
  Cookies.set("id_token", idToken);

  return decodedAccessToken;
}

export function handleLogoutCallback() {
  Cookies.remove("access_token");
  Cookies.remove("id_token");
  Cookies.remove("nonce");
  Cookies.remove("state");
}

export function getAuth() {
  const token = Cookies.get("access_token");

  if (!token) {
    return null;
  }

  try {
    return decodeJwt(token);
  } catch (error) {
    console.error(error);
    return null;
  }
}
