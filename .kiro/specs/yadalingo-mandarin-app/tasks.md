# Implementation Plan: Pinyin Talk Mandarin Learning App

## Overview

This implementation plan breaks down the Pinyin Talk full-stack Mandarin learning application into discrete, actionable tasks. The application uses Next.js 14+ App Router, React Server Components, TypeScript, PostgreSQL with Prisma ORM, and OpenAI APIs for AI-powered conversation and speech processing. Tasks are organized to enable incremental development with early validation of core functionality.

## Tasks

- [-] 1. Project initialization and infrastructure setup
  - Initialize Next.js 14+ project with TypeScript and App Router
  - Configure TailwindCSS for styling
  - Set up project structure with app/, components/, lib/ directories
  - Configure environment variables (.env.example, .env.local)
  - Initialize Git repository with .gitignore
  - Install core dependencies: next, react, prisma, next-auth, openai, zod, bcryptjs
  - _Requirements: 16.1, 16.2_

- [ ] 2. Database schema and Prisma setup
  - [~] 2.1 Create Prisma schema with all models
    - Define User model with authentication fields and preferences
    - Define Lesson model with themed content structure
    - Define Session model with performance metrics
    - Define Message model for conversation history
    - Define ListeningDrill, Question, and Answer models
    - Define CommunityQuestion and TeacherResponse models
    - Configure PostgreSQL datasource and indexes
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8_

  - [~] 2.2 Initialize database and run migrations
    - Run `prisma migrate dev` to create initial migration
    - Create Prisma client instance with connection pooling (lib/prisma.ts)
    - Verify database connectivity
    - _Requirements: 11.7, 11.8_

  - [ ]* 2.3 Create database seed script
    - Create seed data for initial lessons (Asking directions, Small talk, Taxi and travel)
    - Create sample listening drills with questions
    - Create sample community questions and responses
    - Run seed script to populate development database
    - _Requirements: 10.1, 10.2, 10.3_

- [ ] 3. Authentication system implementation
  - [~] 3.1 Set up NextAuth.js with credentials provider
    - Create auth configuration in app/api/auth/[...nextauth]/route.ts
    - Configure JWT strategy with 30-day expiration
    - Implement authorize function with bcrypt password verification
    - Configure custom sign-in and error pages
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [~] 3.2 Create authentication UI components
    - Create sign-in page (app/(auth)/signin/page.tsx)
    - Create sign-up page (app/(auth)/signup/page.tsx)
    - Create welcome screen with registration and sign-in options
    - Implement form validation with Zod schemas
    - Add loading states and error message display
    - _Requirements: 1.6_

  - [~] 3.3 Implement user registration server action
    - Create registration server action in app/actions/auth.ts
    - Hash passwords with bcrypt (cost factor 12)
    - Validate unique email addresses
    - Create user record in database with default preferences
    - Handle registration errors gracefully
    - _Requirements: 1.1, 1.4, 1.7_

  - [~] 3.4 Set up middleware for route protection
    - Create middleware.ts with NextAuth middleware
    - Protect dashboard, talk, listen, community routes
    - Protect API routes for conversation and audio processing
    - Redirect unauthenticated users to sign-in page
    - _Requirements: 1.3_

- [ ] 4. Home dashboard and navigation
  - [~] 4.1 Create dashboard layout and home page
    - Create dashboard layout component (app/(dashboard)/layout.tsx)
    - Create home page server component (app/(dashboard)/page.tsx)
    - Fetch user data and sessions from database
    - Display personalized greeting with user's name
    - Show "Continue" button for incomplete sessions
    - Display available learning modes (Talk, Listen)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.6, 2.7_

  - [~] 4.2 Create lesson card components
    - Create LessonCard server component (components/dashboard/LessonCard.tsx)
    - Display lesson title in Chinese characters and English
    - Show lesson completion status
    - Add click handler to navigate to talk mode with lesson
    - Style with TailwindCSS for responsive design
    - _Requirements: 2.5, 10.1, 10.2, 10.5_

  - [~] 4.3 Implement progress stats display
    - Create ProgressStats component (components/dashboard/ProgressStats.tsx)
    - Calculate and display total sessions completed
    - Show average tone accuracy percentage
    - Display total practice time
    - Query user progress from database
    - _Requirements: 2.6, 20.5, 20.6_

