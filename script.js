// Dev-Detective: GitHub profile finder
// API docs: https://docs.github.com/en/rest/users/users

const BASE_URL = "https://api.github.com/users/";
const MAX_REPOS_SHOWN = 5;

// Optional: personal access token for local testing only.
// Do not commit a real token to GitHub.
const TOKEN = "";

// ---------- DOM elements ----------
const searchForm = document.getElementById("searchForm");
const usernameOne = document.getElementById("usernameOne");
const usernameTwo = document.getElementById("usernameTwo");
const modeToggle = document.getElementById("modeToggle");
const searchBtn = document.getElementById("searchBtn");
const statusBox = document.getElementById("status");
const resultsBox = document.getElementById("results");

let isBattleMode = false;

// ---------- Helper functions ----------

// Converts "2023-01-25T12:00:00Z" into "25 Jan 2023"
function formatDate(isoString) {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const date = new Date(isoString);

  const day = date.getUTCDate();
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();

  return day + " " + month + " " + year;
}

// Stops user-controlled text (bio, name) from being read as HTML
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text || "";
  return div.innerHTML;
}

// Adds https:// if missing and only allows http/https links
function getSafeUrl(url) {
  if (!url) return null;

  const fullUrl = url.startsWith("http") ? url : "https://" + url;
  try {
    const parsed = new URL(fullUrl);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.href;
    }
  } catch (error) {
    // not a valid URL, fall through
  }
  return null;
}

function calculateTotalStars(repos) {
  return repos.reduce(function (total, repo) {
    return total + repo.stargazers_count;
  }, 0);
}

// ---------- API calls ----------

async function fetchData(url, username) {
  const headers = { Accept: "application/vnd.github+json" };
  if (TOKEN) {
    headers.Authorization = "Bearer " + TOKEN;
  }

  const response = await fetch(url, { headers: headers });

  if (response.status === 404) {
    throw new Error('User not found: "' + username + '"');
  }
  if (response.status === 403 || response.status === 429) {
    throw new Error("API rate limit exceeded. Please try again later.");
  }
  if (!response.ok) {
    throw new Error("Something went wrong (status " + response.status + ")");
  }

  return response.json();
}

// First call gets the profile, second call uses repos_url to get the repos
async function getUserWithRepos(username) {
  const name = username.trim();

  const user = await fetchData(BASE_URL + encodeURIComponent(name), name);
  const repos = await fetchData(
    user.repos_url + "?per_page=100&sort=created&direction=desc",
    name
  );

  return { user: user, repos: repos };
}

// ---------- UI helpers ----------

function showLoading() {
  statusBox.innerHTML = '<div class="spinner"></div><p>Loading...</p>';
  resultsBox.innerHTML = "";
  searchBtn.disabled = true;
}

function hideLoading() {
  statusBox.innerHTML = "";
}

function showError(message) {
  statusBox.innerHTML = '<div class="error-box">' + escapeHtml(message) + "</div>";
}

function createRepoList(repos) {
  const latestRepos = repos.slice(0, MAX_REPOS_SHOWN);

  if (latestRepos.length === 0) {
    return '<p class="small-text">No public repositories yet.</p>';
  }

  let html = "<h3>Latest Repositories</h3><ul class='repo-list'>";
  latestRepos.forEach(function (repo) {
    html +=
      "<li>" +
      '<a href="' + escapeHtml(repo.html_url) + '" target="_blank" rel="noopener noreferrer">' +
      escapeHtml(repo.name) +
      "</a>" +
      '<span class="small-text">Created ' + formatDate(repo.created_at) +
      " | " + repo.stargazers_count + " stars</span>" +
      "</li>";
  });
  html += "</ul>";

  return html;
}

// status can be "winner", "loser" or "" (no badge)
function createProfileCard(data, showRepos, status) {
  const user = data.user;
  const repos = data.repos;

  const portfolio = getSafeUrl(user.blog);
  const portfolioHtml = portfolio
    ? '<a href="' + escapeHtml(portfolio) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(portfolio) + "</a>"
    : '<span class="small-text">No portfolio URL</span>';

  let badgeHtml = "";
  if (status === "winner") {
    badgeHtml = '<span class="badge">Winner</span>';
  } else if (status === "loser") {
    badgeHtml = '<span class="badge">Loser</span>';
  }

  return (
    '<div class="card ' + status + '">' +
      badgeHtml +
      '<div class="profile">' +
        '<img src="' + escapeHtml(user.avatar_url) + '" alt="' + escapeHtml(user.login) + ' avatar">' +
        "<div>" +
          "<h2>" + escapeHtml(user.name || user.login) + "</h2>" +
          '<div class="small-text">@' + escapeHtml(user.login) + "</div>" +
          "<p>" + escapeHtml(user.bio || "No bio available.") + "</p>" +
          '<div class="small-text">Joined ' + formatDate(user.created_at) + "</div>" +
          "<div>" + portfolioHtml + "</div>" +
          '<div class="total-stars">Total stars: ' + calculateTotalStars(repos) + "</div>" +
        "</div>" +
      "</div>" +
      (showRepos ? createRepoList(repos) : "") +
    "</div>"
  );
}

// ---------- Main features ----------

async function searchSingleUser() {
  const data = await getUserWithRepos(usernameOne.value);
  resultsBox.innerHTML = '<div class="card-grid">' + createProfileCard(data, true, "") + "</div>";
}

async function battleUsers() {
  // Both requests run at the same time
  const results = await Promise.all([
    getUserWithRepos(usernameOne.value),
    getUserWithRepos(usernameTwo.value)
  ]);
  const first = results[0];
  const second = results[1];

  const firstStars = calculateTotalStars(first.repos);
  const secondStars = calculateTotalStars(second.repos);

  let firstStatus = "";
  let secondStatus = "";

  if (firstStars > secondStars) {
    firstStatus = "winner";
    secondStatus = "loser";
  } else if (secondStars > firstStars) {
    firstStatus = "loser";
    secondStatus = "winner";
  }

  let html = '<div class="card-grid battle">';
  html += createProfileCard(first, false, firstStatus);
  html += createProfileCard(second, false, secondStatus);
  html += "</div>";

  if (firstStars === secondStars) {
    html = '<p class="small-text" style="text-align:center">It is a tie!</p>' + html;
  }
  resultsBox.innerHTML = html;
}

function toggleBattleMode() {
  isBattleMode = !isBattleMode;

  usernameTwo.hidden = !isBattleMode;
  usernameTwo.required = isBattleMode;
  modeToggle.classList.toggle("active", isBattleMode);
  modeToggle.textContent = "Battle Mode: " + (isBattleMode ? "On" : "Off");
  searchBtn.textContent = isBattleMode ? "Compare" : "Search";

  resultsBox.innerHTML = "";
  statusBox.innerHTML = "";
}

async function handleSubmit(event) {
  event.preventDefault();
  showLoading();

  try {
    if (isBattleMode) {
      await battleUsers();
    } else {
      await searchSingleUser();
    }
    hideLoading();
  } catch (error) {
    showError(error.message);
  } finally {
    searchBtn.disabled = false;
  }
}

// ---------- Event listeners ----------
modeToggle.addEventListener("click", toggleBattleMode);
searchForm.addEventListener("submit", handleSubmit);