# AI Prompts Used

<!-- Edit this file to reflect how you actually used AI. -->

1. "Explain the Sprint 3 Dev-Detective assignment in simple terms."
2. "Explain me about GitHub profile search with loading/404 states, repos list, date formatter, and Battle Mode with Promise.all."

 <!-- What I learned -->
`fetch` returns a Promise; `res.ok` must be checked manually since 404 doesn't throw.
`try/catch/finally` keeps the UI from crashing and always clears the spinner.
`Promise.all` runs both user lookups in parallel and rejects if either fails.
`reduce` sums `stargazers_count` across a repo array.
