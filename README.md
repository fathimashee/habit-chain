# Habit Chain (Phase 1 MVP)

> **Your chain of consistent learning, all in one place.**

A centralized, responsive, and secure web application designed to give students structured academic access to study materials, previous year question papers, lab manuals, and source code.

---

## 🚀 Core Features (Phase 1 MVP)

### Student Portal (Public Access)
1. **Home Page**: Hero section with soft white-to-teal-tint gradient, latest active announcements, quick links to Semesters, Lab Resources, Question Papers, and recently added materials.
2. **Hierarchical 4-Click Navigation**:
   - **Click 1**: Browse Semesters (`/semesters`)
   - **Click 2**: Choose Subject (`/semesters/:id`) with resource counts
   - **Click 3**: Select Module or Subject Section (`/subjects/:id`)
   - **Click 4**: View / Download Resource (`/modules/:id`)
3. **In-Browser PDF Viewer**: Preview notes and papers directly inside the browser (`/resources/:id/view`) or trigger controlled attachment downloads (`/resources/:id/download`).
4. **Laboratory Resources**: Dedicated practical section (`/lab`) grouped by subject for lab manuals and programming exercises.
5. **Previous Year Question Papers**: Dedicated section (`/question-papers`) with filtering by subject and examination year.
6. **Announcements**: Public notice board (`/announcements`) with automatic filtering of expired circulars.
7. **Feedback & Contact**: Public forms with server-side validation (`express-validator`), rate-limiting, and CSRF protection.
8. **Responsive & Accessible**: Clean White & Teal Bootstrap 5 UI, WCAG AA contrast, skip-to-content accessibility link, keyboard navigation.

### Admin Dashboard (Protected Area)
1. **Secure Authentication**: Express session-based login (`/admin/login`), bcrypt password hashing, session timeout, and rate-limited login attempts.
2. **Academic Structure CRUD**: Full management of Semesters, Subjects, and Modules with foreign key safeguards.
3. **Resource Upload & Management**: Upload files with Title, Subject, Module, Resource Type, and Exam Year. Edit metadata, replace underlying files on disk, or delete resources.
4. **Announcements Manager**: Create notices with optional automated expiry dates and active publish toggles.
5. **Communications Inbox**: View incoming student feedback and contact requests, mark messages as read, or delete entries.

---

## 🎨 Visual Identity & Color Theme
- **Brand**: Habit Chain
- **Tagline**: *"Your chain of consistent learning, all in one place."*
- **Typography**: 
  - Headings: **Plus Jakarta Sans** (weights 600, 700)
  - Body & UI: **Inter** (weights 400, 500, 600)
- **Palette**:
  - `--color-primary`: `#0F9D9A` (Teal)
  - `--color-primary-dark`: `#0B7A78` (Hover / Active)
  - `--color-primary-light`: `#E6F7F6` (Tinted backgrounds, badges)
  - `--color-accent`: `#14B8A6` (Highlights, icons)
  - `--color-bg`: `#FFFFFF`
  - `--color-surface`: `#F7FBFB` (Cards, sidebars)
  - `--color-border`: `#D9ECEB`
  - `--color-text`: `#12303A`
  - `--color-text-muted`: `#5B7580`

---

## ⚙️ Environment Variables

Create a `.env` file in the project root (see `.env.example`):

```ini
PORT=3000
NODE_ENV=development
SESSION_SECRET=dev_session_secret_habit_chain_platform_key_12345
DB_PATH=./db/database.sqlite
ADMIN_NAME="System Administrator"
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=AdminPassword123!
MAX_FILE_SIZE_MB=25
UPLOAD_DIR=./uploads
```

---

## 📦 Setup & Installation

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Migrations & Seed Initial Content**:
   ```bash
   npm run seed
   ```

3. **Start the Application**:
   ```bash
   npm start
   ```
   Open your browser to:
   - **Student Portal**: [http://localhost:3000](http://localhost:3000)
   - **Admin Dashboard**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

---

## 🧪 Automated Testing

Run the full automated test suite:

```bash
npm test
```

---

## 📖 Admin User Guide

### 1. Logging In
- Navigate to `/admin/login` or click **Admin** in the navigation bar.
- Default credentials (configured in `.env`):
  - **Email**: `admin@example.com`
  - **Password**: `AdminPassword123!`

### 2. Managing Content
- Manage academic hierarchy under Semesters, Subjects, and Modules.
- Upload learning documents in `.pdf`, `.docx`, `.pptx`, `.zip`, `.c`, `.cpp`, `.java`, `.py`, `.txt`, `.sql` formats up to 25MB.
