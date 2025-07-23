# Presens Attendance System

A modern, full-stack attendance management system built with Next.js and Supabase. Designed for organizations and teams to efficiently track, analyze, and manage employee attendance, work modes, and analytics—all with a beautiful, responsive UI.

## 🚀 Features

- **Comprehensive Attendance Tracking:**  
  Record clock-in/out times, attendance remarks, and work modes (e.g., office, remote, leave) with ease.

- **Employee Analytics & Summaries:**  
  Visualize attendance trends, daily work hours, and all-time summaries with interactive charts and dashboards.

- **Role-Based Access Control:**  
  Secure, policy-driven access for different user roles (e.g., admin, employee).

- **User Management:**  
  Self-service sign-up, password management, and account settings.

- **Public Holidays & Leave Management:**  
  Integrated public holiday calendar and leave status tracking.

- **Data Export:**  
  Export attendance and summary data in CSV format for reporting or analysis.

## 🏗️ Getting Started

### 1. Prerequisites

- Node.js (v18+ recommended)
- A Supabase project ([create one here](https://database.new))

### 2. Clone the Repository

```bash
git clone https://github.com/hadreemustaffa/presens.git
cd presens
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create `.env.local` and fill in your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

You can find these in your Supabase project dashboard under API settings.

### 5. Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the app.

### 6. Set Up the Database

- Run the SQL migrations in `supabase/migrations/` using the Supabase SQL editor or CLI.
- Seed initial data (e.g., public holidays, roles) from `supabase/seeds/`.

## 📝 Project Structure

- `src/app/` — Next.js app routes and pages
- `src/features/attendance/` — Attendance records, summaries, analytics
- `src/features/users/` — User management
- `src/components/` — UI components (forms, tables, charts, etc.)
- `supabase/` — Database migrations, seeds, and configuration

## 📦 Tech Stack

- **Frontend:** Next.js, React, Tailwind CSS, shadcn/ui
- **Backend:** Supabase (Postgres, Auth, Edge Functions)
- **Testing:** Vitest
- **Linting/Formatting:** ESLint, Prettier
