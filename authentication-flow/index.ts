import express from "express";

const app = express();

const CLIENT_ID = "fullcycle-client";

app.get("/login", (req, res) => {
  const url = new URL(
    `http://localhost:8080/realms/master/protocol/openid-connect/auth`
  );

  const query = new URLSearchParams();
  query.set("client_id", CLIENT_ID);
  query.set("redirect_uri", "http://localhost:3000/callback");
  query.set("response_type", "code");
  query.set("scope", "openid");
  url.search = query.toString();

  res.redirect(url.toString());
});

app.get("/callback", async (req, res) => {
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: "authorization_code",
    redirect_uri: "http://localhost:3000/callback",
    code: req.query.code as string,
  });

  try {
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

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.send(error);
  }
});

app.listen(3000);
