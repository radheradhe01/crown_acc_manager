# Accounting Software - Replit Development Guide

## Overview

This is a comprehensive accounting software solution built with a modern full-stack architecture. The application provides financial management capabilities including company management, customer/vendor tracking, transaction processing, and financial reporting. It's designed to handle multi-company operations with features like bank statement uploads, invoice management, and various financial reports.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Shadcn/UI components with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: 
  - Zustand for global state (company selection)
  - React Query (TanStack Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Neon serverless
- **ORM**: Drizzle ORM for type-safe database operations
- **API Design**: RESTful API with JSON responses
- **Session Management**: Express sessions with PostgreSQL store

### Database Design
- **Primary Database**: PostgreSQL (configured for Neon serverless)
- **Schema Location**: `/shared/schema.ts` with Drizzle table definitions
- **Key Tables**:
  - `companies` - Multi-company support
  - `customers` - Customer relationship management
  - `vendors` - Vendor management
  - `transactions` - Financial transactions
  - `invoices` - Revenue tracking
  - `bills` - Expense tracking
  - `bank_accounts` - Bank account management
  - `bank_statement_uploads` - Bank statement processing
  - `expense_categories` - Enhanced with QuickBooks-style account types
  - `user_roles` - Role-based access control system
  - `permissions` - Granular permission management
  - `user_role_assignments` - User-role mapping with company scoping

## Key Components

### Multi-Company Management
- Company selector component for switching between entities
- Company-scoped data isolation
- Fiscal year and currency configuration per company

### Customer & Vendor Management
- Contact information and relationship tracking
- Payment terms configuration
- Opening balance support
- Address management (billing/shipping)

### Financial Transaction Processing
- Bank statement upload and parsing (CSV support)
- Enhanced transaction categorization with QuickBooks-style account types
- Smart category suggestions with create-new-category feature
- Manual transaction entry
- Invoice and bill management
- Payment reconciliation

### Reporting System
- Outstanding balances report
- General ledger
- Trial balance
- Expense category analysis

### UI Components
- Responsive design with mobile support
- Modal-based forms for data entry
- Data tables with sorting and filtering
- Dashboard with key metrics and quick actions
- Enhanced category selector with inline category creation
- User management interface with role-based permissions

## Data Flow

### Company Selection Flow
1. User selects company from dropdown
2. Company state stored in Zustand with persistence
3. All API calls include company context
4. Data filtered by selected company

### Transaction Processing Flow
1. Bank statement upload → CSV parsing → Transaction creation
2. Manual entry → Form validation → Database storage
3. Invoice/Bill creation → Customer/Vendor association → Amount tracking
4. Payment processing → Transaction reconciliation → Balance updates

### Reporting Flow
1. Query aggregated data from multiple tables
2. Apply date filters and company scoping
3. Format data for presentation
4. Export capabilities for external analysis

## External Dependencies

### Database
- **Neon PostgreSQL**: Serverless PostgreSQL database
- **Connection**: WebSocket-based connection with connection pooling

### UI Libraries
- **Shadcn/UI**: Pre-built React components
- **Radix UI**: Headless UI primitives
- **Lucide React**: Icon library
- **Tailwind CSS**: Utility-first CSS framework

### Development Tools
- **Vite**: Development server and build tool
- **ESBuild**: Production bundling
- **TypeScript**: Type safety and development experience
- **Drizzle Kit**: Database migrations and schema management

## Deployment Strategy

### Development Environment
- **Dev Command**: `npm run dev` - Runs development server with hot reloading
- **Database**: `npm run db:push` - Pushes schema changes to database
- **Type Checking**: `npm run check` - TypeScript compilation check

### Production Build
- **Build Process**: 
  1. Frontend: Vite builds React app to `dist/public`
  2. Backend: ESBuild bundles server code to `dist/index.js`
- **Start Command**: `npm start` - Runs production server

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **NODE_ENV**: Environment mode (development/production)
- **REPL_ID**: Replit-specific environment detection

### File Structure
```
├── client/          # Frontend React application
├── server/          # Backend Express application
├── shared/          # Shared types and schemas
├── migrations/      # Database migration files
└── dist/           # Production build output
```

## Changelog

```
Changelog:
- July 10, 2025. Added advanced category management system with QuickBooks-style account types
- July 10, 2025. Enhanced bank transaction categorization with create-new-category feature
- July 10, 2025. Implemented user roles and permissions system with database support
- July 08, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```