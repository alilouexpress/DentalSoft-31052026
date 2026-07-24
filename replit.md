# DentalSoft - Clinic Management System

## Overview

DentalSoft is a comprehensive dental practice management system built as a full-stack web application. It provides features for managing appointments, patient records, doctor information, treatments, lab work, billing, and analytics for dental clinics and hospitals.

The application is designed to streamline clinical operations by providing a centralized platform for scheduling, patient management, electronic health records, payment tracking, and reporting - replacing the need for multiple separate systems.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18 with TypeScript for the UI framework
- Vite as the build tool and development server
- Wouter for client-side routing (lightweight alternative to React Router)
- TanStack Query (React Query) for server state management and data fetching
- Shadcn UI component library built on Radix UI primitives
- Tailwind CSS for styling with custom design tokens
- Recharts for data visualization and analytics charts

**Design Patterns:**
- Component-based architecture with shared UI components in `/client/src/components/ui`
- Custom hooks pattern for API interactions (`use-api.ts`) and reusable logic
- Layout wrapper pattern for consistent page structure with sidebar navigation
- Query-based data fetching with automatic caching and invalidation
- Form validation using React Hook Form with Zod schema resolvers

**Key Features:**
- Responsive design with mobile-first approach
- Dashboard with statistics and charts
- Calendar-based appointment scheduling interface
- Patient management with search and filtering
- Modular page-based routing structure

### Backend Architecture

**Technology Stack:**
- Node.js with Express.js for the REST API server
- TypeScript for type safety across the stack
- Drizzle ORM for database operations with PostgreSQL
- Neon serverless PostgreSQL database
- Zod for runtime validation and schema generation

**Design Patterns:**
- Storage abstraction layer (`DatabaseStorage` class) separating database logic from routes
- Centralized route registration in `registerRoutes` function
- Schema-first approach with shared types between client and server
- Validation at API boundaries using Zod schemas
- Static file serving for production builds

**API Structure:**
- RESTful endpoints following resource-based conventions
- Endpoints for patients (`/api/patients`), doctors, appointments, and dashboard stats
- CRUD operations with proper HTTP methods (GET, POST, PATCH, DELETE)
- JSON request/response format
- Error handling with appropriate HTTP status codes

### Data Storage

**Database:**
- PostgreSQL database hosted on Neon serverless platform
- Drizzle ORM for type-safe database queries and migrations
- Schema defined in `/shared/schema.ts` for sharing between client and server

**Schema Design:**
- `users` table for authentication (username/password)
- `doctors` table with specialization, contact info
- `patients` table with demographic info, status, balance, unique patient ID
- `appointments` table linking patients and doctors with date/time/status
- Relations configured between tables for joins

**Migration Strategy:**
- Drizzle Kit for schema migrations
- Push-based deployment (`db:push` script)
- Migrations stored in `/migrations` directory

### Build and Deployment

**Development Mode:**
- Vite dev server on port 5000 for client with HMR
- Express server with TypeScript execution via `tsx`
- Separate dev scripts for client and server

**Production Build:**
- Custom build script using esbuild for server bundling
- Vite build for client static assets
- Server dependencies selectively bundled to reduce cold start time
- Output to `/dist` directory with separate public and server bundles
- Single production server serving both API and static files

**Environment:**
- Environment variable `DATABASE_URL` required for database connection
- Node environment (`NODE_ENV`) switches between dev/production behavior
- Replit-specific integrations via vite plugins for development

## External Dependencies

### Third-Party Services

**Database:**
- Neon Serverless PostgreSQL (`@neondatabase/serverless`) - Serverless PostgreSQL database with WebSocket support for edge deployments

**UI Component Libraries:**
- Radix UI - Headless UI primitives for accessible components (accordion, dialog, dropdown, etc.)
- Shadcn UI - Pre-built component library built on Radix UI
- Lucide React - Icon library

**Data Visualization:**
- Recharts - Composable charting library for React

**Development Tools:**
- Replit-specific Vite plugins for development experience (cartographer, dev banner, runtime error modal)
- Custom meta images plugin for OpenGraph image handling

### Key NPM Packages

**Core Framework:**
- `react` & `react-dom` - UI framework
- `express` - Web server framework
- `vite` - Build tool and dev server
- `drizzle-orm` - Database ORM
- `@tanstack/react-query` - Data fetching and caching

**Validation & Schemas:**
- `zod` - Schema validation library
- `drizzle-zod` - Zod schema generation from Drizzle schemas
- `@hookform/resolvers` - Form validation resolvers

**Utilities:**
- `date-fns` - Date manipulation
- `clsx` & `tailwind-merge` - Class name utilities
- `class-variance-authority` - Component variant management
- `nanoid` - Unique ID generation

**TypeScript Tooling:**
- `tsx` - TypeScript execution for development
- `esbuild` - Fast JavaScript bundler for production