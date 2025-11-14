# CoFounder Hub - Marketplace Platform

A comprehensive co-founders collaboration marketplace where founders can create profiles, browse projects, apply to open positions, and track revenue together.

## Features

### Core Functionality
- **User Authentication**: Sign up, login with Supabase Auth (mock for demo)
- **Profile Management**: Create and edit detailed founder profiles with skills, experience, and portfolio
- **Project Creation**: Post projects with multiple open positions
- **Browse & Search**: Discover projects by category with advanced filtering
- **Application System**: Apply to positions with cover letters, track status (pending/accepted/rejected)
- **Team Management**: Project owners review applications and build teams
- **Portfolio Generation**: Automatic CV showing all projects and roles
- **Review System**: Rate and review co-founders after collaboration
- **MRR Dashboard**: Track Monthly Recurring Revenue with Stripe integration (mock data for demo)

### Current Status
This is a **fully functional frontend** with mock data. The backend integration is structured and ready for Supabase connection.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Charts**: Recharts
- **Icons**: Lucide React
- **Backend (Ready for Integration)**: Supabase (Auth, Database, Edge Functions)
- **Payments (Ready for Integration)**: Stripe API

## Quick Start

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm

### Installation

1. Clone and install dependencies:
```bash
cd cofounder-marketplace
pnpm install
```

2. Start development server:
```bash
pnpm dev
```

3. Open your browser to `http://localhost:5173`

### Demo Accounts

The platform includes mock data with pre-populated users. Use any of these emails with any password:
- sarah.chen@email.com (Full-stack developer)
- marcus.williams@email.com (Product designer)
- lisa.martinez@email.com (Growth marketer)
- david.kim@email.com (Mobile developer)
- emma.johnson@email.com (Serial entrepreneur)

## Project Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI components (Button, Card, StarRating, etc.)
│   └── shared/       # Shared components (Navbar, ProjectCard, etc.)
├── contexts/
│   └── AuthContext.tsx    # Authentication context
├── data/
│   └── mockData.ts        # Mock data for demonstration
├── pages/
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   ├── HomePage.tsx
│   ├── ProfilePage.tsx
│   ├── BrowseProjectsPage.tsx
│   ├── ProjectDetailPage.tsx
│   ├── MyProjectsPage.tsx
│   ├── CreateProjectPage.tsx
│   ├── ApplicationsManagementPage.tsx
│   ├── MyApplicationsPage.tsx
│   └── MRRDashboardPage.tsx
├── services/
│   └── api.ts             # API service layer (ready for Supabase)
├── types/
│   └── index.ts           # TypeScript type definitions
├── App.tsx                # Main app with routing
└── main.tsx               # Entry point
```

## Integrating Supabase Backend

The application is structured to easily integrate with Supabase. Follow these steps:

### 1. Install Supabase Client

```bash
pnpm add @supabase/supabase-js
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get your API keys from Project Settings > API

### 3. Set Up Environment Variables

Create `.env.local`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Create Supabase Client

Create `src/services/supabaseClient.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 5. Database Schema

Execute the following SQL in your Supabase SQL Editor:

```sql
-- See docs/database-schema.sql for complete schema
```

### 6. Update API Service

In `src/services/api.ts`:
1. Uncomment the Supabase import at the top
2. Replace mock data calls with actual Supabase queries (marked with TODO comments)
3. Each service function has detailed TODO comments showing the exact Supabase query needed

### 7. Update Auth Context

In `src/contexts/AuthContext.tsx`:
- Replace mock auth with `supabase.auth.signInWithPassword()`, `signUp()`, etc.
- Add auth state listener: `supabase.auth.onAuthStateChange()`

## Stripe Integration for MRR Tracking

### Overview
The MRR Dashboard currently shows mock data. To track real revenue:

### 1. Set Up Stripe

1. Create a Stripe account
2. Get your API keys (test mode for development)
3. Add to Supabase secrets

### 2. Create Stripe Webhook Edge Function

Create `supabase/functions/stripe-webhook/index.ts`:
```typescript
// Handles subscription events from Stripe
// On customer.subscription.created/updated/deleted:
//   - Calculate MRR
//   - Insert/update mrr_data table
```

### 3. Configure Webhook

1. In Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://your-project.supabase.co/functions/v1/stripe-webhook`
3. Subscribe to events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

### 4. Test Integration

Use Stripe CLI for local testing:
```bash
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook
```

## Mock Data

The platform includes comprehensive mock data:
- **5 Users**: Diverse roles (developers, designers, marketers, entrepreneurs)
- **4 Projects**: Different categories with open positions
- **6 Positions**: Various roles (technical, product, growth)
- **5 Applications**: Different statuses
- **6 Project Members**: Active collaborations
- **4 Reviews**: Peer feedback with ratings
- **18 MRR Data Points**: Revenue tracking across projects

## Available Scripts

```bash
# Development
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm lint         # Run ESLint
```

## Features Walkthrough

### 1. Authentication
- Mock login with any email from the demo accounts
- Sign up creates new user (stored in mock data)

### 2. Dashboard
- Overview of projects, applications, and MRR
- Quick stats and recent activity
- Quick actions for common tasks

### 3. Profile Management
- Edit personal information, bio, experience
- Add/remove skills
- View automatic portfolio of all projects
- Display peer reviews and ratings

### 4. Browse Projects
- Search and filter open positions
- View by category
- See project details and requirements

### 5. Project Management
- Create projects with multiple positions
- Edit project details
- Review applications
- Accept/reject applicants (auto-adds to team)

### 6. Applications
- Apply with cover letter
- Track application status
- View applicant profiles with full context

### 7. MRR Dashboard
- View revenue across all projects
- Track monthly growth
- Individual project charts
- Ready for Stripe integration

## Design Decisions

### Architecture
- **SPA with React Router**: Client-side routing for smooth navigation
- **Service Layer Pattern**: Clean separation between UI and data (easy to swap mock data for real API)
- **Context API for Auth**: Simple, built-in state management for authentication

### UI/UX
- **Professional Aesthetic**: Trustworthy design for business founders
- **Clean Cards**: Easy scanning of projects and profiles
- **Clear Status Indicators**: Color-coded application statuses
- **Responsive Design**: Works on desktop and mobile

### Code Organization
- **Modular Components**: Reusable UI components
- **Type Safety**: Full TypeScript coverage
- **Clear Comments**: Every integration point documented with TODO

## Next Steps for Production

1. **Set up Supabase**:
   - Create database tables
   - Enable Row Level Security (RLS)
   - Configure authentication

2. **Integrate Stripe**:
   - Set up subscription products
   - Create webhook handler
   - Test payment flow

3. **Add Features**:
   - Email notifications
   - File upload for portfolios/documents
   - Direct messaging between founders
   - Project milestones and progress tracking
   - Advanced search with saved filters
   - Recommendation engine

4. **Security**:
   - Enable RLS policies
   - Input validation
   - Rate limiting
   - XSS protection

5. **Performance**:
   - Image optimization
   - Code splitting
   - Caching strategies
   - CDN for static assets

## Support & Documentation

- **Database Schema**: See `docs/database-schema.sql`
- **API Integration Guide**: See `docs/api-integration.md`
- **Supabase Setup**: See `docs/supabase-setup.md`

## License

MIT License - See LICENSE file for details

## Contributing

Contributions welcome! Please read CONTRIBUTING.md for guidelines.
