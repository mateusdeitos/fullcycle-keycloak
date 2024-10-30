import express from "express";
import session from "express-session";
import crypto from "crypto";
import jwt from "jsonwebtoken";

type ResponsePayload = {
  access_token: string;
  refresh_token: string;
  id_token: string;
};

const app = express();

const store = new session.MemoryStore();

const CLIENT_ID = "fullcycle-client";
const NONCE = crypto.randomUUID();

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

  // @ts-expect-error - type mismatch
  req.session.nonce = NONCE;
  req.session.save();

  const query = new URLSearchParams();
  query.set("client_id", CLIENT_ID);
  query.set("redirect_uri", "http://localhost:3000/callback");
  query.set("response_type", "code");
  query.set("scope", "openid");
  query.set("nonce", NONCE);
  url.search = query.toString();

  res.redirect(url.toString());
});

app.get("/callback", async (req, res, next) => {
  try {
    const body = new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: "authorization_code",
      redirect_uri: "http://localhost:3000/callback",
      code: req.query.code as string,
      nonce: NONCE, // avoiding replay attacks
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
      // @ts-expect-error
      return payload!.nonce !== req.session.nonce;
    });

    if (invalid) {
      res.status(401).json({ error: "Unauthenticated" });
      return;
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

app.get("/admin", (req, res) => {
  // @ts-expect-error - type mismatch
  res.send(req.session.user);
});

app.listen(3000);