- [ ] 5. Audio recording infrastructure
  - [~] 5.1 Create audio recorder hook
    - Create useAudioRecorder hook (lib/hooks/useAudioRecorder.ts)
    - Implement MediaRecorder API integration with WebM/Opus format
    - Handle microphone permission requests
    - Provide start/stop recording controls
    - Return audio blob on recording completion
    - Handle recording errors (NotAllowedError, NotFoundError)
    - _Requirements: 8.1, 8.2, 8.4_

  - [~] 5.2 Create AudioRecorder client component
    - Create AudioRecorder component (components/audio/AudioRecorder.tsx)
    - Display recording button with visual indicator
    - Show recording timer during capture
    - Implement disabled state handling
    - Trigger onRecordingComplete callback with audio blob
    - Display error messages for microphone issues
    - _Requirements: 8.1, 8.4_

  - [~] 5.3 Create audio playback components
    - Create AudioPlayer component (components/audio/AudioPlayer.tsx)
    - Implement HTML5 audio element with controls
    - Support variable playback speed (0.5x, 1x, 1.5x, 2x)
    - Add volume normalization
    - Handle audio loading errors gracefully
    - _Requirements: 8.3, 8.5, 8.6_

- [ ] 6. Speech-to-text integration
  - [~] 6.1 Create audio transcription API route
    - Create POST /api/audio/transcribe route (app/api/audio/transcribe/route.ts)
    - Integrate OpenAI Whisper API for Mandarin transcription
    - Accept audio file via FormData
    - Generate Pinyin annotations from Chinese text
    - Return text, pinyin, and confidence score
    - Implement error handling for transcription failures
    - Add request authentication check
    - _Requirements: 9.1, 9.4, 9.5_

  - [~] 6.2 Create AudioProcessor service
    - Create AudioProcessor class (lib/services/audioProcessor.ts)
    - Implement transcribe method with Whisper API
    - Implement synthesize method for text-to-speech
    - Implement uploadAudio method for cloud storage
    - Handle API rate limiting and retries
    - Add timeout handling (3 seconds for STT)
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.7_

  - [ ]* 6.3 Add Pinyin generation utility
    - Create pinyin utility function (lib/utils/pinyin.ts)
    - Implement Pinyin conversion from Chinese characters
    - Add tone number to diacritic conversion
    - Handle multi-character words correctly
    - _Requirements: 9.1_

- [ ] 7. Text-to-speech implementation
  - [~] 7.1 Create audio synthesis API route
    - Create POST /api/audio/synthesize route
    - Integrate OpenAI TTS API with 'nova' voice
    - Accept text and optional voice parameter
    - Return audio buffer as response
    - Cache synthesized audio for lesson content
    - _Requirements: 9.2, 9.3, 9.6, 9.7_

  - [~] 7.2 Implement client-side audio playback
    - Update AudioPlayer to stream TTS audio
    - Add loading state during synthesis
    - Support normal and slower playback speeds
    - Preload audio for better UX
    - _Requirements: 9.3, 9.6, 9.7_

- [ ] 8. Cloud storage setup for audio files
  - [~] 8.1 Configure cloud storage provider
    - Choose storage provider (Vercel Blob, AWS S3, or Cloudflare R2)
    - Set up storage bucket with public read access
    - Configure CORS for browser uploads
    - Set up CDN for audio delivery
    - Add environment variables for storage credentials
    - _Requirements: 8.2, 8.7_

  - [~] 8.2 Create audio upload API route
    - Create POST /api/audio/upload route (app/api/audio/upload/route.ts)
    - Validate audio file size (max 10MB) and type
    - Generate unique filename with timestamp and UUID
    - Upload to cloud storage with appropriate prefix
    - Extract and return audio duration
    - Return public URL for audio playback
    - _Requirements: 8.2_

