# Requirements Analysis Report
**Spec:** Nepal Football SPA  
**Document:** requirements.md  
**Requirements covered:** 1–14  
**Total findings:** 55 — P0: 6, P1: 32, P2: 17

---

## 1. Completeness Check

### Requirement 1 — SPA Navigation

**1.1 — No criteria for deep-link / direct URL load** · P1 · Gap  
Criterion 5 says the URL hash is updated on tab switch, but there is no criterion specifying what happens when the app is loaded with a hash already in the URL (e.g., `/#volunteers`). Expected behaviour (render that tab vs. fall back to Overview) is unspecified.

**1.2 — No error state for failed initial data load** · P1 · Gap  
No criterion covers what the SPA should display if the initial API call fails entirely on load.

**1.3 — No keyboard navigation criteria for tab bar** · P2 · Gap  
WCAG 2.1 SC 2.1.1 requires keyboard operability. No criterion covers arrow-key or Tab/Enter navigation on the tab bar.

---

### Requirement 2 — Overview Dashboard

**2.1 — "Volunteer Roles" stat card definition is ambiguous** · P1 · Ambiguity  
Criterion 1 defines "Volunteer Roles" as "total task count". No criterion specifies whether this is a live count or a fixed seed value.

**2.2 — No empty-state for zero high-priority tasks** · P2 · Gap  
Criterion 4 lists all high-priority tasks but gives no fallback when none exist.

**2.3 — No empty-state when fewer than 5 milestones exist** · P2 · Gap  
Criterion 5 shows the first 5 milestones with no fallback for smaller lists.

**2.4 — 1-second update window has no specified mechanism** · P1 · Gap  
Criterion 7 requires the Dashboard to update within 1 second when a status changes in another tab, but no mechanism (polling, shared state, re-fetch on activation) is specified.

---

### Requirement 3 — Task Board Management

**3.1 — No loading/pending visual state during API persist** · P1 · Gap  
Criterion 5 allows up to 3 seconds for persistence. No criterion specifies the task item's visual state during that window.

**3.2 — No concurrent toggle conflict resolution** · P2 · Gap  
Last-write-wins behaviour for simultaneous toggles by two users is unspecified.

---

### Requirement 4 — Teams View

**4.1 — No error handling for partial team data** · P1 · Gap  
Criterion 4 covers total API failure but not partial failure (broken task references on a team).

**4.2 — No loading indicator criterion** · P2 · Gap  
No criterion specifies a loading indicator while team data is being fetched.

---

### Requirement 5 — Preparation Day Checklist

**5.1 — No timing bound on API persist** · P1 · Gap  
Criterion 5 says the API "SHALL persist" but gives no time bound, unlike the 3-second bound in Req 3.5 and 6.5.

**5.2 — No loading/pending visual state during API persist** · P1 · Gap  
Same gap as Req 3.1.

---

### Requirement 6 — Timeline Management

**6.1 — No loading/pending visual state during API persist** · P2 · Gap  
Same gap as Req 3.1 and 5.2.

---

### Requirement 7 — Backend API

**7.1 — Login/auth endpoint absent from API endpoint list** · P0 · Gap  
Req 7.1 does not list a login endpoint among the exposed RESTful endpoints. The auth API surface is entirely absent from the backend API requirement.

**7.2 — No rate-limiting or brute-force protection on login** · P1 · Gap  
No criterion covers rate-limiting or account lockout after repeated failed login attempts.

**7.3 — No CORS configuration criterion** · P1 · Gap  
The SPA is hosted on CloudFront (different origin from API Gateway). No criterion specifies required CORS headers — a deployment blocker.

**7.4 — No HTTP 405 criterion for unsupported methods** · P2 · Gap  
No criterion specifies that unsupported HTTP methods on a valid route return HTTP 405.

---

### Requirement 8 — Data Storage

**8.1 — Task schema missing team foreign-key field** · P0 · Gap  
Req 3.1 requires displaying the "assigned team name" per task. Req 8.1 defines the task schema without a `teamId` or `teamName` field, making task→team lookup impossible without a full team scan.

