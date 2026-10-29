Feature Breakdown Document
Project: Web-Based Educational Platform for Centralized Academic Resources Document
type: Feature Breakdown Version: 1.0
1. Overview
This document breaks the platform into modules, features and user stories, with
priorities, acceptance criteria and release phases. It is meant to be the working checklist
for development and testing.
Priority key: P1 = Must have (Phase 1 MVP), P2 = Should have (Phase 2), P3 = Could have /
future (Phase 3 and beyond).
2. Feature Map
3. Module A: Student Portal
A1. Home Page (P1)
Hero section with platform name and short description
Quick links to semesters, lab resources, question papers
Module 	Features
A. Student Portal 	Home, content browsing, resource viewing and
download, lab section, question papers,
announcements, feedback, contact, search, filters
B. Admin Dashboard 	Authentication, structure management, resource
management, announcements, feedback inbox,
dashboard overview, settings
C. Platform Services 	File handling, validation, security, notifications,
backups
D. Future Enhancements Advanced search, video lectures, discussion
forums, AI assistant, student accounts
Feature Breakdown Document – Educational Resource Platform
Page 1 of 8

-- 1 of 8 --

Latest announcements panel
Recently added resources list
Acceptance: Home page loads under 3 seconds and links reach every main section.
A2. Hierarchical Content Browsing (P1)
Semester list → Subject list → Module list → Resource list
Breadcrumb navigation and back links
Subject cards showing code, name and resource count
User story: As a student, I want to open my semester and subject so that I can find my
syllabus modules quickly.
Acceptance: Any resource is reachable within 4 clicks from the home page.
A3. Resource Viewing and Download (P1)
In-browser PDF viewer
Download button for PDF, DOCX, PPTX, ZIP and code files
Metadata display: title, type, upload date, file size
User story: As a student, I want to preview a file before downloading so that I do not
waste data on the wrong document.
Acceptance: PDFs open in the viewer; all supported formats download with the
correct file name.
A4. Laboratory Resources (P1)
Lab section organized by subject
Lab manuals, experiment lists, sample programs and output screenshots
Source code files downloadable individually or as a ZIP
Acceptance: Each lab subject shows its manual and programs in a clear list.
A5. Previous Year Question Papers (P1)
Papers grouped by subject and exam year
Filter by year and exam type (internal, university)
Acceptance: A student can open the latest paper for a subject in at most 3 clicks.
Feature Breakdown Document – Educational Resource Platform
Page 2 of 8

-- 2 of 8 --

A6. Announcements (P1)
Announcement list on the home page and a dedicated page
New items highlighted; expired items hidden automatically
Acceptance: Published announcements appear immediately and expired ones
disappear.
A7. Feedback Form (P1)
Fields: name, email, category (content, bug, suggestion, other), message, optional
rating
Validation and success confirmation
Spam protection (CAPTCHA or rate limit)
Acceptance: Valid submissions are stored and visible to the admin; invalid ones show
clear error messages.
A8. Contact Administrator (P1)
Contact form with name, email, subject and message
Optional display of admin contact email
Acceptance: Submitted messages appear in the admin inbox.
A9. Basic Search (P2)
Search box in the header
Matches title, subject name, subject code and keywords
Results grouped by subject with type labels
Acceptance: Searching a subject code returns its resources first.
A10. Filters and Sorting (P2)
Filter by resource type, year and format
Sort by newest, title or most downloaded
A11. Responsive and Accessible Design (P1)
Mobile-first layout, large tap targets
Readable contrast, alt text and keyboard navigation
Light and dark mode (P3)
Feature Breakdown Document – Educational Resource Platform
Page 3 of 8

-- 3 of 8 --

A12. Static Pages (P2)
About, help or FAQ, privacy note, terms of use and copyright or takedown notice
4. Module B: Admin Dashboard
B1. Secure Authentication (P1)
Login and logout, password hashing, session timeout
Lockout or delay after repeated failed attempts
Password change (P2) and password reset by email (P3)
Acceptance: Any /admin page redirects to login when unauthenticated.
B2. Academic Structure Management (P1)
Add, edit, delete and reorder semesters, subjects and modules
Warning before deleting items that contain resources
User story: As an admin, I want to create a new subject and its modules so that
resources can be uploaded under it.
B3. Resource Management (P1)
Upload form: title, description, semester, subject, module, type, year, file
Edit metadata, replace file, delete
Publish or unpublish toggle (P2)
Multiple file upload (P2) and bulk upload via ZIP or CSV mapping (P3)
Acceptance: A valid upload is visible on the student side immediately after publishing;
invalid files are rejected with a clear message.
B4. Announcement Management (P1)
Create, edit, delete and set expiry date
Pin an important announcement (P2)
B5. Feedback and Message Inbox (P1)
List with unread indicator, view details, mark read, delete
Filter by category and date (P2)
Feature Breakdown Document – Educational Resource Platform
Page 4 of 8