- [ ] 9. Conversation engine implementation
  - [~] 9.1 Create ConversationEngine service
    - Create ConversationEngine class (lib/services/conversationEngine.ts)
    - Implement generateResponse method with GPT-4
    - Build Mei persona system prompt with lesson context
    - Adapt conversation to user proficiency level
    - Keep responses conversational (2-3 sentences)
    - Configure temperature 0.8, max_tokens 200
    - _Requirements: 3.6, 17.1, 17.2, 17.3, 17.4_

  - [~] 9.2 Create streaming conversation API route
    - Create POST /api/conversation/stream route (app/api/conversation/stream/route.ts)
    - Fetch session and lesson context from database
    - Implement streamResponse method for real-time updates
    - Return ReadableStream with text/event-stream headers
    - Handle streaming errors and connection interruptions
    - _Requirements: 3.6, 16.2_

  - [~] 9.3 Implement session creation server action
    - Create createSession server action (app/actions/session.ts)
    - Validate user authentication
    - Create new session record with lessonId and mode
    - Set status to 'active' and record startedAt timestamp
    - Revalidate dashboard path
    - Return session ID for client navigation
    - _Requirements: 14.1_

- [ ] 10. Conversation UI components
  - [~] 10.1 Create message bubble component
    - Create MessageBubble component (components/conversation/MessageBubble.tsx)
    - Display role-specific styling (user vs assistant)
    - Show Chinese text with Pinyin annotations
    - Display English translation for assistant messages
    - Add audio playback button for messages with audio
    - Show tone feedback inline when present
    - _Requirements: 3.2, 3.3, 3.8, 3.10_

  - [~] 10.2 Create conversation UI component
    - Create ConversationUI client component (components/conversation/ConversationUI.tsx)
    - Display conversation history with auto-scrolling
    - Integrate AudioRecorder for user input
    - Handle audio recording completion and upload
    - Send transcribed text to conversation API
    - Stream Mei's responses in real-time
    - Provide "Help in English" button
    - _Requirements: 3.1, 3.8, 3.9, 3.10_

  - [~] 10.3 Create talk mode page
    - Create talk mode page (app/(dashboard)/talk/page.tsx)
    - Initialize or resume conversation session
    - Wrap ConversationUI with Suspense boundary
    - Fetch initial messages from database (server component)
    - Add session end button with navigation to summary
    - _Requirements: 3.1, 14.3_

- [~] 11. Checkpoint - Conversation practice validation
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Tone analysis implementation
  - [~] 12.1 Create ToneAnalyzer service
    - Create ToneAnalyzer class (lib/services/toneAnalyzer.ts)
    - Implement analyze method with audio URL and expected text
    - Define TONE_PATTERNS constants for 4 tones + neutral
    - Implement extractPitchContour using Web Audio API
    - Implement detectToneType from pitch contour shape
    - Compare detected vs expected tones word-by-word
    - Generate correction feedback for incorrect tones
    - _Requirements: 4.1, 4.2, 13.1, 13.2, 13.3, 13.4, 13.5_

  - [~] 12.2 Create tone analysis API route
    - Create POST /api/audio/analyze-tone route (app/api/audio/analyze-tone/route.ts)
    - Accept audioUrl and expectedText parameters
    - Use Whisper API to get word-level timestamps
    - Extract pitch contour and segment by words
    - Compare detected tones with expected tones
    - Return ToneFeedback array with corrections
    - Complete processing within 2 seconds
    - _Requirements: 4.1, 4.2, 4.3, 4.7_

  - [~] 12.3 Create tone feedback display component
    - Create ToneFeedback component (components/conversation/ToneFeedback.tsx)
    - Display incorrect words with expected tone markings
    - Show correction message in plain language
    - Describe correct tone pattern (flat, rising, dipping, falling)
    - Provide audio example of correct pronunciation
    - Style errors prominently for visibility
    - _Requirements: 4.3, 4.4, 4.5, 13.4, 13.5_

  - [~] 12.4 Integrate tone analysis into conversation flow
    - Update ConversationUI to trigger tone analysis after user speech
    - Pass user audio and transcription to tone analyzer
    - Display tone feedback below user message
    - Store feedback in Message model toneFeedback field
    - Update session toneAccuracy metric
    - _Requirements: 4.6, 4.7_

  - [ ]* 12.5 Add tone sandhi rule handling
    - Implement tone sandhi rules for multi-syllable words
    - Handle third tone changes before another third tone
    - Handle "yi" and "bu" tone variations
    - Test with common multi-syllable words
    - _Requirements: 13.6_

