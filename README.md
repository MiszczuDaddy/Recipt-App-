# Receipt Scanner PWA

A single-page, installable web app for scanning physical receipts with your
phone camera. No login, no accounts — open a link and start scanning.

- 📷 Camera capture (multiple photos in a row)
- 🗓️ Auto-grouped by month/year based on scan date
- 🔍 Review screen — delete bad shots before anything is saved
- 📄 One-tap "Download PDF" per month (all that month's receipts compiled into a single PDF)
- 📲 Installs to your iOS/Android home screen like a real app (manifest + service worker)
- ☁️ Stores everything in its own dedicated Firebase project (Firestore + Storage)

Everything lives in a handful of static files — `index.html`, `manifest.json`,
`sw.js`, `firebase-config.js` — deployed as-is to GitHub Pages. No build step.

## 1. Create a dedicated Firebase project

This app must use its **own** Firebase project — do not reuse the
quoting-app or callout-tracker project.

1. Go to the [Firebase console](https://console.firebase.google.com/) → **Add project**.
   Name it something like `receipt-scanner` (the exact name doesn't matter).
   You can decline Google Analytics — it isn't needed.
2. In the project, click the **`</>`** (Web) icon to register a new web app
   (any nickname is fine, no hosting needed). Firebase will show you a
   `firebaseConfig` object — keep that tab open, you'll need it in step 4.
3. In the left sidebar, open **Build → Firestore Database → Create database**.
   Choose any region close to you, and start in **production mode** (we'll
   paste in our own open-access rules next).
4. In the left sidebar, open **Build → Storage → Get started**. Choose the
   same region, and use the default bucket.

## 2. Apply the open-access security rules

This app has no login, so both Firestore and Storage need rules that allow
open read/write. The rules for that are already in this repo:

- **Firestore** → console → Firestore Database → **Rules** tab → replace the
  contents with [`firestore.rules`](./firestore.rules) → **Publish**.
- **Storage** → console → Storage → **Rules** tab → replace the contents with
  [`storage.rules`](./storage.rules) → **Publish**.

> ⚠️ "Open access" means anyone who has the URL to your Firebase
> project's API (not just your app's URL) can read/write this data. That's
> intentional per the no-login requirement, but don't put anything sensitive
> in here, and don't share your Firebase config publicly beyond this app.

If you'd rather deploy rules from the command line, `firebase.json` is
already set up — just run:

```
npm install -g firebase-tools
firebase login
firebase use --add          # pick your new project
firebase deploy --only firestore:rules,storage
```

## 3. Allow the browser to fetch images for PDF export (CORS)

The "Download PDF" feature fetches each receipt image directly from Firebase
Storage in the browser, which requires the Storage bucket to allow
cross-origin `GET` requests. A ready-made config is in [`cors.json`](./cors.json).

Easiest way — no local install needed:

1. Open your Firebase project in the [Google Cloud Console](https://console.cloud.google.com/).
2. Click the **Activate Cloud Shell** icon (top right).
3. In Cloud Shell, create the file and apply it to your bucket (replace
   `YOUR_BUCKET_NAME` — find it in Firebase console → Storage → it looks like
   `your-project.appspot.com`):

   ```
   cat > cors.json <<'EOF'
   [
     { "origin": ["*"], "method": ["GET"], "maxAgeSeconds": 3600 }
   ]
   EOF
   gsutil cors set cors.json gs://YOUR_BUCKET_NAME
   ```

(If you have `gcloud`/`gsutil` installed locally, you can run the same
`gsutil cors set cors.json gs://YOUR_BUCKET_NAME` from this repo's checkout
instead.)

## 4. Fill in your Firebase config

Open [`firebase-config.js`](./firebase-config.js) and replace the placeholder
values with the `firebaseConfig` object Firebase showed you in step 1:

```js
window.RECEIPT_APP_FIREBASE_CONFIG = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

This is the public client config for a Firebase web app — it's safe to
commit. Access is controlled entirely by the security rules from step 2, not
by keeping this file secret.

Commit and push the change to the `main` branch.

## 5. Deploy to GitHub Pages

A GitHub Actions workflow ([`.github/workflows/deploy-pages.yml`](./.github/workflows/deploy-pages.yml))
is already set up to publish the site on every push to `main`. You just need
to flip one switch, once:

1. In this repository on GitHub, go to **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Push to `main` (or re-run the "Deploy to GitHub Pages" workflow from the
   **Actions** tab) — the workflow will publish the site and show you the
   live URL, something like `https://<your-username>.github.io/Recipt-App-/`.

## 6. Install it on your phone

Open the deployed URL on your phone:

- **iOS (Safari):** tap the Share icon → **Add to Home Screen**.
- **Android (Chrome):** tap the ⋮ menu → **Install app** (or **Add to Home screen**).

It'll launch full-screen, just like a native app, and works offline for
everything except scanning/saving new receipts (which need a connection to
reach Firebase).

## How it works

- **Scan**: tapping "Scan Receipts" opens your camera (`<input type="file"
  capture="environment" multiple>`). Each photo is downscaled and re-encoded
  as JPEG client-side, then added to a review batch — nothing is uploaded
  yet.
- **Review**: the batch screen shows a thumbnail grid with a ✕ on each photo
  so you can drop blurry or duplicate shots before anything is saved
  ("finalized").
- **Save**: tapping Save uploads each remaining photo to Firebase Storage
  under `receipts/<YYYY-MM>/<id>.jpg` and writes a matching Firestore
  document (`receipts` collection) with the month key, scan date, and image
  URL — grouped automatically by the month/year each photo was taken.
- **Months list**: the home screen reads all `receipts` documents and groups
  them by month, showing a count and a "Download PDF" shortcut for each.
- **Month view**: shows every receipt scanned that month as a thumbnail,
  with its own delete button (removes both the Firestore doc and the Storage
  file).
- **Download PDF**: pulls every image for that month and compiles them, one
  receipt per page, into a single PDF using [pdf-lib](https://pdf-lib.js.org/),
  then triggers a normal browser download.

## Local development

No build step — just serve the folder statically, e.g.:

```
npx serve .
```

Camera capture (`capture="environment"`) generally requires HTTPS or
`localhost`, so use `localhost` while testing locally.
