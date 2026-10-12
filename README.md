# NewGRS User System Review – Region III Event Site

Event website for the DSWD 4Ps **Grievance Redress System Workflow Automation (NewGRS) User System Review**.
Pages: **Home · Training Details · Materials · Photos · Register** (plus Sign in, when the Google Sheet login is connected).

This guide is written for the person who maintains the site. You do not need to know how to code. Everything below can be done in the GitHub website.

---

## 1. How to edit anything (the same 4 steps every time)

1. Open the repo on GitHub and click the file you want (for example `src/data.js`).
2. Click the **pencil icon** (Edit this file).
3. Change the text, then click **Commit changes…** → **Commit changes**.
4. Wait about 1 minute. The site rebuilds by itself (watch the **Actions** tab: a green check means it's live). Then refresh the site with **Ctrl + F5**.

> Be careful to keep the quotes `' '`, commas `,` and brackets `{ } [ ]` exactly as they are. Only change the words between the quotes. If the site breaks after an edit, open the **Actions** tab, check the red ✗ run, or ask Claude for help and paste the error.

To **upload a file** (photos, logo): open the folder in GitHub → **Add file → Upload files** → drag the file in → **Commit changes**.

---

## 2. Quick map: "I want to change…"

| I want to change… | Open this file | Look for |
| --- | --- | --- |
| Event title, region, dates, location, number of attendees | `src/data.js` | `export const event = { … }` (section 3) |
| Agenda / schedule (Day 1–4) | `src/data.js` | `export const agenda = [ … ]` (section 4) |
| Downloadable presentations & files | `src/data.js` (public site) or the Google Sheet **Materials** tab (login site) | `materials` (section 5) |
| Photos in the carousel and gallery | `src/data.js` + upload to `src/assets/photos/` | `photos` (section 6) |
| Registration form link / Google Sheet connection | `src/data.js` | `registerUrl`, `apiUrl` (section 7) |
| Welcome paragraph, section headings, form labels, footer | `index.html` | Press Ctrl + F and search for the sentence (section 8) |
| Colors, logo | `tailwind.config.js`, `index.html` | section 9 |

---

## 3. Event details: title, region, dates, location, attendees

File: **`src/data.js`** → the block at the top:

```js
export const event = {
  title: 'Grievance Redress System Workflow Automation (NewGRS) User System Review',
  region: 'Region III',
  dateRange: '3–6 November 2026',
  location: 'DSWD Region III',
  attendees: '251',
  registerUrl: '#register',
  apiUrl: '',
  driveUrl: 'https://drive.google.com/',
};
```

Change the words inside the quotes. One change updates **every place** it appears on the site:

| Field | Where it shows on the site |
| --- | --- |
| `title` | Big heading on the Home page |
| `region` | Under the title, the Welcome text, the Register heading, the footer |
| `dateRange` | Under the title, the Welcome text, the **Dates** box, the Register heading |
| `location` | The **Location** box on Home |
| `attendees` | The **Attendees** box on Home |
| `driveUrl` | The **Download Views** button (public mode only, see section 5) |

The browser tab title and the search description are in `index.html` (`<title>` and `<meta name="description">` near the top). Change them there if the event changes.

---

## 4. Agenda & Schedule (Training Details page)

File: **`src/data.js`** → `export const agenda = [ … ]`. Each day looks like this:

```js
{
  day: 'Day 2',
  title: 'System Encoding',
  items: [
    'Opening to Topics',
    'Topics and System Encoding',
    'Reporting & Closing',
  ],
},
```

- **Change a topic:** edit the text inside the quotes.
- **Add a topic:** add a new line `'Your topic',` inside `items`.
- **Add or remove a day:** copy a whole `{ … },` block and paste it after another one. Delete the block to remove a day.
- The block that opens automatically is the **second** day. To open a different one, ask Claude, or edit the line `toggleAcc($('#acc-btn-1'), true);` in `src/main.js` (`0` = first day, `1` = second, and so on).

---

## 5. Presentations & Materials (downloads)

The site does not store the files itself. Upload your files to **Google Drive** (or OneDrive) and give the site the links.

### Step A – Upload and get each file's link
1. Upload the file to Google Drive.
2. Right-click → **Share** → **General access: Anyone with the link** → **Viewer** → **Copy link**.
3. The link looks like `https://drive.google.com/file/d/FILE_ID/view`.
   *Optional:* for a button that **downloads straight away**, change it to
   `https://drive.google.com/uc?export=download&id=FILE_ID`.

Links must start with `https://`. Links that don't are ignored on purpose.

### Step B – Add it to the site (two modes)

**Mode 1 – Public (no login).** Used while `apiUrl` in `src/data.js` is empty (`apiUrl: ''`). Edit `export const materials = [ … ]` in `src/data.js`:

```js
{ name: 'NewGRS Manual.pdf', type: 'pdf', action: 'Download Manual', href: 'https://drive.google.com/file/d/FILE_ID/view' },
```

| Field | Meaning |
| --- | --- |
| `name` | Name shown under the icon |
| `type` | `pdf`, `pptx` or `xlsx`. This picks the red, orange or green icon. Anything else shows the PDF icon. |
| `action` | Text on the blue button (for example `Download Slides`) |
| `href` | The Drive link from Step A |

Add a file by copying one line and changing it. Delete a line to remove a file. The **Download Views** button at the top of this panel opens the Drive folder in `driveUrl` (section 3).

**Mode 2 – Login (participants only).** Used once `apiUrl` is filled in (section 7). The file list then lives in your **Google Sheet**, on the **Materials** tab, with the columns `Name | Type | Action | URL`. Add, edit or delete rows there. The site updates on the next sign-in, with **no GitHub change or redeploy**. In this mode the links are only sent to people after they sign in, and the `materials` list in `data.js` and the **Download Views** button are not used.

---

## 6. Photos: carousel and gallery

The **Event Gallery** carousel and the **Recently uploaded** grid both read from one list: `export const photos` in `src/data.js`. Right now it shows colored placeholders.

### Step A – Prepare and upload the photos
1. Rename photos to **lowercase letters, numbers and dashes, no spaces**: `day1-opening.jpg`, `day2-encoding-01.jpg`.
2. Make them web-sized: **JPG, about 1600 px wide, under ~500 KB each** (large photos make the site slow).
3. On GitHub open `src/assets/photos/` → **Add file → Upload files** → drag them in → **Commit changes**.

### Step B – List them in `src/data.js`
Replace the whole `export const photos = Array.from(…);` block with:

```js
export const photos = [
  { src: new URL('./assets/photos/day1-opening.jpg', import.meta.url).href, alt: 'Opening program, Day 1' },
  { src: new URL('./assets/photos/day2-encoding-01.jpg', import.meta.url).href, alt: 'Participants encoding in the system' },
  { src: new URL('./assets/photos/day3-simulation.jpg', import.meta.url).href, alt: 'Workflow simulation' },
];
```

- The file name inside the quotes must match the uploaded file exactly (including `.jpg` and capitals).
- `alt` is a short description for screen readers. Please fill it in.
- The carousel shows 3 photos at a time on computers and 1 on phones, with the arrows to move.
- The **Recently uploaded** grid shows **every** photo in the list, so put the newest first. To keep that grid short, ask Claude to limit it to the latest 10.

---

## 7. Registration and login (Google Sheet)

- `registerUrl` – where the blue **Register Here** button on Home goes. `'#register'` (the default) scrolls to the form on this page. You can put a Google Form link here instead. When `apiUrl` is empty, the form's **Register** button also opens this link.
- `apiUrl` – the web address of the Google Sheet connection (it ends in `/exec`). When filled in:
  - the **Register** form saves each person to your Google Sheet;
  - a **Sign in** button appears (a 6-digit code is emailed to the registered address);
  - **Materials** are locked until sign-in.
  Leave it empty (`''`) to go back to the simple public site.

Full step-by-step setup, daily use (exporting the attendee list to Excel, blocking someone, quotas) and troubleshooting: **[`docs/SETUP-GUIDE.md`](docs/SETUP-GUIDE.md)**.

---

## 8. Other text on the pages (headings, Welcome paragraph, labels, footer)

These are in **`index.html`**. Open it, press **Ctrl + F**, search for a few words of the text you want to change, edit **only the words**, and don't touch anything inside `< >` brackets.

| Text | Search for |
| --- | --- |
| Welcome paragraph | `Welcome to the DSWD` |
| Section headings (Training Details, Presentations & Materials, Action Photos, Register) | `section-label` |
| "Register Here" button text | `Register Here` |
| Registration form labels | `Full name` |
| Footer | `Pantawid Pamilyang Pilipino Program ·` |
| Menu names (Home, Training Details…) | `<nav` |

---

## 9. Look and feel: colors and logo

- **Colors:** `tailwind.config.js` → `navy` (backgrounds) and `brand` (buttons). Change the `#` color codes.
- **Logo:** the header currently shows a **text** "DSWD" and a simple 4Ps badge, since the official logo files are not in this project. To use the official logos: upload them to `src/assets/` (for example `dswd-logo.png`), then in `index.html` replace the `<span class="rounded bg-white …">DSWD</span>` line near the top with:
  ```html
  <img src="/src/assets/dswd-logo.png" alt="DSWD" class="h-8 w-auto" />
  ```
  Use the same pattern for the 4Ps logo. If the image doesn't appear after the rebuild, ask Claude to check it.

---

## 10. Behind the scenes (for whoever maintains the code)

```
├── index.html                 Page structure and text
├── src/
│   ├── data.js                ★ Event details, agenda, materials, photos (edit this most)
│   ├── main.js                Page behavior (menu, agenda, carousel, sign-in)
│   ├── api.js                 Talks to the Google Sheet connection
│   ├── styles.css             Shared styles
│   └── assets/photos/         Put event photos here
├── apps-script/Code.gs        Google Sheet backend (pasted into Apps Script)
├── docs/SETUP-GUIDE.md        Login/registration setup guide
├── .github/workflows/         Automatic build and publish to GitHub Pages
├── tailwind.config.js         Colors and fonts
├── vite.config.js, postcss.config.js, package.json   Build settings
```

Run it on your own computer (needs Node.js 20+):

```bash
npm install
npm run dev      # preview at http://localhost:5173
npm run build    # production build in ./dist
```

Publishing: every commit to `main` is built and published to GitHub Pages by `.github/workflows`. In the repo, **Settings → Pages → Source** must be **GitHub Actions**.

## 11. Common problems

| Problem | What to check |
| --- | --- |
| Site didn't change after my edit | Wait 1–2 minutes, check the **Actions** tab for a green ✓, then press **Ctrl + F5**. |
| Red ✗ in Actions / site is blank or 404 | You probably removed a quote, comma or bracket in your last edit. Open that file's **History**, restore the previous version, or paste the error to Claude. |
| A photo is missing | The file name in `data.js` doesn't exactly match the uploaded file (spaces, capitals, `.jpg` vs `.jpeg`). |
| A material button is missing | Its link doesn't start with `https://`, or its line in `data.js` / the Sheet has a typo. |
| Sign in or Register says "Network problem" | See the troubleshooting table in `docs/SETUP-GUIDE.md`. |
