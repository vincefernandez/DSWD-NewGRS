# NewGRS User System Review – Region III

Event site for the DSWD 4Ps *Grievance Redress System Workflow Automation (NewGRS) User System Review*, Region III, 3–6 November 2026. Built from the design mockup with Vite + Tailwind CSS (no framework runtime).

Sections: Home · Training Details (agenda accordion) · Materials (downloads) · Photos (carousel + gallery) · Register.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs ./dist
```

## Update the content

All editable content is in `src/data.js`:

- `event.registerUrl` – link to your registration form (Google Form, etc.). The "Register Here" button and the Register form use it.
- `event.driveUrl` – shared Google Drive folder for the "Download Views" button.
- `agenda` – days and topics.
- `materials` – file names and each file's Google Drive `href`.
- `photos` – put images in `src/assets/photos/` and list them; placeholders show until then.

Official DSWD / 4Ps logo files are not included. Add them to `src/assets/` and replace the text wordmark in `index.html`.

## Deploy (GitHub Pages)

1. Push this repo to GitHub on the `main` branch.
2. In the repo: **Settings → Pages → Source: GitHub Actions**.
3. Each push to `main` runs `.github/workflows/deploy.yml`, which builds and publishes `dist/`.