**8.2 — `name` vs. `task description` field distinction unclear** · P1 · Gap  
Req 8.1 lists both `name` and `task description` as separate fields but Req 3.1 refers to "task name" without clarifying which field is the display label.

**8.3 — No DynamoDB table design specified** · P1 · Gap  
Req 8.5 mandates DynamoDB but no criterion specifies the table design (partition key, sort key, GSIs).

**8.4 — No uniqueness constraint on volunteer name** · P2 · Gap  
Req 14.1 stores volunteers by `id` only. Duplicate volunteer names are possible with no detection mechanism.

---

### Requirement 9 — Frontend Hosting

**9.1 — No CloudFront cache invalidation criterion on deploy** · P2 · Gap  
No criterion specifies how stale assets are invalidated after a new deployment.

---

### Requirement 10 — Responsive Design

**10.1 — No criterion for landscape mobile orientation** · P2 · Gap  
Breakpoints at 700px and 420px do not address landscape phone orientation (667–896px wide).

---

### Requirement 11 — Admin Authentication

**11.1 — No session token TTL or server-side expiry** · P0 · Gap  
No criterion specifies a token TTL or what happens when an expired token is used. Without this, a token in `sessionStorage` is valid indefinitely until the tab is closed.

**11.2 — `sessionStorage` does not reliably survive tab refreshes** · P0 · Conflict  
`sessionStorage` is cleared on hard refresh in many browsers. The stated "survives tab refreshes" behaviour is factually inconsistent with the specified storage mechanism.

**11.3 — No credential storage mechanism specified** · P1 · Gap  
No criterion specifies where admin credentials are stored (Lambda env vars, Secrets Manager, Cognito, etc.).

**11.4 — No client-side validation for empty login fields** · P1 · Gap  
Criterion 3 covers invalid credentials from the API but not empty username/password before submission.

**11.5 — No logout/token-invalidation API endpoint** · P1 · Gap  
Criterion 5 clears the token client-side but no criterion specifies whether the API has a server-side token invalidation endpoint.

**11.6 — Criterion 8 redirect target is underspecified** · P1 · Ambiguity  
"Redirect the user to the login UI" does not specify modal overlay vs. dedicated route, conflicting with Criterion 1 which describes login as a modal.

---

### Requirement 12 — Volunteer Entry Form

**12.1 — No form cancel/dismiss behaviour specified** · P1 · Gap  
No criterion specifies what happens when an Admin_User dismisses the form without submitting.

**12.2 — No duplicate volunteer name handling** · P1 · Gap  
No criterion specifies whether the API or SPA should reject or warn on a duplicate volunteer name.

**12.3 — Criterion 6 implies timestamp comparison not supported by schema** · P1 · Ambiguity  
"Tasks deleted since the volunteer was last edited" implies timestamp tracking not present in the task or volunteer schema. The practical implementation is "fetch current task list and omit missing IDs".

**12.4 — No maximum volunteer count** · P2 · Gap  
No upper bound on total volunteer entries is specified, which may affect UI performance and DynamoDB scan costs.

**12.5 — No handling for concurrent edit/delete of same volunteer** · P2 · Gap  
If a concurrent admin deletes a volunteer while another has the edit form open, the subsequent PUT will receive a 404 with no specified SPA handling.

---

### Requirement 13 — Volunteer Tab

**13.1 — No default sort order for volunteer table** · P1 · Gap  
No criterion specifies the default sort order (insertion order, alphabetical, etc.), making the display non-deterministic.

**13.2 — Criteria 8 and 9 are inconsistent on deletion trigger** · P1 · Gap  
Criterion 8 says "WHEN an Admin_User deletes a volunteer entry" (implying immediate action) while Criterion 9 says a confirmation dialog is shown first. The two criteria are consistent in intent but Criterion 8 does not reference the confirmation step.

