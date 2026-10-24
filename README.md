# Dev-Detective: GitHub Profile Finder

Client-side app that uses the GitHub REST API to search users, list their latest repos, and compare two users in Battle Mode.

Features
Phase 1: username search, profile card (avatar, name, bio, join date, portfolio), loading spinner, "User Not Found" on 404.

Phase 2:second fetch via `repos_url`, 5 latest repos (links open in new tab), ISO date formatter.

Phase 3: Battle Mode with `Promise.all()`, total stars via `reduce()`, green Winner / red Loser cards.

Setup
1 Clone the repo and open the folder.
2 Open `index.html` in a browser (or run `npx serve .`). No build step or dependencies.
3 Type a username (try `octocat`), or toggle Battle Mode for two users.

Rate limits
Unauthenticated GitHub requests are limited to 60/hour. For local testing, put a Personal Access Token in `TOKEN` in `script.js`. Never commit a real token.

Deploy
Drag the folder into Netlify Drop, or import the repo in Vercel (static site, no build command).

Tech
HTML, CSS, vanilla JavaScript (native `fetch`, async/await, Promise.all).