- [ ] 13. Session tracking and management
  - [~] 13.1 Create SessionTracker service
    - Create SessionTracker class (lib/services/sessionTracker.ts)
    - Implement recordMessage method to save conversation messages
    - Implement completeSession method to calculate metrics
    - Calculate tone accuracy from feedback data
    - Calculate session duration and message count
    - Extract review words from conversation
    - _Requirements: 6.1, 6.9, 14.1, 14.5_

  - [~] 13.2 Implement session state persistence
    - Update conversation API to save messages to database
    - Store user and assistant messages with metadata
    - Include pinyin, translation, audioUrl, and toneFeedback
    - Implement session resumption logic
    - Load conversation history when resuming session
    - _Requirements: 14.2, 14.3, 14.4, 17.5_

  - [~] 13.3 Implement session completion logic
    - Create completeSession server action (app/actions/session.ts)
    - Update session status to 'completed'
    - Record completedAt timestamp
    - Calculate and store performance metrics
    - Trigger navigation to session summary page
    - _Requirements: 6.1, 6.8, 6.9_

  - [~] 13.4 Implement user progress tracking
    - Create getUserProgress method in SessionTracker
    - Aggregate completed sessions by user
    - Calculate average tone accuracy across sessions
    - Sum total practice time
    - Return recent session history
    - _Requirements: 20.1, 20.2, 20.3, 20.5, 20.6_

- [ ] 14. Session summary page
  - [~] 14.1 Create session summary page
    - Create session summary page (app/(dashboard)/session/[id]/page.tsx)
    - Fetch session data with messages from database (server component)
    - Display session title in Chinese and Pinyin
    - Calculate and display performance metrics (tone accuracy, message count)
    - Show session duration
    - _Requirements: 6.1, 6.2, 6.3_

  - [~] 14.2 Create review words list component
    - Extract unique vocabulary from session messages
    - Display words with Chinese characters, Pinyin, and English
    - Add audio playback button for each word
    - Highlight words that had tone errors
    - _Requirements: 6.4, 6.5_

  - [~] 14.3 Add session action buttons
    - Create "Practice again" button to restart same lesson
    - Create "Done" button to return to dashboard
    - Implement navigation handlers
    - _Requirements: 6.6, 6.7, 6.8_