**13.3 — Availability "checkbox indicator" — interactive vs. visual-only unspecified** · P1 · Ambiguity  
Criterion 2 says "checkbox indicator" but Criterion 5 says the view is "read-only" for Public_Users. It is unclear whether the checkboxes are `<input type="checkbox">` elements or visual-only indicators.

**13.4 — No pagination or virtual scrolling** · P2 · Gap  
With no upper bound on volunteers, the table could grow unbounded with no pagination criterion.

---

### Requirement 14 — Volunteer Data Storage

**14.1 — No cascading behaviour when a referenced task is deleted** · P1 · Gap  
No criterion specifies what happens to a volunteer's task list if a referenced task is deleted (stale reference, auto-removal, or error on read).

**14.2 — Auth endpoint contract not defined in any requirement** · P0 · Gap  
The API must support a login endpoint (Req 11.6) but Req 14.4 lists only volunteer CRUD endpoints. No requirement section defines the auth endpoint contract (path, request body schema, response schema).

---

## 2. Consistency Check

**C1 — Timing bound conflict: Req 3.5 vs Req 5.5**  
Req 3.5 and 6.5 specify a 3-second bound for persisting a status change. Req 5.5 (prep checklist) omits any timing bound. Either the bound applies to all toggle operations or the omission is intentional and should be documented.

**C2 — Dashboard 1-second update vs. API 3-second persist (Req 2.7 vs Req 3.5/6.5)**  
Req 2.7 requires the Dashboard to update within 1 second of a status change. Req 3.5 and 6.5 allow up to 3 seconds for the API to persist. If the Dashboard re-fetches from the API, it cannot reliably update within 1 second when the API itself may take up to 3 seconds. These bounds are logically incompatible unless the Dashboard reads from local/shared state.

**C3 — `sessionStorage` vs. "survives tab refreshes" (Req 11.7)**  
`sessionStorage` is cleared on hard refresh in many browsers. The criterion states the session "survives tab refreshes" but `sessionStorage` is not the correct mechanism for this. `localStorage` would be more appropriate.

**C4 — Team max-tasks 20 (Req 8.4) vs. display limit 5 (Req 4.1)**  
Req 8.4 allows up to 20 tasks per team in the data model. Req 4.1 shows a maximum of 5 tasks per team card. The constraint vs. display distinction is not made explicit.

**C5 — Task schema omits team assignment (Req 8.1 vs Req 3.1 and 4.1)**  
Req 3.1 requires displaying the "assigned team name" on each task. The relationship is stored only on the team side (Req 8.4), requiring a reverse lookup not specified anywhere.

---

## 3. Ambiguity Check

**A1 — Req 1.2: "complete the view transition within 300 milliseconds"**  
"View transition" is undefined — does it mean tab-switch animation time or full render including data fetch? If data is fetched on tab activation, the 300ms bound is almost certainly violated on every load.

**A2 — Req 2.7: "within 1 second without requiring a page reload"**  
The 1-second clock start point is undefined — from user click, from API response, or from optimistic UI update?

**A3 — Req 3.2: "WHEN an Organizer clicks a task item"**  
"Clicks a task item" is ambiguous — does clicking anywhere on the row toggle completion, or only a specific checkbox/button?

**A4 — Req 4.1: "maximum 5 tasks per team"**  
Unclear whether this is a display limit (show only 5, truncate the rest) or a data constraint (a team cannot have more than 5 tasks).

**A5 — Req 5.4: "update the progress bar percentage in real time"**  
"Real time" is not a testable bound. A specific maximum latency is needed.

**A6 — Req 7.3: "return all current data … within 3 seconds"**  
Unclear whether this is a single aggregated endpoint response or the sum of multiple parallel requests.

**A7 — Req 9.6: "within 5 seconds on a standard broadband connection"**  
"Standard broadband connection" is not a testable specification. A concrete network profile is needed.

**A8 — Req 11.1: "a login modal"**  
No criterion specifies focus trapping, backdrop click-to-dismiss, or Escape-key-to-dismiss behaviour.

