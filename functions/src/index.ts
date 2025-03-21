import * as functions from "firebase-functions";
import * as logger from "firebase-functions/logger";
import AppleAuth, {AppleAuthConfig} from "apple-auth";

import express from "express";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";

const app = express();

app.use(bodyParser.urlencoded({extended: false}));

app.post("/sign_in_with_apple", (request, response) => {
  // Validate required query parameters
  if (!request.query.code || !request.query.firstName || !request.query.lastName) {
    const errorMessage = "Missing required parameters";
    logger.error(errorMessage, request.query);
    response.status(400).json({error: errorMessage});
  }

  const config: AppleAuthConfig = {
    client_id: request.query.useBundleId === "true" ? process.env.BUNDLE_ID! : process.env.SERVICE_ID!,
    team_id: process.env.TEAM_ID!,
    redirect_uri: process.env.REDIRECT_URI || "http://localhost",
    key_id: process.env.KEY_ID!,
    scope: "email",
  };

  const auth = new AppleAuth(
    config,
    process.env.KEY_CONTENTS!.replace(/\|/g, "\n"),
    "text"
  );

  auth.accessToken(request.query.code!.toString()).then((accessToken) => {
    const idToken = jwt.decode(accessToken.id_token) as { sub: string; email?: string };
    const userId = idToken.sub;
    const userEmail = idToken.email;
    const userName = `${request.query.firstName} ${request.query.lastName}`;
    const sessionID = `NEW SESSION ID for ${userId} / ${userEmail} / ${userName}`;
    logger.info(`sessionID = ${sessionID}`);

    response.status(200).json({sessionId: sessionID});
  }).catch((err) => {
    logger.error("Error processing Apple Sign-In", err);
    response.status(500).json({error: "Internal server error"});
  });
});

export const signInWithApple = functions.https.onRequest(app);
