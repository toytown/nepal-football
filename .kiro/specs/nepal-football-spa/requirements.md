# Requirements Document

## Introduction

A dynamic single-page application (SPA) for managing the Nepali Europapokal 2026 football tournament in Berlin. The application replaces a static AngularJS page with a modern TypeScript-based SPA backed by AWS serverless infrastructure (Lambda, API Gateway, DynamoDB). It provides tournament organizers with a dashboard to manage volunteer tasks, team assignments, preparation day checklists, and event timelines with full CRUD persistence. The application also provides a public-facing volunteer self-registration form and enforces admin-only write access across all editable views.

## Glossary

- **SPA**: The single-page application frontend built with TypeScript and React, deployed to AWS S3 with CloudFront distribution
- **API**: The RESTful backend service composed of AWS Lambda functions behind API Gateway
- **Database**: The AWS DynamoDB instance storing all application data (tasks, teams, prep items, timeline milestones, volunteers)
- **Dashboard**: The overview tab displaying aggregate statistics, progress bars, high-priority tasks, and event information
- **Task_Board**: The view displaying all 15 volunteer tasks with toggle-able completion status; editing restricted to Admin_Users
- **Teams_View**: The view displaying the 6 specialist volunteer teams and their assigned responsibilities
- **Prep_Checklist**: The view displaying the preparation day setup items with toggle-able completion status; editing restricted to Admin_Users
- **Timeline_View**: The view displaying event milestones in chronological order with toggle-able completion status; editing restricted to Admin_Users
- **Volunteer_View**: The tab displaying registered volunteers with their names, available days, and city; viewable by all users, editable only by Admin_Users
- **Volunteer_Form**: The admin-only form for creating and editing volunteer entries in the Volunteer_View
- **Volunteer_Register**: The public-facing self-registration form accessible to all users at the Register tab; does not require authentication
- **Organizer**: A tournament organizer who uses the application to manage volunteer coordination
- **Admin_User**: An authenticated administrator who has write access to all editable views; identified by a username/password credential pair
- **Public_User**: An unauthenticated visitor who can view all tabs and submit the public registration form, but cannot toggle task/checklist/milestone completion or edit volunteer entries

## Requirements

### Requirement 1: Single-Page Application Navigation

**User Story:** As an Organizer, I want to navigate between different views without page reloads, so that I can efficiently manage all aspects of the tournament.

#### Acceptance Criteria

