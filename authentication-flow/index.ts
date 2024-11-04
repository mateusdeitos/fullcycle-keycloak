import express from "express";
import session from "express-session";
import crypto from "crypto";
import jwt from "jsonwebtoken";

type User = {
  id: string;
  email: string;
};

declare module "express-session" {
  interface SessionData {
    access_token: string;
    refresh_token: string;
    id_token: string;
    state: string;
    nonce: string;
    user: User;
  }
}

type ResponsePayload = {
  access_token: string;
  refresh_token: string;
  id_token: string;
};

const app = express();

const store = new session.MemoryStore();

const CLIENT_ID = "fullcycle-client";

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    store,
  })
);

app.get("/login", (req, res) => {
  const url = new URL(
    `http://localhost:8080/realms/master/protocol/openid-connect/auth`
  );

  // preventing csrf attacks
  const state = crypto.randomBytes(16).toString("base64");

  // preventing replay attacks
  const nonce = crypto.randomBytes(16).toString("base64");

  req.session.nonce = nonce;
  req.session.state = state;
  req.session.save();

  const query = new URLSearchParams();
  query.set("client_id", CLIENT_ID);
  query.set("redirect_uri", "http://localhost:3000/callback");
  query.set("response_type", "code");
  query.set("scope", "openid");
  query.set("nonce", nonce);
  query.set("state", state);
  url.search = query.toString();

  res.redirect(url.toString());
});

app.get("/logout", (req, res) => {
  const params = new URLSearchParams({
    id_token_hint: req.session.id_token as string,
    post_logout_redirect_uri: "http://localhost:3000/login",
  });

  req.session.destroy((err) => {
    console.error(err);
  });

  const url = new URL(
    `http://localhost:8080/realms/master/protocol/openid-connect/logout`
  );
  url.search = params.toString();
  res.redirect(url.toString());
});

app.get("/callback", async (req, res, next) => {
  if (req.session.user) {
    res.redirect("/admin");
    return;
  }

  if (req.query.state !== req.session.state) {
    res.status(401).json({ error: "Unauthenticated" });
    return;
  }

  try {
    const body = new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: "authorization_code",
      redirect_uri: "http://localhost:3000/callback",
      code: req.query.code as string,
      nonce: req.session.nonce as string, // avoiding replay attacks
    });

    const response = await fetch(
      `http://keycloak:8080/realms/master/protocol/openid-connect/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      }
    );

    const data = (await response.json()) as ResponsePayload;

    const keys: (keyof typeof data)[] = [
      "access_token",
      "refresh_token",
      "id_token",
    ];

    const invalid = keys.some((key) => {
      const payload = jwt.decode(data[key]);
      if (typeof payload === "string" || payload === null) {
        return true;
      }

      const invalid = payload!.nonce !== req.session.nonce;

      if (!invalid) {
        req.session[key] = data[key];
      }

      if (!invalid && key === "access_token") {
        req.session.user = payload as User;
      }

      return invalid;
    });

    if (invalid) {
      res.status(401).json({ error: "Unauthenticated" });
      return;
    }

    req.session.save();

    res.json(data);
  } catch (error) {
    next(error);
  }
});

app.get("/admin", (req, res) => {
  res.send(req.session.user);
});

app.listen(3000);
