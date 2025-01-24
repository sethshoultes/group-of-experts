# Expert Discussion System - Build Specification

## Project Overview
A React-based expert discussion system that facilitates multi-expert conversations using Claude AI and Open Ai REST APIs. The system allows users to create discussions, get AI expert responses, and generate summaries.

## Technical Stack
- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **AI Integration**: Claude API (Anthropic)
- **AI Integration**: ChatGPT (Open AI)
- **Deployment**: Netlify
- **Icons**: Lucide React
- **Desktop**: Electron (optional)

## Project Structure
```
project/
├── build/                  # Build configuration
├── dist/                   # Build output
├── electron/               # Electron app configuration
├── netlify/
│   └── functions/         # Serverless functions
├── src/
│   ├── components/        # React components
│   │   ├── discussion/    # Discussion components
│   │   ├── layout/       # Layout components
│   │   └── settings/     # Settings components
│   ├── lib/              # Core libraries
│   │   ├── experts/      # Expert system logic
│   │   └── storage/      # Storage handlers
│   └── pages/            # Page components
└── supabase/
    └── migrations/       # Database migrations
```

## Setup Instructions

### 1. Environment Setup
Create `.env` file:
```env
CLAUDE_API_KEY=your_production_api_key
FRONTEND_URL=https://your-domain.com
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_URL=your_supabase_url
```

### 2. Supabase Setup
1. Create new Supabase project
2. Get project URL and anon key
3. Update `.env` with Supabase credentials
4. Run initial migration for API key storage

### 3. Development Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

### 4. Deployment Setup

#### Netlify Deployment
1. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`

2. Environment variables:
   - `CLAUDE_API_KEY`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SUPABASE_URL`

#### Desktop App Build (Optional)
1. Configure electron builder:
   ```bash
   npm run build:electron
   ```

## Core Components

### Phase 1: Core Infrastructure
1. Users (Supabase Auth)
   - id (uuid, primary key)
   - email (text)
   - password (hashed)
   - role (text, enum: 'user' | 'admin')
   - created_at (timestamptz)
   - updated_at (timestamptz)

2. api_keys
   - id (uuid, primary key)
   - user_id (uuid, references auth.users)
   - provider (text, enum: 'claude' | 'openai')
   - key (text)
   - name (text)
   - is_active (boolean)
   - last_used (timestamptz)
   - created_at (timestamptz)
   - updated_at (timestamptz)

### Phase 2: Discussion System
1. discussions
  - id (uuid, primary key)
  - user_id (uuid, references auth.users)
  - topic (text)
  - description (text)
  - status (text, enum: 'active' | 'completed')
  - created_at (timestamptz)
  - updated_at (timestamptz)

2. messages
  - id (uuid, primary key)
  - discussion_id (uuid, references discussions)
  - expert_role (text)
  - content (text)
  - created_at (timestamptz)
  - updated_at (timestamptz)

### Phase 3: Expert System
1. expert_roles
  - id (uuid, primary key)
  - name (text)
  - description (text)
  - system_prompt (text)
  - created_at (timestamptz)
  - updated_at (timestamptz)

3. discussions
  - id (uuid, primary key)
  - user_id (uuid, references auth.users)
  - topic (text)
  - description (text)
  - status (text, enum: 'active' | 'completed')
  - created_at (timestamptz)
  - updated_at (timestamptz)

4. messages
  - id (uuid, primary key)
  - discussion_id (uuid, references discussions)
  - expert_role (text)
  - content (text)
  - created_at (timestamptz)
  - updated_at (timestamptz)

5. expert_roles
  - id (uuid, primary key)
  - name (text)
  - description (text)
  - system_prompt (text)
  - created_at (timestamptz)
  - updated_at (timestamptz)

### API Endpoints (Netlify Functions)
#### Phase 1: Core Infrastructure
1. `/api/auth`
   - User authentication operations
   - POST request
   - Returns: Authentication tokens

2. `/api/profile`
   - User profile operations
   - API key management
   - Returns: Profile operation results

3. `/api/validate`
   - Validates API keys
   - POST request
   - Returns: `{ valid: boolean }`

#### Phase 2: Discussion System
1. `/api/discussions`
   - CRUD operations for discussions
   - POST, GET, PUT, DELETE requests
   - Returns: Discussion objects

2. `/api/messages`
   - CRUD operations for messages
   - POST, GET requests
   - Returns: Message objects

