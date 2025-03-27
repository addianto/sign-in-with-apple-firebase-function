import * as functions from "firebase-functions";
import * as logger from "firebase-functions/logger";
import AppleAuth, {AppleAuthConfig} from "apple-auth";

import express, {Response} from "express";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";

const app = express();

app.use(bodyParser.urlencoded({extended: false}));

app.post("/callback", (request, response) => {
  // eslint-disable-next-line max-len
  const redirect = `intent://callback?${new URLSearchParams(request.body).toString()}#Intent;package=${process.env.ANDROID_PACKAGE_IDENTIFIER};scheme=signinwithapple;end`;

  logger.info(`Redirecting to ${redirect}`);

  response.redirect(307, redirect);
});

app.post("/", (request, response) => {
  // Validate required query parameters
  if (!request.query.code ||
    !request.query.firstName ||
    !request.query.lastName) {
    _errorResponse(response, "Missing required parameters");
    throw new Error();
  }

  if (!process.env.BUNDLE_ID || !process.env.SERVICE_ID) {
    // eslint-disable-next-line max-len
    _errorResponse(response, "BUNDLE_ID or SERVICE_ID environment variable is required");
    throw new Error();
  }

  if (!process.env.TEAM_ID) {
    _errorResponse(response, "TEAM_ID environment variable is required");
    throw new Error();
  }

  if (!process.env.KEY_ID) {
    _errorResponse(response, "KEY_ID environment variable is required");
    throw new Error();
  }

  if (!process.env.KEY_CONTENTS) {
    _errorResponse(response, "KEY_CONTENTS environment variable is required");
    throw new Error();
  }

  const config: AppleAuthConfig = {
    client_id: request.query.useBundleId === "true" ?
      process.env.BUNDLE_ID : process.env.SERVICE_ID,
    team_id: process.env.TEAM_ID,
    redirect_uri: process.env.REDIRECT_URI || "http://localhost",
    key_id: process.env.KEY_ID,
    scope: "email",
  };

  const auth = new AppleAuth(
    config,
    process.env.KEY_CONTENTS.replace(/\|/g, "\n"),
    "text"
  );

  if (!request.query.code) {
    _errorResponse(response, "The code parameter is missing");
    throw new Error();
  }

  // TODO: Use async/await
  auth.accessToken(request.query.code.toString()).then((accessToken) => {
    const idToken = jwt.decode(accessToken.id_token) as {
      sub: string; email?: string
    };
    const userId = idToken.sub;
    const userEmail = idToken.email;
    const userName = `${request.query.firstName} ${request.query.lastName}`;
    // eslint-disable-next-line max-len
    const sessionID = `NEW SESSION ID for ${userId} / ${userEmail} / ${userName}`;
    logger.info(`sessionID = ${sessionID}`);

    response.status(200).json({sessionId: sessionID});
  }).catch((err) => {
    logger.error("Error processing Apple Sign-In", err);
    response.status(500).json({error: "Internal server error"});
  });
});

const _errorResponse = (response: Response, message: string) => {
  logger.error(message);
  response.status(400).json({error: message});
};

export const signInWithApple = functions.https.onRequest(app);
