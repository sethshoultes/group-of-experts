# Expert Discussion System - MVP Specification

## Overview
A minimal viable product (MVP) of the expert discussion system that enables users to manage their API keys and have basic discussions with AI experts.

## Core Features

### 1. User Authentication
✅ Complete:
- Email/password registration and login
- Basic profile view
- No password reset for MVP
- No social authentication

### 2. API Key Management
✅ Complete:
- Add/remove API keys
- Toggle key activation status
- View key usage status
- Basic validation of keys (OpenAI working, Claude validation temporarily disabled)
- Support for both Claude and OpenAI

Note: Claude API key validation is currently not working due to CORS restrictions.
This will be addressed in a future update. OpenAI key validation is working as expected.

### 3. Basic Discussion System
✅ Complete:
- Create new discussions
- Single thread discussions (no branching)
- Basic text-only responses
- Discussion status tracking (active/completed)
- View discussion history

### 4. Simple Expert System
✅ Complete:
- Fixed set of 3 expert roles
- Basic prompt templates
- Single expert per response
- No streaming responses for MVP
- Basic error handling

## Technical Scope

### Database Schema

1. Users (Supabase Auth)
✅ Complete:
```sql
auth.users
  - id (uuid, primary key)
  - email (text)
  - password (hashed)
  - created_at (timestamptz)
```

2. API Keys
✅ Complete:
```sql
api_keys
  - id (uuid, primary key)
  - user_id (uuid, references auth.users)
  - provider (text, enum: 'claude' | 'openai')
  - key (text)
  - name (text)
  - is_active (boolean)
  - created_at (timestamptz)
```

3. Discussions
✅ Complete:
```sql
discussions
  - id (uuid, primary key)
  - user_id (uuid, references auth.users)
  - topic (text)
  - status (text, enum: 'active' | 'completed')
  - created_at (timestamptz)
```

4. Messages
✅ Complete:
```sql
messages
  - id (uuid, primary key)
  - discussion_id (uuid, references discussions)
  - expert_role (text)
  - content (text)
  - created_at (timestamptz)
```

### API Endpoints

1. Authentication
✅ Complete:
- POST `/api/auth/register`
- POST `/api/auth/login`
- POST `/api/auth/logout`

2. API Keys
✅ Complete:
- GET `/api/keys` - List user's keys
- POST `/api/keys` - Add new key
- DELETE `/api/keys/:id` - Remove key
- PATCH `/api/keys/:id` - Update key status
- POST `/api/keys/validate` - Validate key

3. Discussions
✅ Complete:
- GET `/api/discussions` - List discussions
- POST `/api/discussions` - Create discussion
- GET `/api/discussions/:id` - Get discussion
- PATCH `/api/discussions/:id` - Update status

4. Messages
✅ Complete:
- GET `/api/discussions/:id/messages` - List messages
- POST `/api/discussions/:id/messages` - Add message

### UI Components

1. Layout
✅ Complete:
- Header with navigation
- Main content area
- Basic mobile responsiveness

2. Authentication
✅ Complete:
- Login form
- Registration form
- Profile view

3. API Key Management
✅ Complete:
- Key list view
- Add key form
- Key status toggle

4. Discussions
✅ Complete:
- Discussion list
- Discussion creation form
- Discussion view with messages
- Simple message input

### Security Requirements

1. Authentication
✅ Complete:
- Supabase authentication
- Protected API endpoints
- Basic session management

2. Data Protection
✅ Complete:
- RLS policies for all tables
- Input validation
- Basic rate limiting

### Performance Targets
In Progress:
- Page load < 3s
- API response < 1s
- Error rate < 1%

## Development Phases

### Phase 1: Setup (Week 1)
✅ Complete:
1. Project initialization
2. Database setup
3. Authentication implementation
4. Basic UI structure

### Phase 2: API Key Management (Week 2)
✅ Complete:
1. API key storage
2. Key management interface
3. Key validation
4. Basic error handling

### Phase 3: Discussions (Week 3)
✅ Complete:
1. Discussion creation
2. Message system
3. Expert integration
4. Basic UI completion

### Phase 4: Testing & Deploy (Week 4)
In Progress:
1. Basic testing
2. Error handling
3. Performance optimization
4. Initial deployment

## MVP Success Criteria

### Must Have
✅ Complete:
- User registration and login
- API key management
- Basic discussion creation
- Simple expert responses
- Core error handling

### Nice to Have
In Progress:
- Basic mobile responsiveness
- Simple loading states
- Basic input validation
- Discussion status management

### Out of Scope
Confirmed:
- Password reset
- Social authentication
- Multiple experts per discussion
- Response streaming
- File attachments
- Admin interface
- Advanced error handling
- Complex UI animations
- Advanced security features
- Performance optimization
- Analytics
- User preferences
- Export functionality

## Next Steps
✅ Completed:
1. Project initialization
2. Supabase setup
3. Authentication implementation
4. API key management
5. Create discussions table migration
6. Implement discussion creation and listing
7. Add messages table migration
8. Build message threading system
9. Integrate expert system with basic roles
10. Add discussion completion functionality

Next Priority Tasks:
1. Enhance error handling
2. Implement response streaming
3. Add performance optimizations
4. Improve user experience
5. Add comprehensive testing
6. Deploy initial version