-- 4 of 8 --

Export to CSV (P3)
B6. Dashboard Overview (P2)
Counts: total resources, subjects, unread messages
Recent uploads and recent feedback
Download statistics per resource (P3)
B7. Admin Accounts and Roles (P3)
Multiple admins with roles: super admin and content admin
Activity log of uploads and deletions
5. Module C: Platform Services
ID 	Feature 	Priority Notes
C1 	File validation (type, size, safe
naming)
P1 	Allow-list of formats, size cap such
as 25 MB
C2 Database persistence and
migrations
P1 	Versioned schema changes
C3 	Input sanitization, CSRF and XSS
protection
P1 	Applied to all forms
C4 HTTPS and secure configuration 	P1 	Production requirement
C5 	Error pages (404, 500) and logging 	P1 	Friendly messages for users
C6 	Automated backups 	P2 	Daily database, weekly files
C7 	Email notifications to admin 	P3 	On new feedback or message
C8 	Download counter 	P3 	Increment on each download
C9 	Basic analytics 	P3 	Page views and popular resources
Feature Breakdown Document – Educational Resource Platform
Page 5 of 8

-- 5 of 8 --

6. Module D: Future Enhancements
ID 	Feature 	Description 	Dependencies
D1 	Advanced search 	Full-text search inside
documents, typo tolerance,
suggestions
PDF text extraction,
search engine
D2 	Video lectures 	Video entries per module,
embedded or hosted
Video hosting or object
storage
D3 	Discussion forums 	Subject-wise threads, replies,
moderation
Student accounts,
moderation tools
D4 AI academic assistant Answer questions and
summarize notes using the
platform's resources
Indexed content, LLM
API, usage limits
D5 	Student accounts 	Bookmarks, recent activity,
personalized dashboard
Authentication expansion
D6 	Ratings and
comments on
resources
Students rate material quality 	Student accounts
D7 	Mobile app or PWA 	Offline access to downloaded
material
Stable API
D8 	Syllabus and exam
timetable pages
Central academic reference 	Content from institution
Feature Breakdown Document – Educational Resource Platform
Page 6 of 8

-- 6 of 8 --

7. Release Scope Summary
8. Feature Dependencies
Resource upload (B3) depends on academic structure (B2).
Student browsing (A2–A5) depends on published resources from B3.
Search (A9) depends on stable metadata fields in the Resource entity.
Forums (D3) and bookmarks (D5) depend on student accounts.
The AI assistant (D4) depends on advanced search or an indexed content store (D1).
9. Non-Functional Features Checklist
Release 	Included features
MVP (Phase 1) A1–A8, A11, B1–B5, C1–C5
Phase 2 	A9, A10, A12, B6, publish toggle, multi-upload, C6,
password change
Phase 3 	B7, C7–C9, bulk upload, dark mode, CSV export
Future 	D1–D8
Area 	Target
Performance 	Pages under 3 seconds, paginated lists
Security 	Hashed passwords, validated uploads, HTTPS
Compatibility 	Latest Chrome, Firefox, Edge and Safari; Android
and iOS browsers
Accessibility 	WCAG 2.1 AA basics
Maintainability Modular code, README, commented critical logic
Feature Breakdown Document – Educational Resource Platform
Page 7 of 8

-- 7 of 8 --

10. Testing Focus per Module
11. Definition of Done (per feature)
Meets acceptance criteria listed above
Code reviewed and merged to main branch
Unit and basic integration tests pass
Works on desktop and mobile
No open critical or high-severity bugs
Documented in the README or user guide where relevant
Module 	Key tests
Student portal 	Navigation paths, PDF view, downloads of each
format, form validation, mobile layout
Admin dashboard Login protection, CRUD on structure and
resources, oversize and wrong-type upload
rejection
Platform services SQL injection and XSS attempts, CSRF checks,
backup restore test
Integration 	Upload as admin then find and download as
student; announcement lifecycle
Feature Breakdown Document – Educational Resource Platform
Page 8 of 8

-- 8 of 8 --