- [ ] 15. Listening drill system
  - [~] 15.1 Create waveform generation utility
    - Create waveform utility (lib/utils/waveform.ts)
    - Implement generateWaveform function with Web Audio API
    - Calculate RMS amplitude for visualization blocks
    - Normalize waveform data to 0-1 range
    - Target 1000 samples for smooth visualization
    - _Requirements: 18.1, 18.2, 18.5_

  - [~] 15.2 Create WaveformPlayer component
    - Create WaveformPlayer client component (components/audio/WaveformPlayer.tsx)
    - Render waveform using Canvas API
    - Implement playback controls (play, pause, seek)
    - Support normal and slower playback speeds (0.5x, 1x)
    - Highlight current playback position on waveform
    - Update visualization during playback
    - _Requirements: 5.2, 5.3, 18.3, 18.4_

  - [~] 15.3 Create MultipleChoiceQuiz component
    - Create MultipleChoiceQuiz component (components/listening/MultipleChoiceQuiz.tsx)
    - Display questions with 3-5 option buttons
    - Capture user selection state
    - Disable options after selection
    - Provide immediate feedback on correctness
    - Display correct answer when wrong
    - Submit answers via server action
    - _Requirements: 5.4, 5.5, 19.1, 19.2, 19.4, 19.5_

  - [~] 15.4 Create listen mode page
    - Create listen mode page (app/(dashboard)/listen/page.tsx)
    - Fetch listening drill with questions from database
    - Display waveform visualization
    - Show transcript reveal button
    - Integrate MultipleChoiceQuiz component
    - Track completion and navigate to session summary
    - _Requirements: 5.1, 5.7, 5.8_

  - [~] 15.5 Implement listening drill answer submission
    - Create submitAnswer server action (app/actions/listening.ts)
    - Validate answer against correct response
    - Create Answer record in database
    - Link to session and user
    - Return immediate feedback (isCorrect, correctAnswer)
    - Update session metrics (questionsAnswered, correctAnswers)
    - _Requirements: 5.6, 19.3, 19.6_

- [~] 16. Checkpoint - Listening drills validation
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 17. Community Q&A system
  - [~] 17.1 Create community questions page
    - Create community page (app/(dashboard)/community/page.tsx)
    - Fetch questions with pagination from database
    - Display level filter buttons (Beginner, Tones, Travel)
    - Implement server-side filtering by level
    - Show question text and voice notes
    - Display teacher responses below questions
    - _Requirements: 7.1, 7.2, 7.7_

  - [~] 17.2 Create QuestionList component
    - Create QuestionList server component (components/community/QuestionList.tsx)
    - Display questions with user name and timestamp
    - Show voice note player when present
    - Render teacher responses with text and examples
    - Implement pagination controls (cursor-based)
    - _Requirements: 7.1, 7.6, 7.7, 7.9_

  - [~] 17.3 Create VoiceNoteRecorder component
    - Create VoiceNoteRecorder component (components/community/VoiceNoteRecorder.tsx)
    - Integrate audio recording with 60 second max duration
    - Display recording timer and waveform preview
    - Allow playback before submission
    - Upload to storage and provide URL callback
    - _Requirements: 7.4, 7.5_

  - [~] 17.4 Create question submission form
    - Create QuestionForm component (components/community/QuestionForm.tsx)
    - Text input for question content
    - Level selector dropdown (Beginner, Tones, Travel)
    - Optional voice note attachment
    - Submit button with loading state
    - Form validation with error messages
    - _Requirements: 7.3, 7.4_

  - [~] 17.5 Implement question submission server action
    - Create submitCommunityQuestion server action (app/actions/community.ts)
    - Validate user authentication
    - Create CommunityQuestion record in database
    - Store text, voiceNoteUrl, and level
    - Revalidate community page
    - Return question ID
    - _Requirements: 7.8_

- [ ] 18. Responsive UI implementation
  - [~] 18.1 Implement responsive layouts
    - Configure TailwindCSS breakpoints (sm, md, lg, xl)
    - Create responsive grid layouts for dashboard
    - Stack components vertically on mobile
    - Adjust font sizes for readability on small screens
    - Test layouts on desktop, tablet, and mobile viewports
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

  - [~] 18.2 Optimize touch interactions for mobile
    - Ensure buttons are minimum 44x44px for touch targets
    - Add appropriate spacing between interactive elements
    - Test recording controls on touch devices
    - Implement swipe gestures where appropriate
    - _Requirements: 12.5_

  - [~] 18.3 Ensure Chinese character legibility
    - Use appropriate font families for Chinese (Noto Sans SC, Source Han Sans)
    - Set minimum font sizes for Chinese characters (16px on mobile)
    - Test character rendering across screen sizes
    - Ensure Pinyin annotations are readable
    - _Requirements: 12.6_