**A9 — Req 12.6: "tasks deleted since the volunteer was last edited"**  
Implies timestamp comparison not supported by the task or volunteer schema. The practical implementation is simpler: fetch current task list and omit missing IDs.

**A10 — Req 13.2: "checkbox indicator, checked if available"**  
Unclear whether this is a real `<input type="checkbox">` (interactive) or a visual-only indicator. Req 13.5 says the view is "read-only" for Public_Users but does not explicitly say the checkboxes are non-interactive.

---

## 4. Cross-Cutting Concerns (Requirements 11–14 Integration Points)

**X1 — Existing toggle endpoints have no auth requirement** · P0 · Gap  
Req 7.1 defines endpoints for updating tasks, prep items, and milestones. With Req 11 (Admin Auth), it is unspecified whether these existing toggle endpoints are public or require authentication. If public, any user can write data. If they require auth, the existing Req 3, 5, and 6 user stories (which use the "Organizer" persona, not "Admin_User") are broken.

**X2 — Volunteer tab visual state on auth transition** · P2 · Gap  
No requirement addresses whether the Volunteer tab label or appearance changes when the user authenticates.

**X3 — Dashboard has no volunteer count stat** · P2 · Gap  
Req 2.1 defines four stat cards, none of which include volunteer count. With Req 13/14 adding volunteer data, it is unclear whether the Dashboard should show a "Volunteers Registered" stat.

**X4 — Volunteer_View rendering of done/deleted tasks** · P1 · Gap  
The volunteer form allows assigning tasks from the Database. If a task is toggled to "done" or deleted, the Volunteer_View's task assignment list may reference a completed or non-existent task. No requirement specifies how to render this.

**X5 — 401 mid-session not handled in existing toggle views** · P1 · Gap  
If the session token expires mid-session and an Organizer toggles a task, the API returns 401. Req 3.6, 5.6, and 6.6 specify error handling for API failures but only describe reverting state — not re-prompting login.

**X6 — Volunteer_View read-only re-render after logout** · P1 · Gap  
Req 11.5 says logout navigates to Overview. No criterion explicitly confirms that the Volunteer_View re-renders in read-only mode after logout without a page reload if the user navigates back.

**X7 — Admin credential storage schema absent from Req 8 and 14** · P1 · Gap  
Req 8 defines schemas for tasks, prep items, milestones, and teams. Neither Req 8 nor Req 14 covers how admin credentials are stored or how session tokens are validated server-side.

---

## 5. Summary Table

