# Expert Discussion System - MVP Specification

## Overview
A minimal viable product (MVP) of the expert discussion system that enables users to manage their API keys and have basic discussions with AI experts.

## Core Features

### 1. User Authentication ✅
- Email/password registration and login
- Basic profile view
- No password reset for MVP
- No social authentication

### 2. API Key Management ✅
- Add/remove API keys
- Toggle key activation status
- View key usage status
- Basic validation of keys
- Support for OpenAI integration

### 3. Basic Discussion System ✅
- Create new discussions
- Single thread discussions (no branching)
- Basic text-only responses
- Discussion status tracking (active/completed)
- View discussion history
- Delete completed discussions
- Fullscreen discussion view

### 4. Expert System ✅
- Fixed set of 3 expert roles
- Basic prompt templates
- Single expert per response
- Basic error handling
- Enhanced expert selection UI

### 5. Debug System ✅
- Debug panel for development
- API request logging
- Error tracking
- Performance monitoring

## Technical Scope

### Database Schema

1. Users (Supabase Auth) ✅
```sql
auth.users
  - id (uuid, primary key)
  - email (text)
  - password (hashed)
  - created_at (timestamptz)
```

2. API Keys ✅
```sql
api_keys
  - id (uuid, primary key)
  - user_id (uuid, references auth.users)
  - provider (text, enum: 'openai')
  - key (text)
  - name (text)
  - is_active (boolean)
  - created_at (timestamptz)
```

3. Discussions ✅
```sql
discussions
  - id (uuid, primary key)
  - user_id (uuid, references auth.users)
  - topic (text)
  - status (text, enum: 'active' | 'completed')
  - created_at (timestamptz)
```

4. Messages ✅
```sql
messages
  - id (uuid, primary key)
  - discussion_id (uuid, references discussions)
  - expert_role (text)
  - content (text)
  - created_at (timestamptz)
```

### API Endpoints ✅

1. Authentication
- POST `/api/auth/register`
- POST `/api/auth/login`
- POST `/api/auth/logout`

2. API Keys
- GET `/api/keys`
- POST `/api/keys`
- DELETE `/api/keys/:id`
- PATCH `/api/keys/:id`
- POST `/api/keys/validate`

3. Discussions
- GET `/api/discussions`
- POST `/api/discussions`
- GET `/api/discussions/:id`
- PATCH `/api/discussions/:id`
- DELETE `/api/discussions/:id`

4. Messages
- GET `/api/discussions/:id/messages`
- POST `/api/discussions/:id/messages`

### UI Components ✅

1. Layout
- Header with navigation
- Main content area
- Basic mobile responsiveness

2. Authentication
- Login form
- Registration form
- Profile view

3. API Key Management
- Key list view
- Add key form
- Key status toggle

4. Discussions
- Discussion list
- Discussion creation form
- Discussion view with messages
- Simple message input
- Expert selector
- Fullscreen mode

### Security Requirements ✅

1. Authentication
- Supabase authentication
- Protected API endpoints
- Basic session management

2. Data Protection
- RLS policies for all tables
- Input validation
- Basic rate limiting

### Performance Targets ✅
- Page load < 3s
- API response < 1s
- Error rate < 1%

## Development Status: COMPLETE ✅

All MVP features have been implemented and tested. The system is ready for final testing and deployment.