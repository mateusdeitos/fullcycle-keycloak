import express from "express";
import session from "express-session";

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

const middlewareIsAuth = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
};

const app = express();
app.use(express.urlencoded({ extended: true }));
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
  if (req.session.user) {
    return res.redirect("/admin");
  }

  res.sendFile(__dirname + "/login.html");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const url = new URL(
    `http://keycloak:8080/realms/master/protocol/openid-connect/token`
  );

  const params = new URLSearchParams({
    password,
    username,
    grant_type: "password",
    client_id: CLIENT_ID,
    scope: "openid",
  });

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  const result = await response.json();
  req.session.user = result;
  req.session.access_token = result.access_token;
  req.session.refresh_token = result.refresh_token;
  req.session.id_token = result.id_token;
  req.session.save();

  res.redirect("/admin");
});

app.get("/logout", async (req, res) => {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    token: req.session.refresh_token as string,
  });

  await fetch(
    `http://keycloak:8080/realms/master/protocol/openid-connect/revoke`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    }
  );

  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session", err);
    }
  });

  res.redirect("/login");
});

app.get("/admin", middlewareIsAuth, (req, res) => {
  res.send(req.session.user);
});

app.listen(3000);
