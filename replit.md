# B-Here - Event Check-in System

## Overview

B-Here is a streamlined event check-in application built with React, Express, and PostgreSQL designed specifically for charity events. The system allows organizers to create events, generate QR codes for check-ins, and manage employee check-ins through a mobile-first web interface. It features data minimization (only 6-digit employee IDs), duplicate check-in prevention, date validation for future events only, and an open admin dashboard for viewing all events and exporting CSV data.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- **September 23, 2025**: Added employee ID validation to prevent "000000" check-ins
- **August 3, 2025**: Complete rebrand to "B-Here" throughout the application
- **August 3, 2025**: Removed all password protection - admin dashboard now open access
- **August 3, 2025**: Added duplicate check-in prevention with friendly error messages
- **August 3, 2025**: Implemented date validation - events can only be created for today/future dates
- **August 3, 2025**: Redesigned admin dashboard to show all events in organized sections
- **App Status**: Fully functional B-Here system with enhanced user experience

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
- **Events Table**: Stores event information (password fields retained for backwards compatibility)
- **Check-ins Table**: Records employee check-ins linked to events with duplicate prevention
- **Validation**: Zod schemas with date validation and employee ID format checking
- **Duplicate Prevention**: Server-side validation prevents same employee checking in twice per event

### API Endpoints (server/routes.ts)
- `POST /api/events` - Create new events
- `GET /api/events/:id` - Retrieve event by ID
- `GET /api/events/by-name/:name` - Retrieve event by name
- Event-specific check-in and admin routes

### Frontend Pages
- **Home**: B-Here branded event creation with date validation (future dates only)
- **QR Display**: Shows generated QR codes for events with B-Here branding
- **Check-in**: Public interface for employee check-ins with duplicate prevention
- **Admin Dashboard**: Open-access dashboard showing all events organized by upcoming/past
- **Removed**: Admin login page (no longer needed without password protection)

### UI Components
- Comprehensive shadcn/ui component library
- Custom loading overlays and form components
- Responsive design with mobile-first approach

## Data Flow

1. **Event Creation**: User creates event through B-Here form → Date validation (future only) → API stores in database → QR code generated
2. **Check-in Process**: Employee scans QR → Redirected to B-Here check-in page → Enters 6-digit employee ID → Duplicate check → Recorded in database with friendly error handling
3. **Admin Monitoring**: Anyone can access open admin dashboard → Views all events organized by status → Can export CSV reports for any event

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