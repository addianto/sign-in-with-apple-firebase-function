# Sign-in with Apple Firebase Function

TBD.

## Environment Variables

To run the `signInWithApple` function and the callback function for Android,
you need to set the following environment variables in your Firebase project:

- `ANDROID_PACKAGE_IDENTIFIER`: The package identifier for your Android app.
- `BUNDLE_ID`: The bundle identifier for your iOS app (used when `useBundleId` is `true`).
- `SERVICE_ID`: The service identifier for your app (used when `useBundleId` is `false`).
- `TEAM_ID`: Your Apple Developer Team ID.
- `REDIRECT_URI`: The redirect URI for your app. Defaults to `http://localhost` if not provided.
- `KEY_ID`: The key ID for your Apple Developer AuthKey.
- `KEY_CONTENTS`: The contents of your Apple Developer AuthKey, with newlines replaced by `|`.

> TODO: Verify `KEY_ID` and `KEY_CONTENTS` description by perusing the documentation at Apple Developer portal.

## Acknowledgements

- [`flutter-sign-in-with-apple-examples` by HenriBeck](https://preview.glitch.com/project/flutter-sign-in-with-apple-example) for the original JavaScript code.
  The original code is licensed under the MIT license.