#### Phase 3: Expert System
1. `/api/validate`
   - Validates Claude API key
   - POST request
   - Returns: `{ valid: boolean }`

2. `/api/experts`
   - List available expert roles
   - GET request
   - Returns: Expert role objects
   - Gets expert responses
   - POST request
   - Payload: `{ prompt, expert, discussion }`
   - Returns: `{ response: string }`

3. `/api/discussions`
  - CRUD operations for discussions
  - POST, GET, PUT, DELETE requests
  - Returns: Discussion objects

4. `/api/messages`
  - CRUD operations for messages
  - POST, GET requests
  - Returns: Message objects

5. `/api/experts`
  - List available expert roles
  - GET request
  - Returns: Expert role objects

6. `/api/admin`
  - User management operations
  - API key management
  - System cleanup operations
  - Returns: Admin operation results

7. `/api/profile`
  - User profile operations
  - API key management
  - Chat history management
  - Returns: Profile operation results

### Core Features
#### Phase 1: Essential Features
1. User Management
   - User registration
   - User authentication
   - Profile management
   - API key management
   - Basic error handling

2. Security Infrastructure
   - API key encryption
   - Session management
   - Input validation
   - Basic rate limiting

#### Phase 2: Discussion System
1. Discussion Management
   - Create discussions
   - Add expert responses
   - Track discussion status
   - Basic message threading

#### Phase 3: Advanced Features
1. Expert System
   - Define expert roles
   - Manage expert profiles
   - Handle expert responses
   - Response quality monitoring

2. API Integration
   - Claude API integration
   - Secure key management
   - Error handling
   - Response streaming support

3. Expert System Configuration
   - Customizable system prompts
   - Expert role templates
   - Response formatting rules

#### Phase 4: Administrative Features
1. Admin Interface
   - User management dashboard
   - System-wide API key management
   - Chat history cleanup tools
   - System metrics and monitoring
   - Debugging tools and panels

2. Development Tools
   - Admin-only debugging panel
   - GPT conversation testing interface
   - System metrics visualization
   - Performance monitoring tools

## Security Considerations

### API Key Management
1. User-based API key storage
2. Secure key encryption
3. Key validation system
4. Key usage tracking
5. Multiple key support per user
6. Key activation/deactivation
7. Key deletion with cascading cleanup

### Authentication
1. Supabase authentication
2. Protected API endpoints
3. Secure session management

### Data Protection
1. Enable RLS on all tables
2. Implement proper CORS policies
3. Validate all inputs

## Testing Requirements

### Unit Tests
1. Component testing
2. Utility function testing
3. API integration testing

### Integration Tests
1. End-to-end flows
2. API endpoints
3. Authentication flows

### Performance Tests
1. Load time optimization
2. API response times
3. Animation performance

## Deployment Checklist

### Frontend
1. Build optimization
2. Asset compression
3. Error handling
4. Analytics setup

### Serverless Functions
1. API endpoint configuration
2. Error logging
3. Rate limiting
4. Security headers

### Database
1. Migrations
2. Indexes
3. Backup strategy
4. Monitoring

## Monitoring & Maintenance

### Performance Monitoring
1. Page load times
2. API response times
3. Error rates
4. System uptime

### Security Monitoring
1. Authentication logs
2. API usage
3. Error tracking
4. Security alerts

### Backup Strategy
1. Database backups
2. Configuration backups
3. Recovery procedures

## Documentation Requirements

### Technical Documentation
1. API documentation
2. Database schema
3. Component documentation
4. Deployment guides
5. Admin interface documentation
6. Debugging tools documentation

### User Documentation
1. User guides
2. Admin guides
3. Profile management guides
3. API guides
4. Troubleshooting guides

## Success Criteria

### Performance Metrics
1. Page load < 2s
2. API response < 500ms
3. Animation performance 60fps
4. Error rate < 0.1%

### User Metrics
1. User engagement
2. Response quality
3. User satisfaction
4. Feature adoption

### Technical Metrics
1. Code coverage > 80%
2. Build success rate > 99%
3. Uptime > 99.9%
4. Security compliance

## Next Steps
1. Set up Supabase project and authentication
2. Implement user management system
3. Create API key management interface
4. Build basic chat interface
5. Add error handling and validation
6. Implement rate limiting
7. Begin discussion system development