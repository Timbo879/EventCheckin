# Event Check-in System

## Overview

This is a full-stack event check-in application built with React, Express, and PostgreSQL. The system allows users to create events, generate QR codes for check-ins, and manage attendee check-ins through a web interface. It features both public check-in functionality and password-protected admin dashboards.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Style**: RESTful API design
- **Development**: Hot reloading with Vite middleware integration

### Data Storage Solutions
- **Database**: PostgreSQL with Neon serverless integration
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations
- **Fallback**: In-memory storage implementation for development

## Key Components

### Database Schema (shared/schema.ts)
- **Events Table**: Stores event information with optional password protection
- **Check-ins Table**: Records employee check-ins linked to events
- **Validation**: Zod schemas for runtime type checking and validation

### API Endpoints (server/routes.ts)
- `POST /api/events` - Create new events
- `GET /api/events/:id` - Retrieve event by ID
- `GET /api/events/by-name/:name` - Retrieve event by name
- Event-specific check-in and admin routes

### Frontend Pages
- **Home**: Event creation with form validation
- **QR Display**: Shows generated QR codes for events
- **Check-in**: Public interface for employee check-ins
- **Admin Login**: Password-protected admin access
- **Admin Dashboard**: Event management and check-in monitoring

### UI Components
- Comprehensive shadcn/ui component library
- Custom loading overlays and form components
- Responsive design with mobile-first approach

## Data Flow

1. **Event Creation**: Admin creates event through form → API stores in database → QR code generated
2. **Check-in Process**: Employee scans QR → Redirected to check-in page → Enters employee ID → Recorded in database
3. **Admin Monitoring**: Admin accesses dashboard → Views real-time check-in data → Can export CSV reports

## External Dependencies

### Frontend Libraries
- **UI Framework**: React with extensive Radix UI component ecosystem
- **Styling**: Tailwind CSS with class-variance-authority for component variants
- **Data Fetching**: TanStack Query for caching and synchronization
- **QR Codes**: QRCode library for generating scannable codes
- **Date Handling**: date-fns for date manipulation
- **Icons**: Lucide React icon library

### Backend Libraries
- **Database**: Neon serverless PostgreSQL with Drizzle ORM
- **Validation**: Zod for schema validation across client and server
- **Session Management**: Connect-pg-simple for PostgreSQL session storage

### Development Tools
- **Type Checking**: TypeScript with strict configuration
- **Build Tools**: Vite with React plugin and esbuild for production
- **Development**: tsx for TypeScript execution and hot reloading

## Deployment Strategy

### Build Process
- Frontend: Vite builds React app to `dist/public`
- Backend: esbuild bundles Express server to `dist/index.js`
- Single production command serves both frontend and API

### Environment Configuration
- Database URL required for PostgreSQL connection
- Development and production modes with different optimizations
- Replit-specific plugins for development environment integration

### Database Management
- Drizzle Kit handles schema migrations
- PostgreSQL dialect with connection pooling
- Migration files stored in `./migrations` directory

The application follows a monorepo structure with shared TypeScript types and validation schemas, enabling type safety across the entire stack while maintaining clear separation between frontend and backend concerns.