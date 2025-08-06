# Financial Transaction Management System

## Overview

This is a full-stack financial transaction management application built with React, Express, and PostgreSQL. The system allows users to track, categorize, and analyze financial transactions across multiple accounts. It features comprehensive transaction filtering, bulk operations, CSV import/export functionality, and detailed financial analytics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Radix UI primitives with shadcn/ui components for consistent design
- **Styling**: Tailwind CSS with CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database ORM**: Drizzle ORM for type-safe database operations
- **API Design**: RESTful API with CRUD operations for accounts, transactions, and transactors
- **Error Handling**: Centralized error handling middleware
- **Request Logging**: Custom logging middleware for API requests

### Database Schema
- **Accounts Table**: Stores bank account information (name, type, owner, identifier)
- **Transactions Table**: Core transaction data with extensive classification fields
  - Financial fields: date, amount, descriptions, transactor
  - Classification: classification type, payment medium, process type, schedule, statutory type
  - Feature flags: deleted, actual, budget item, interaccount, income statement
- **Transactors Table**: Counterparty entities for transactions with categorization

### Data Management Features
- **Filtering System**: Advanced filtering by account, date range, classification, and text search
- **Bulk Operations**: Mass update transactions with classification and flag changes
- **CSV Import/Export**: File-based data import and export functionality
- **Transaction Analytics**: Summary statistics and financial insights

### User Interface Design
- **Responsive Layout**: Mobile-first design with adaptive components
- **Component Structure**: Modular components for tables, forms, modals, and filters
- **Navigation**: Tab-based navigation between Transactions, Accounts, and Analytics views
- **Real-time Updates**: Optimistic updates with automatic cache invalidation

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity via Neon
- **drizzle-orm** and **drizzle-kit**: Type-safe ORM and migration tools
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight client-side routing

### UI and Form Libraries
- **@radix-ui/***: Headless UI components for accessibility
- **tailwindcss**: Utility-first CSS framework
- **react-hook-form** and **@hookform/resolvers**: Form handling and validation
- **zod**: Schema validation library

### Utility Libraries
- **date-fns**: Date manipulation and formatting
- **lucide-react**: Icon library
- **clsx** and **tailwind-merge**: Conditional CSS class handling
- **class-variance-authority**: Type-safe component variants

### Development Tools
- **typescript**: Type safety across the entire stack
- **vite**: Fast development server and build tool
- **esbuild**: Production bundling for the server
- **tsx**: TypeScript execution for development