- [ ] 19. Error handling and user feedback
  - [~] 19.1 Create global error boundary
    - Create app/error.tsx for client-side error boundary
    - Display user-friendly error message
    - Provide "Try again" reset button
    - Log errors to console (prepare for external service)
    - _Requirements: 15.1, 15.5_

  - [~] 19.2 Implement API error handling
    - Create APIError class with statusCode and code (lib/errors/apiErrors.ts)
    - Create handleAPIError utility function
    - Handle Zod validation errors (400)
    - Handle authentication errors (401)
    - Handle generic errors (500)
    - Return consistent error response format
    - _Requirements: 15.1, 15.5, 15.6_

  - [~] 19.3 Add network error handling
    - Detect network connectivity loss
    - Display connectivity error message to user
    - Implement retry logic for failed requests
    - Queue actions when offline (future enhancement)
    - _Requirements: 15.2_

  - [~] 19.4 Add specific error messages for audio
    - Handle microphone permission denied
    - Handle no microphone found
    - Handle speech recognition failures
    - Provide troubleshooting instructions
    - _Requirements: 15.3, 15.4_

- [ ] 20. Performance optimization
  - [~] 20.1 Implement caching strategies
    - Configure React Server Component caching
    - Add revalidate config to appropriate routes
    - Cache lesson data (5 minute TTL)
    - Cache user progress data (1 minute TTL)
    - _Requirements: 16.4_

  - [~] 20.2 Optimize database queries
    - Use Prisma select to fetch only needed fields
    - Add indexes to frequently queried fields
    - Implement cursor-based pagination for large lists
    - Test query performance with EXPLAIN ANALYZE
    - Ensure queries complete within 500ms
    - _Requirements: 16.6_

  - [~] 20.3 Implement audio file optimization
    - Record audio in WebM with Opus codec
    - Set bitrate to 64kbps for speech
    - Use preload="none" for lazy loading
    - Configure CDN caching headers (1 year for lesson audio)
    - _Requirements: 16.1, 16.5_

  - [~] 20.4 Add dynamic imports for heavy components
    - Dynamically import WaveformPlayer with ssr: false
    - Dynamically import AudioRecorder components
    - Add loading spinners during import
    - Test bundle size reduction
    - _Requirements: 16.1_

- [ ] 21. Rate limiting and security
  - [~] 21.1 Implement rate limiting
    - Set up Upstash Redis (or alternative)
    - Create rate limit middleware (10 requests per minute)
    - Apply to audio processing endpoints
    - Apply to conversation API endpoints
    - Return 429 status when limit exceeded
    - _Requirements: 16.3_

  - [~] 21.2 Add input validation
    - Create Zod schemas for all API inputs
    - Validate message content length (max 1000 chars)
    - Validate audio file size (max 10MB)
    - Validate session IDs (CUID format)
    - Return 400 errors for invalid input
    - _Requirements: 15.1_

  - [~] 21.3 Secure sensitive data
    - Never log user passwords or tokens
    - Use environment variables for API keys
    - Implement secure password hashing (bcrypt cost 12)
    - Add CSRF protection for forms
    - Use HTTPS in production
    - _Requirements: 1.4_

- [ ] 22. Testing implementation
  - [ ]* 22.1 Write unit tests for services
    - Test ToneAnalyzer tone detection logic
    - Test AudioProcessor transcription handling
    - Test ConversationEngine prompt building
    - Test SessionTracker metric calculations
    - Use Jest or Vitest for testing
    - Aim for 80%+ coverage on business logic

  - [ ]* 22.2 Write integration tests for API routes
    - Test audio transcription endpoint
    - Test conversation streaming endpoint
    - Test authentication flow
    - Test audio upload endpoint
    - Use supertest or built-in Next.js testing

  - [ ]* 22.3 Write end-to-end tests for critical flows
    - Test user registration and sign-in
    - Test complete conversation session
    - Test listening drill completion
    - Test community question submission
    - Use Playwright or Cypress

