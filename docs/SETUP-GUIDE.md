# Registration + Email Login Setup Guide

This connects the NewGRS site to a **Google Sheet** that acts as the database.

- **Register** adds a row to the sheet (duplicate emails are rejected).
- **Sign in** sends a 6-digit code to a registered email. No passwords are stored anywhere.
- **Materials** (your download links) are only sent to the browser after a successful sign-in.

```
Website (GitHub Pages)  ──►  Google Apps Script (web app)  ──►  Google Sheet
   register / sign in            checks + sends code               Registrations, Materials
```

You need: a Google account (a DSWD Google Workspace account is best, see "Limits" below) and edit access to the GitHub repo.

---

## Part 1 – Create the Google Sheet and backend

1. Go to **https://sheets.new** and name the file `NewGRS Registrations`.
2. Open **Extensions → Apps Script**. A code editor opens.
3. Delete everything in `Code.gs`, then paste the full contents of `apps-script/Code.gs` from this project. Click **Save** (disk icon).
4. In the function dropdown at the top, choose **`setup`**, then click **Run**.
5. Google asks for permission. Click **Review permissions**, choose your account, then **Advanced → Go to (project name) (unsafe) → Allow**.
   The "unsafe/unverified" warning is normal for your own script. It needs access to your spreadsheet and to send email as you.
6. Go back to the Sheet. It now has two tabs:
   - **Registrations** – filled automatically (Timestamp, Full name, Email, Office, Position, Status).
   - **Materials** – edit the sample rows: `Name | Type (pdf, pptx or xlsx) | Button text | URL`. Use real Google Drive links that start with `https://`.

   In Google Drive, set each file to **Share → Anyone with the link → Viewer**, then copy its link.

## Part 2 – Publish the backend

1. In the Apps Script editor click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Set:
   - **Execute as:** `Me`
   - **Who has access:** `Anyone`
4. Click **Deploy** and copy the **Web app URL**. It ends in `/exec`.

> Whenever you change `Code.gs` later: **Deploy → Manage deployments → pencil icon → Version: New version → Deploy.** The URL stays the same.

## Part 3 – Update the website on GitHub

1. In the GitHub repo choose **Add file → Upload files** and upload the files from this update, keeping their folders:
   `index.html`, `src/main.js`, `src/api.js`, `apps-script/Code.gs`, `docs/SETUP-GUIDE.md`.
   This replaces `index.html` and `src/main.js`. If you changed those two files yourself, tell Claude first so the changes can be merged.
2. Open `src/data.js` → click the pencil icon. In the `event = { ... }` block, add this line (keep your other lines and edits):

   ```js
   apiUrl: 'PASTE-YOUR-WEB-APP-URL-HERE',
   ```

3. Commit. The **Actions** tab rebuilds the site in about a minute.

## Part 4 – Test it

1. Open the live site and fill in the **Register** form with your own email. A new row appears in the `Registrations` tab.
2. The Materials section shows a lock. Click **Sign in**, enter your email, then **Send code**.
3. Check your inbox (and spam) for the code, enter it, and the materials appear.
4. Click **Sign out** to lock them again.

---

## Running it

| Task | How |
| --- | --- |
| See / export attendees | Open the Sheet. **File → Download → Microsoft Excel (.xlsx)** for an Excel copy. |
| Stop someone signing in | Change their **Status** cell from `Registered` to `Blocked`. |
| Add or change downloads | Edit the **Materials** tab. Changes show on the next sign-in, no redeploy needed. |
| Remove someone's data | Delete their row. |

## Limits and good practice

- **Email quota.** Apps Script sends from your account: about 100 recipients/day on a free Gmail and about 1,500/day on Google Workspace. A sign-in uses one email, and a session lasts 6 hours. For 251 participants, use a Workspace account.
- **What "locked" means.** Download links are never sent to the browser before sign-in, so they cannot be found in the page. Anyone who has a Drive link can still open that file, so don't post the links publicly. For stricter control, share each Drive file only with specific email addresses instead of "Anyone with the link".
- **Privacy.** The Sheet holds personal data. Keep it shared with as few people as possible, keep the consent checkbox on the form, and delete the data when the event is over (Data Privacy Act of 2012).
- **Spam / abuse.** Codes expire after 10 minutes, allow 5 wrong tries, and can be requested once per minute per email.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| "Network problem" on register or sign-in | The deployment must be **Execute as: Me** and **Who has access: Anyone**. The URL must end in `/exec` (not `/dev`). |
| Changes to `Code.gs` have no effect | Deploy a **New version** (see Part 2). |
| No code email arrives | Check spam. The email is sent only if the address is in `Registrations` and not `Blocked`. Check **Executions** in Apps Script for errors or quota. |
| "Missing sheet" error | Run `setup` again from the Apps Script editor. |
| Site still shows public materials | `apiUrl` in `src/data.js` is empty or has a typo. |
