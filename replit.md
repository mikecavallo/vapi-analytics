# Overview

This is Invoxa.ai - a full-stack multi-tenant SaaS platform built to visualize and analyze voice AI call data from the Vapi API. The application provides real-time analytics, KPI tracking, and detailed call management capabilities through an intuitive dashboard interface.

The project follows a modern monorepo structure with a React frontend, Express backend, and PostgreSQL database integration, all designed to handle voice AI analytics at scale.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Charts**: Recharts library for data visualization (line charts, pie charts, bar charts)
- **Form Handling**: React Hook Form with Zod validation

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with dedicated analytics endpoints
- **Middleware**: Custom logging, JSON parsing, and error handling
- **Development**: Hot reload with Vite middleware integration in development mode

## Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Connection**: Neon Database serverless PostgreSQL
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Caching**: In-memory caching layer for analytics data with TTL support
- **Session Storage**: PostgreSQL-based session storage with connect-pg-simple

## Authentication and Authorization
- **User Management**: Custom user system with username/password authentication
- **Session Management**: Express sessions with PostgreSQL storage
- **Data Security**: Environment-based API key management for Vapi integration

## API Integration Strategy
- **Primary Integration**: Vapi Analytics API for voice call data
- **Data Flow**: Backend proxy pattern to cache and transform Vapi API responses
- **Error Handling**: Comprehensive error handling with proper HTTP status codes
- **Rate Limiting**: Built-in caching to reduce API calls to external services

## Key Features
- **Real-time Analytics**: KPI cards showing total calls, average duration, success rates, and costs
- **Data Visualization**: Interactive charts for call volume trends, outcome distribution, and performance metrics
- **Call Management**: Detailed call history table with search, filtering, and pagination
- **Export Functionality**: CSV export capabilities for analytics data
- **Responsive Design**: Mobile-first design with adaptive layouts
- **Time Range Filtering**: Flexible time range selection for analytics periods

## Development Workflow
- **Build Process**: Vite for frontend bundling, esbuild for backend compilation
- **Type Safety**: Full TypeScript coverage with shared types between frontend and backend
- **Development Server**: Integrated development environment with HMR and error overlay
- **Database Operations**: Type-safe database operations with automatic migration support

# External Dependencies

## Core Infrastructure
- **Neon Database**: Serverless PostgreSQL database hosting
- **Vapi API**: Voice AI platform providing call analytics and management data

## Key Libraries
- **UI Components**: Radix UI primitives for accessible component foundation
- **Styling**: Tailwind CSS for utility-first styling approach
- **Database**: Drizzle ORM for type-safe PostgreSQL operations
- **Charts**: Recharts for responsive data visualization components
- **Validation**: Zod for runtime type validation and schema definition
- **HTTP Client**: Native fetch API for server communication
- **Date Handling**: date-fns for date manipulation and formatting

## Development Tools
- **Build System**: Vite with React plugin for fast development and building
- **TypeScript**: Full type safety across the entire application stack
- **Replit Integration**: Custom Vite plugins for Replit-specific development features