1. THE SPA SHALL render seven navigable tabs: Overview, Task Board, Teams, Prep Day, Timeline, Volunteers, and Register
2. WHEN an Organizer clicks a navigation tab, THE SPA SHALL display the corresponding view without triggering a full page reload and complete the view transition within 300 milliseconds
3. THE SPA SHALL visually indicate the currently active tab using a gold (#FFD700) bottom border and gold text color, while inactive tabs use semi-transparent white text
4. WHEN the application loads, THE SPA SHALL display the Overview tab as the default view
5. WHEN an Organizer navigates between tabs, THE SPA SHALL update the browser URL hash to reflect the active tab so that the current view is restorable via browser back/forward navigation

### Requirement 2: Overview Dashboard

**User Story:** As an Organizer, I want to see an at-a-glance summary of tournament status, so that I can quickly assess overall progress.

#### Acceptance Criteria

1. THE Dashboard SHALL display four statistic cards: Tournament Days (2), Volunteer Roles (total task count), Specialist Teams (total team count), and Tasks Completed (completed/total)
2. THE Dashboard SHALL display a progress bar for volunteer task completion showing percentage (0–100%, rounded to the nearest integer), completed count, and remaining count
3. THE Dashboard SHALL display a progress bar for timeline milestone completion showing percentage (0–100%, rounded to the nearest integer), completed count, and remaining count
4. THE Dashboard SHALL display a list of all tasks with priority "high", showing each task name and scheduled time
5. THE Dashboard SHALL display the first 5 timeline milestones in chronological order, regardless of completion status, showing icon, task description, and target date
6. THE Dashboard SHALL display event information including venue (Sportanlage Grüngürtel, Berlin), tournament dates (04–05 July 2026), and preparation day (03 July 2026)
7. WHEN a task or milestone completion status changes, THE Dashboard SHALL update all related statistics and progress bars within 1 second without requiring a page reload
8. WHEN the Dashboard view is displayed, THE Dashboard SHALL retrieve current task, milestone, and team data from the Database and render all statistics and progress bars based on the persisted state

### Requirement 3: Task Board Management

**User Story:** As an Organizer, I want to view volunteer task completion status, and as an Admin_User I want to toggle it, so that I can track which tasks are done during the event.

#### Acceptance Criteria

1. THE Task_Board SHALL display all volunteer tasks grouped by priority (high first, then medium, then low), showing task name, assigned team name, scheduled time, and priority level (high, medium, low)
2. WHILE a Public_User views the Task_Board, THE SPA SHALL display all tasks in read-only mode; task items SHALL NOT be clickable and SHALL display a "View only — log in to edit" notice
3. WHILE an Admin_User views the Task_Board, WHEN the Admin_User clicks a task item, THE Task_Board SHALL toggle the task completion status between done and not-done
4. WHEN a task is marked as done, THE Task_Board SHALL apply visual indicators: strikethrough text, opacity reduced to 0.5, and a green checkmark
5. WHEN a task is toggled back to not-done, THE Task_Board SHALL remove all done-state visual indicators (strikethrough, reduced opacity, and green checkmark) and restore the task to its default appearance
6. WHEN a task completion status changes, THE API SHALL persist the updated status to the Database within 3 seconds
7. IF the API fails to persist a task completion status change, THEN THE Task_Board SHALL revert the task's visual completion state to its previous value and display an error message indicating the status change could not be saved
8. THE Task_Board SHALL display a priority badge for each task with color coding: red for high, amber for medium, green for low

### Requirement 4: Teams View

**User Story:** As an Organizer, I want to view the specialist volunteer teams and their responsibilities, so that I can understand team structure and assignments.

#### Acceptance Criteria

1. THE Teams_View SHALL display all specialist teams in a 2-column grid layout where each team card shows the team icon, team name, volunteer count needed, and a vertical list of assigned tasks (maximum 5 tasks per team)
2. THE Teams_View SHALL display each team card with a 5px left-border color matching the team's stored color value from the Database
3. WHEN the Teams_View is loaded, THE API SHALL retrieve all team information from the Database and return each team's name, icon, color, volunteer count, and assigned task list
4. IF the API fails to retrieve team data, THEN THE Teams_View SHALL display an error message indicating that team information is unavailable

### Requirement 5: Preparation Day Checklist

**User Story:** As an Organizer, I want to view the preparation day checklist, and as an Admin_User I want to manage it, so that I can track setup progress before the tournament.

#### Acceptance Criteria

1. THE Prep_Checklist SHALL display a banner with preparation day details: date (03 July 2026), venue (Sportanlage Grüngürtel), and start time (14:00)
2. THE Prep_Checklist SHALL display all setup items, each showing its label text and a checkbox indicator reflecting its current completion status (green checkmark when done, empty bordered box when not-done)
3. THE Prep_Checklist SHALL display a progress bar showing preparation completion percentage calculated as (completed items / total items × 100) rounded to the nearest integer
4. WHILE a Public_User views the Prep_Checklist, THE SPA SHALL display all checklist items in read-only mode; items SHALL NOT be clickable and SHALL display a "View only — log in to edit" notice
5. WHILE an Admin_User views the Prep_Checklist, WHEN the Admin_User clicks a checklist item, THE Prep_Checklist SHALL toggle the item completion status between done and not-done, apply visual indicators (strikethrough text and reduced opacity for done items), and update the progress bar percentage in real time
6. WHEN a checklist item completion status changes, THE API SHALL persist the updated status to the Database
7. IF the API fails to persist a checklist item status change, THEN THE Prep_Checklist SHALL display an error message indicating the save failed and revert the item to its previous completion status

### Requirement 6: Timeline Management

**User Story:** As an Organizer, I want to view event milestones, and as an Admin_User I want to track them, so that I can monitor preparation progress leading up to the tournament.

#### Acceptance Criteria

1. THE Timeline_View SHALL display all milestones in chronological order with icon, task description, and target date
2. THE Timeline_View SHALL display milestones in a vertical timeline layout with connecting line and dot indicators
3. WHILE a Public_User views the Timeline_View, THE SPA SHALL display all milestones in read-only mode; milestone items SHALL NOT be clickable and SHALL display a "View only — log in to edit" notice
4. WHILE an Admin_User views the Timeline_View, WHEN the Admin_User clicks a milestone, THE Timeline_View SHALL toggle the milestone completion status between done and not-done
5. WHEN a milestone is marked as done, THE Timeline_View SHALL apply visual indicators: filled green dot, strikethrough text, and 0.5 opacity; WHEN a milestone is marked as not-done, THE Timeline_View SHALL revert to default indicators: unfilled dot, normal text, and full opacity
6. WHEN a milestone completion status changes, THE API SHALL persist the updated status to the Database within 3 seconds
7. IF the API fails to persist a milestone status change, THEN THE Timeline_View SHALL revert the milestone to its previous completion state and display an error message indicating the save failed
8. THE Timeline_View SHALL display a progress bar showing milestone completion percentage calculated as (completed milestones / total milestones) × 100, rounded to the nearest whole number

### Requirement 7: Backend API

**User Story:** As an Organizer, I want my changes to persist across sessions, so that I do not lose progress when I close the browser.

#### Acceptance Criteria

1. THE API SHALL expose RESTful endpoints for reading and updating tasks, prep checklist items, and timeline milestones, and for reading teams
2. THE API SHALL run as AWS Lambda functions behind API Gateway
3. WHEN the SPA loads, THE API SHALL return all current data (tasks, teams, prep items, milestones) from the Database within 3 seconds
4. WHEN a completion status is toggled, THE API SHALL update the corresponding item in the Database and return the updated state within 2 seconds
5. IF the API receives a malformed request, THEN THE API SHALL return an HTTP 400 status code with an error message indicating the nature of the validation failure
6. IF the Database is unreachable, THEN THE API SHALL return an HTTP 503 status code with an error message indicating service unavailability
7. IF the API receives an update request for an item that does not exist in the Database, THEN THE API SHALL return an HTTP 404 status code with an error message indicating the item was not found

### Requirement 8: Data Storage

**User Story:** As an Organizer, I want tournament data stored reliably, so that information is not lost between sessions.

#### Acceptance Criteria

1. THE Database SHALL store volunteer tasks with fields: id (unique string, max 36 characters), name (string, max 100 characters), task description (string, max 500 characters), scheduled time (ISO 8601 date-time string), priority (one of: high, medium, low), and completion status (boolean: true for done, false for not-done)
2. THE Database SHALL store preparation checklist items with fields: id (unique string, max 36 characters), label (string, max 200 characters), and completion status (boolean: true for done, false for not-done)
3. THE Database SHALL store timeline milestones with fields: id (unique string, max 36 characters), icon (string, max 50 characters), task description (string, max 500 characters), target date (ISO 8601 date string), and completion status (boolean: true for done, false for not-done)
4. THE Database SHALL store team information with fields: id (unique string, max 36 characters), name (string, max 100 characters), icon (string, max 50 characters), color (string, max 30 characters), volunteer count (integer, 1 to 50), and assigned task list (list of task id references, max 20 entries)
5. THE Database SHALL use DynamoDB as the storage engine
6. WHEN a data write operation completes successfully, THE Database SHALL persist the data such that it is retrievable in subsequent read requests without loss or corruption
7. THE Database SHALL enforce uniqueness on the id field within each entity type (tasks, checklist items, milestones, teams)

### Requirement 9: Frontend Hosting and Deployment

**User Story:** As an Organizer, I want the application accessible via a web URL, so that I can use it from any device with a browser.

#### Acceptance Criteria

1. THE SPA SHALL be deployable as static assets (HTML, CSS, JavaScript) to an AWS S3 bucket configured for static website hosting with the index document set to index.html and the error document set to index.html to support client-side routing
2. THE SPA SHALL be servable through AWS CloudFront for content delivery
3. THE SPA SHALL be built with TypeScript and React
4. THE SPA SHALL use the color scheme defined in the existing HTML template CSS custom properties: --navy (#003893), --red (#DC143C), --gold (#FFD700), --dark (#0d0f1a), --card (#161928), --border (#232740), --text (#e8eaf0), --muted (#7a7f99), --success (#22c55e), --warn (#f59e0b)
5. THE SPA SHALL use the typography from the existing HTML template: 'Bebas Neue' for headings and large values, 'Barlow Condensed' for labels and navigation, and 'Barlow' as the base body font
6. WHEN an Organizer accesses the CloudFront URL, THE SPA SHALL load and render the application shell including the header, navigation tabs, and default view within 5 seconds on a standard broadband connection

### Requirement 10: Responsive Design

**User Story:** As an Organizer, I want to use the application on different screen sizes, so that I can manage the tournament from a phone or tablet on-site.

#### Acceptance Criteria

1. WHILE the viewport width is 700px or less, THE SPA SHALL switch the statistic cards from a 4-column grid to a 2-column grid, switch the two-column content sections and teams grid to a single-column layout, and reduce the main content padding from 28px to 16px
2. WHILE the viewport width is 420px or less, THE SPA SHALL maintain the statistic cards in a 2-column grid and reduce header and navigation padding proportionally to fit the narrower screen
3. WHILE the viewport width is less than the combined width of all navigation tabs, THE SPA SHALL enable horizontal scrolling on the navigation tab bar without wrapping tabs to a new line
4. THE SPA SHALL include a viewport meta tag set to device-width with initial scale of 1.0 to ensure proper rendering on mobile devices
5. THE SPA SHALL ensure all interactive elements (task items, checklist items, milestone items, navigation tabs) have a minimum touch-target size of 44×44 CSS pixels

### Requirement 11: Admin Authentication

**User Story:** As an Admin_User, I want to log in with a username and password, so that I can access protected features such as the volunteer entry form.

#### Acceptance Criteria

1. THE SPA SHALL display a "Login" button visible to unauthenticated users; WHEN clicked, THE SPA SHALL display a login modal containing a username field, a password field, and a submit button
2. WHEN an Admin_User submits valid credentials, THE SPA SHALL receive a session token from the API, store it in browser sessionStorage, close the login UI, and grant access to admin-only features without a full page reload
3. WHEN an Admin_User submits invalid credentials, THE SPA SHALL display an inline error message "Invalid username or password" and keep the login UI open
4. WHILE an Admin_User is authenticated, THE SPA SHALL display a visible logout control (e.g., a "Logout" button in the header)
5. WHEN an Admin_User clicks logout, THE SPA SHALL clear the session token from sessionStorage, revoke admin access, and navigate to the Overview tab
6. WHEN the API receives valid credentials, THE API SHALL return an HTTP 200 status code with a session token; IF the API receives invalid credentials, THEN THE API SHALL return an HTTP 401 status code with an error message
7. THE SPA SHALL persist the authenticated session using a token stored in browser sessionStorage so that the session survives tab refreshes but does not persist across browser sessions; IF the stored token is missing or invalid on page load, THEN THE SPA SHALL treat the user as unauthenticated
8. IF an unauthenticated user attempts to access an admin-only route or action, THEN THE SPA SHALL redirect the user to the login UI

### Requirement 12: Volunteer Entry Form (Admin Only)

**User Story:** As an Admin_User, I want to fill in a volunteer entry form, so that I can register volunteers with their availability and assigned tasks.

#### Acceptance Criteria

1. THE Volunteer_Form SHALL be accessible only to authenticated Admin_Users; IF an unauthenticated user attempts to open the form, THEN THE SPA SHALL redirect to the login UI
2. THE Volunteer_Form SHALL contain the following fields: volunteer name (text input, required, max 100 characters), availability checkboxes for Friday, Saturday, and Sunday (at least one day must be selected), and a task assignment multi-select (optional, 0–20 tasks from the Database)
3. WHEN an Admin_User submits the Volunteer_Form with all required fields valid, THE API SHALL persist the new volunteer entry to the Database within 2 seconds and THE SPA SHALL close the form and display the new entry in the Volunteer_View without a full page reload
4. WHEN an Admin_User submits the Volunteer_Form with the name field empty, THE SPA SHALL display an inline validation error "Name is required" next to the name field and prevent submission; WHEN no availability day is checked, THE SPA SHALL display an inline validation error "Select at least one day" next to the availability checkboxes and prevent submission
5. WHILE an Admin_User is authenticated and viewing the Volunteer_View, THE SPA SHALL display an "Add Volunteer" button that opens the Volunteer_Form
6. WHEN an Admin_User selects an existing volunteer entry for editing, THE Volunteer_Form SHALL pre-populate all fields with the current values of that entry; tasks deleted from the Database since the volunteer was last edited SHALL be omitted from the pre-populated task selector
7. WHEN an Admin_User submits an edited Volunteer_Form, THE API SHALL update the existing volunteer entry in the Database within 2 seconds and THE SPA SHALL reflect the updated values in the Volunteer_View within 1 second of the API response
8. IF the API fails to save a volunteer entry, THEN THE SPA SHALL display an error message indicating the save failed and keep the form open with the entered data intact

### Requirement 13: Volunteer Tab

**User Story:** As a Public_User or Admin_User, I want to view the list of registered volunteers with their availability and tasks, so that I can see who is helping and when.

#### Acceptance Criteria

1. THE Volunteer_View SHALL be accessible to all users (authenticated and unauthenticated) as a standard navigation tab
2. THE Volunteer_View SHALL display all registered volunteers in a tabular layout with the following columns: Volunteer Name (text), Friday (checkbox indicator, checked if available), Saturday (checkbox indicator, checked if available), Sunday (checkbox indicator, checked if available), and Tasks (comma-separated list of assigned task names)
3. WHEN the Volunteer_View is loaded, THE API SHALL retrieve all volunteer entries from the Database within 3 seconds and return each entry's name, available days, and assigned task list
4. WHEN there are no registered volunteers, THE Volunteer_View SHALL display a message "No volunteers registered yet"
5. WHILE a Public_User views the Volunteer_View, THE SPA SHALL display the volunteer table in read-only mode with no edit or delete controls visible
6. WHILE an Admin_User views the Volunteer_View, THE SPA SHALL display an "Add Volunteer" button and both an edit icon and a delete icon on each volunteer row
7. WHEN an Admin_User clicks the edit icon on a volunteer row, THE SPA SHALL open the Volunteer_Form pre-populated with that volunteer's data
8. WHEN an Admin_User confirms deletion of a volunteer entry, THE API SHALL remove the entry from the Database and THE Volunteer_View SHALL remove the row without a full page reload
9. WHEN an Admin_User clicks the delete icon on a volunteer row, THE SPA SHALL display a confirmation dialog containing a confirm button and a cancel button; WHEN the Admin_User clicks cancel, THE SPA SHALL close the dialog and take no further action
10. WHEN volunteer data changes (add, edit, delete), THE Volunteer_View SHALL reflect the updated data within 1 second without requiring a full page reload
11. IF the API fails to delete a volunteer entry, THEN THE Volunteer_View SHALL display an error message indicating the deletion failed and keep the row visible
12. IF the API fails to retrieve volunteer data on load, THEN THE Volunteer_View SHALL display an error message indicating that volunteer information is unavailable

### Requirement 14: Volunteer Data Storage

**User Story:** As an Admin_User, I want volunteer data stored reliably, so that registrations are not lost between sessions.

#### Acceptance Criteria

1. THE Database SHALL store volunteer entries with fields: id (unique string, max 36 characters), name (string, max 100 characters), available days (set of values from: Friday, Saturday, Sunday; at least one value required), and assigned tasks (list of task id references, minimum 0 entries, maximum 20 entries)
2. THE Database SHALL enforce uniqueness on the id field for volunteer entries
3. WHEN a volunteer write operation completes successfully, THE Database SHALL persist the data such that it is retrievable in subsequent read requests without loss or corruption
4. THE API SHALL expose RESTful endpoints for creating, reading, updating, and deleting volunteer entries (POST /volunteers, GET /volunteers, PUT /volunteers/{id}, DELETE /volunteers/{id})
5. IF the API receives a request to update or delete a volunteer entry that does not exist, THEN THE API SHALL return an HTTP 404 status code with an error message indicating the volunteer was not found

### Requirement 15: Public Volunteer Self-Registration Form

**User Story:** As a Public_User, I want to register myself as a volunteer without needing to log in, so that I can sign up to help at the tournament directly from the website.

#### Acceptance Criteria

1. THE Volunteer_Register SHALL be accessible to all users (authenticated and unauthenticated) as a dedicated "Register" navigation tab; no login is required to view or submit the form
2. THE Volunteer_Register SHALL contain the following fields: full name (text input, required, max 100 characters), email address (text input, required, max 200 characters, must match a valid email format), phone number (text input, optional, max 30 characters), city (text input, optional, max 100 characters), availability checkboxes for Friday 3 July, Saturday 4 July, and Sunday 5 July (at least one day must be selected), and additional notes (textarea, optional, max 500 characters)
3. WHEN a Public_User submits the Volunteer_Register with all required fields valid, THE API SHALL persist the registration to the Database and THE SPA SHALL display a success confirmation message without a full page reload
4. WHEN a Public_User submits the Volunteer_Register with the name field empty, THE SPA SHALL display an inline validation error "Full name is required" and prevent submission; WHEN the email field is empty or invalid, THE SPA SHALL display an inline validation error "Please enter a valid email address" and prevent submission; WHEN no availability day is checked, THE SPA SHALL display an inline validation error "Please select at least one day" and prevent submission
5. WHEN the Volunteer_Register is successfully submitted, THE SPA SHALL display a confirmation screen with the message "Thank you for signing up!" and an option to submit another registration; THE SPA SHALL NOT require the user to log in at any point during this flow
6. IF the API fails to save the registration, THEN THE SPA SHALL display an error message indicating the submission failed and keep the form open with all entered data intact
7. THE Volunteer_Register SHALL display a banner showing the event name, venue (Sportanlage Grüngürtel, Berlin), and dates (3–5 July 2026) to give context to the person registering
8. THE Volunteer_Register SHALL display a character counter for the notes field showing current length out of the 500-character maximum
9. THE Volunteer_Register SHALL be fully functional on mobile devices, with all fields and the submit button meeting the minimum 44×44 CSS pixel touch-target size

### Requirement 16: Admin-Only Write Access Across All Editable Views

**User Story:** As a system administrator, I want all data-modifying actions across the application to require admin authentication, so that public users can view tournament information without accidentally or maliciously changing it.

#### Acceptance Criteria

1. THE SPA SHALL enforce admin-only write access on the following views: Task Board (task completion toggles), Prep Day (checklist item toggles), and Timeline (milestone completion toggles); the Volunteer_View (add, edit, delete volunteer entries) is already covered by Requirement 12 and 13
2. WHILE a Public_User views any of the admin-gated views (Task Board, Prep Day, Timeline, Volunteer_View), THE SPA SHALL display a visible "View only — log in to edit" notice within the view, and all interactive toggle controls SHALL be visually and functionally disabled
3. WHILE an Admin_User is authenticated and views any of the admin-gated views, THE SPA SHALL display all interactive controls as fully enabled with no read-only notice
4. WHEN a Public_User clicks or taps on a disabled interactive element in an admin-gated view, THE SPA SHALL take no action (no toggle, no API call, no error message)
5. THE "View only — log in to edit" notice SHALL include a clickable "log in" link that opens the admin login modal directly, without navigating away from the current view
6. WHEN an Admin_User logs out while viewing an admin-gated view, THE SPA SHALL immediately switch that view to read-only mode and display the "View only — log in to edit" notice without a page reload
7. THE Volunteer_Register tab SHALL be explicitly excluded from admin-only write access; any user may submit the public registration form regardless of authentication state
8. THE Overview tab and Teams tab SHALL remain fully read-only for all users (no toggles exist on those views) and SHALL NOT display the "View only — log in to edit" notice