- [ ] 23. Deployment preparation
  - [~] 23.1 Configure production environment
    - Set up production database (PostgreSQL)
    - Configure environment variables for production
    - Set up cloud storage for production
    - Configure Redis for rate limiting
    - Set NEXTAUTH_URL to production domain
    - _Requirements: 16.3_

  - [~] 23.2 Set up deployment pipeline
    - Choose deployment platform (Vercel recommended)
    - Configure automatic deployments from main branch
    - Run database migrations in CI/CD
    - Set up environment variable management
    - Configure domain and SSL certificates

  - [ ]* 23.3 Set up monitoring and logging
    - Configure error tracking (Sentry or similar)
    - Set up performance monitoring
    - Configure database query monitoring
    - Set up alerts for API error rates
    - Monitor OpenAI API usage and costs

- [ ] 24. Final integration and testing
  - [~] 24.1 Wire all components together
    - Verify navigation between all pages
    - Test complete user journey from registration to session completion
    - Ensure audio recording and playback work across browsers
    - Test tone analysis with real Mandarin speech
    - Verify database relationships and data integrity
    - _Requirements: All_

  - [~] 24.2 Browser compatibility testing
    - Test on Chrome, Firefox, Safari, Edge
    - Test on iOS Safari and Android Chrome
    - Verify MediaRecorder API compatibility
    - Test Web Audio API features
    - Add polyfills if needed

  - [~] 24.3 Performance validation
    - Test with 100 concurrent users (load testing)
    - Verify API response times meet SLA (95% under 3s)
    - Check database query performance under load
    - Verify audio streaming latency
    - Test on slow network connections (3G simulation)
    - _Requirements: 16.1, 16.2, 16.3, 16.5_

- [~] 25. Final checkpoint - Production readiness
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP deployment
- Each task references specific requirements for traceability
- Checkpoints ensure validation at major milestones
- The design document (design.md) contains detailed implementation specifications for all components
- Focus on core learning features first (conversation and listening), then community features
- Testing tasks are optional but recommended for production quality
- Deployment tasks can be adapted based on chosen hosting platform

## Task Dependency Graph

```json
{
  "waves": [
    {
      "id": 0,
      "tasks": ["1", "23.1"]
    },
    {
      "id": 1,
      "tasks": ["2.1", "8.1"]
    },
    {
      "id": 2,
      "tasks": ["2.2", "3.1", "8.2"]
    },
    {
      "id": 3,
      "tasks": ["2.3", "3.2", "3.4", "6.2", "9.1"]
    },
    {
      "id": 4,
      "tasks": ["3.3", "4.1", "5.1", "6.1", "9.2"]
    },
    {
      "id": 5,
      "tasks": ["4.2", "5.2", "6.3", "7.1", "9.3", "12.1", "15.1", "18.1"]
    },
    {
      "id": 6,
      "tasks": ["4.3", "5.3", "7.2", "10.1", "12.2", "13.1", "15.2", "18.2", "19.1"]
    },
    {
      "id": 7,
      "tasks": ["10.2", "12.3", "13.2", "15.3", "17.1", "18.3", "19.2", "20.1", "21.1"]
    },
    {
      "id": 8,
      "tasks": ["10.3", "12.4", "13.3", "15.4", "17.2", "17.3", "19.3", "20.2", "21.2"]
    },
    {
      "id": 9,
      "tasks": ["12.5", "13.4", "14.1", "15.5", "17.4", "19.4", "20.3", "21.3"]
    },
    {
      "id": 10,
      "tasks": ["14.2", "17.5", "20.4", "22.1"]
    },
    {
      "id": 11,
      "tasks": ["14.3", "22.2", "23.2"]
    },
    {
      "id": 12,
      "tasks": ["22.3", "23.3"]
    },
    {
      "id": 13,
      "tasks": ["24.1"]
    },
    {
      "id": 14,
      "tasks": ["24.2"]
    },
    {
      "id": 15,
      "tasks": ["24.3"]
    }
  ]
}
```