| Req # | Criterion # | Severity | Type | Description |
|-------|-------------|----------|------|-------------|
| 1 | — | P1 | Gap | No behaviour defined for app load with a pre-existing URL hash |
| 1 | — | P1 | Gap | No error state defined for failed initial API load |
| 1 | — | P2 | Gap | No keyboard navigation criteria for tab bar |
| 2 | 1 | P1 | Ambiguity | "Volunteer Roles" stat — live count vs. fixed value unclear |
| 2 | 4 | P2 | Gap | No empty-state for zero high-priority tasks |
| 2 | 5 | P2 | Gap | No empty-state when fewer than 5 milestones exist |
| 2 | 7 | P1 | Gap | No mechanism specified for 1-second cross-tab Dashboard update |
| 2 | 7 | P1 | Ambiguity | 1-second update clock start point is undefined |
| 3 | 2 | P1 | Ambiguity | "Clicks a task item" — click target area is undefined |
| 3 | 5 | P1 | Gap | No loading/pending visual state during 3-second API persist window |
| 3 | — | P2 | Gap | No concurrent-toggle conflict resolution specified |
| 4 | 1 | P1 | Ambiguity | "Max 5 tasks per team" — display limit vs. data constraint unclear |
| 4 | 1 | P1 | Gap | No error handling for partial team data (broken task references) |
| 4 | — | P2 | Gap | No loading indicator criterion for Teams_View |
| 5 | 4 | P2 | Ambiguity | "Real time" progress bar update has no testable latency bound |
| 5 | 5 | P1 | Gap | No timing bound on prep checklist API persist (inconsistent with Req 3.5, 6.5) |
| 5 | 5 | P1 | Gap | No loading/pending visual state during API persist |
| 6 | — | P2 | Gap | No loading/pending visual state during milestone API persist |
| 7 | 1 | P0 | Gap | Login/auth endpoint absent from API endpoint list |
| 7 | — | P1 | Gap | No CORS configuration criterion (deployment blocker) |
| 7 | — | P1 | Gap | No rate-limiting/brute-force protection on login endpoint |
| 7 | — | P2 | Gap | No HTTP 405 criterion for unsupported methods |
| 7 | 3 | P1 | Ambiguity | "Within 3 seconds" — per-request or total for all parallel requests? |
| 8 | 1 | P0 | Gap | Task schema missing team foreign-key field (breaks Task_Board display) |
| 8 | 1 | P1 | Gap | `name` vs. `task description` field distinction is unclear |
| 8 | — | P1 | Gap | No DynamoDB table design (partition key, GSIs) specified |
| 8 | 4 | P1 | Conflict | Team max-tasks is 20 (Req 8.4) but display limit is 5 (Req 4.1) — constraint vs. display not distinguished |
| 8 | — | P2 | Gap | No uniqueness constraint on volunteer name |
| 9 | — | P2 | Gap | No CloudFront cache invalidation criterion on deploy |
| 9 | 6 | P2 | Ambiguity | "Standard broadband connection" is not a testable network profile |
| 10 | — | P2 | Gap | No criterion for landscape mobile orientation layout |
| 11 | 7 | P0 | Gap | No session token TTL or server-side expiry criterion |
| 11 | 7 | P0 | Conflict | `sessionStorage` does not reliably survive tab refreshes; contradicts stated behaviour |
| 11 | — | P1 | Gap | No credential storage mechanism specified |
| 11 | 3 | P1 | Gap | No client-side validation for empty login fields |
| 11 | — | P1 | Gap | No logout/token-invalidation API endpoint specified |
| 11 | 8 | P1 | Ambiguity | "Redirect to login UI" — modal vs. route is undefined |
| 12 | — | P1 | Gap | No form cancel/dismiss behaviour specified |
| 12 | — | P1 | Gap | No duplicate volunteer name handling |
| 12 | 6 | P1 | Ambiguity | "Tasks deleted since last edited" implies timestamp comparison not supported by schema |
| 12 | — | P2 | Gap | No maximum volunteer count specified |
| 12 | — | P2 | Gap | No handling for concurrent edit/delete of same volunteer |
| 13 | — | P1 | Gap | No default sort order for volunteer table |
| 13 | 8/9 | P1 | Gap | Criteria 8 and 9 are inconsistent on whether deletion is immediate or confirmation-gated |
| 13 | 2 | P1 | Ambiguity | Availability "checkbox indicator" — interactive vs. visual-only is unspecified |
| 13 | — | P2 | Gap | No pagination or virtual scrolling for large volunteer lists |
| 14 | 1 | P1 | Gap | No cascading behaviour when a referenced task is deleted |
| 14 | — | P0 | Gap | Auth endpoint contract (path, schema) not defined in any requirement |
| X1 | — | P0 | Gap | Existing toggle endpoints have no auth requirement — public write access risk |
| X2 | — | P2 | Gap | No requirement for tab visual change on auth state transition |
| X3 | — | P2 | Gap | Dashboard has no volunteer count stat despite Req 13/14 adding volunteer data |
| X4 | — | P1 | Gap | Volunteer_View rendering of done/deleted tasks in assignment list is unspecified |
| X5 | — | P1 | Gap | 401 mid-session not handled in Req 3.6, 5.6, 6.6 error flows |
| X6 | — | P1 | Gap | Volunteer_View read-only re-render after logout not explicitly required |
| X7 | — | P1 | Gap | Admin credential and session token storage schema absent from Req 8 and 14 |
