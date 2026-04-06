# Implementation Plan: Smart Scheduler ↔ Calendar Sync

> Feature: P1 - Smart Scheduler ↔ Calendar Sync  
> Version: 1.0 | Created: April 2026

## 1. Overview

**Feature Summary:** Enable two-way synchronization between MatricMaster's Smart Scheduler and external calendars (Google Calendar), with automatic Focus Mode activation during scheduled study sessions.

**Business Value:**
- Increase focus session completion by 25%
- Reduce double-booking conflicts
- Enable study sessions to appear in user's primary calendar
- Pull external events to prevent scheduling conflicts

**Success Metrics:**
- Focus session completion: +25%
- Calendar sync adoption: 20% of active users
- Conflict detection: 90% accuracy

---

## 2. Work Breakdown

### 2.1 User Stories

| Story | Priority | Estimate |
|-------|----------|----------|
| Connect Google Calendar account | P0 | 3 pts |
| Sync study sessions to external calendar | P0 | 3 pts |
| View external events in Smart Scheduler | P0 | 5 pts |
| Auto-enable Focus Mode on session start | P1 | 3 pts |
| Manual sync trigger + auto-sync toggle | P1 | 2 pts |

### 2.2 Technical Tasks

#### Task 1: Google Calendar Integration
**Location:** `src/lib/calendar/google.ts` (new)

**Implementation:**
- OAuth 2.0 flow for Google Calendar access
- Store tokens securely (encrypted in DB)
- Refresh token handling
- Scope: `https://www.googleapis.com/auth/calendar`
- **Estimate:** 5 pts

#### Task 2: API - Calendar Sync Endpoints
**Location:** `src/app/api/calendar/sync/route.ts` (new)

**Endpoints:**
- POST `/api/calendar/sync/connect` - OAuth flow initiation
- POST `/api/calendar/sync/disconnect` - Revoke access
- GET `/api/calendar/sync/status` - Check sync status
- POST `/api/calendar/sync/push` - Push events to Google
- GET `/api/calendar/sync/pull` - Pull external events

**Estimate:** 5 pts

#### Task 3: API - Two-Way Sync Logic
**Location:** `src/app/api/calendar/sync/sync-all/route.ts` (new)

**Implementation:**
- Background job for periodic sync
- Conflict resolution (prefer MatricMaster events)
- Event mapping (study session → calendar event)
- Delta sync for efficiency
- **Estimate:** 5 pts

#### Task 4: Frontend - Calendar Connection UI
**Location:** `src/components/Calendar/ConnectCalendarButton.tsx` (new)

**Features:**
- "Connect Google Calendar" button in settings
- Connection status indicator
- Last sync timestamp
- Disconnect option
- **Estimate:** 3 pts

#### Task 5: Frontend - External Events Display
**Location:** `src/components/SmartScheduler/CalendarView.tsx` (modify)

**Changes:**
- Distinguish between internal and external events
- Different styling for external events (dashed border)
- Tooltip showing source (Google Calendar)
- Filter toggle: show/hide external events
- **Estimate:** 3 pts

#### Task 6: Integration - Focus Mode Auto-Activation
**Location:** `src/hooks/useFocusMode.ts` (modify)

**Changes:**
- Check upcoming calendar events
- If study session within 5 minutes → prompt to enable Focus Mode
- Auto-enable if user enabled "auto-focus" setting
- **Estimate:** 3 pts

---

## 3. Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend                                 │
│  ┌────────────────┐  ┌────────────────┐                   │
│  │ Settings Page  │  │ Calendar View  │                   │
│  │ - Connect Btn  │  │ - External evt │                   │
│  └───────┬────────┘  └───────┬────────┘                   │
│          │                   │                            │
└──────────┼───────────────────┼────────────────────────────┘
           │                   │
           ▼                   ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐    │
│  │ /sync/connect│  │ /sync/push  │  │ /sync/pull     │    │
│  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘    │
│         │                │                  │              │
└─────────┼────────────────┼──────────────────┼──────────────┘
          │                │                  │
          ▼                ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│              Google Calendar API                            │
│  - OAuth 2.0 authentication                                 │
│  - Calendar events CRUD                                     │
│  - Watch API for real-time updates                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. API Contracts

### 4.1 New Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/calendar/sync/auth-url` | Get OAuth URL |
| GET | `/api/calendar/sync/callback` | OAuth callback |
| POST | `/api/calendar/sync/disconnect` | Revoke access |
| GET | `/api/calendar/sync/status` | Connection status |
| POST | `/api/calendar/sync/push` | Push study sessions |
| GET | `/api/calendar/external-events` | Get external events |
| POST | `/api/calendar/sync/trigger` | Manual sync |

### 4.2 Data Models

```typescript
interface CalendarConnection {
  id: string;
  userId: string;
  provider: 'google';
  accessToken: string; // encrypted
  refreshToken: string; // encrypted
  expiresAt: Date;
  calendarId: string; // primary calendar
  lastSyncAt: Date;
  syncEnabled: boolean;
}

interface ExternalEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  source: 'google';
  isAllDay: boolean;
  location?: string;
}
```

---

## 5. Database Schema

### 5.1 New Tables

```sql
CREATE TABLE calendar_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  provider TEXT NOT NULL DEFAULT 'google',
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  expires_at TIMESTAMP,
  calendar_id TEXT,
  last_sync_at TIMESTAMP,
  sync_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE synced_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  external_event_id TEXT,
  internal_event_id UUID,
  last_synced_at TIMESTAMP,
  PRIMARY KEY (user_id, external_event_id)
);
```

---

## 6. OAuth Flow

### 6.1 Authorization URL

```
https://accounts.google.com/o/oauth2/v2/auth?
  client_id={CLIENT_ID}&
  redirect_uri={REDIRECT_URI}&
  response_type=code&
  scope=https://www.googleapis.com/auth/calendar&
  access_type=offline&
  prompt=consent
```

### 6.2 Token Exchange

1. User clicks "Connect Google Calendar"
2. Redirect to Google OAuth
3. Callback with authorization code
4. Exchange code for access + refresh tokens
5. Store encrypted tokens in database
6. Redirect back to app with success message

---

## 7. Sync Logic

### 7.1 Push (MatricMaster → Google)

```typescript
async function pushStudySessions(userId: string) {
  const sessions = await getUpcomingStudySessions(userId);
  
  for (const session of sessions) {
    const event = {
      summary: `📚 Study: ${session.subject}`,
      description: `MatricMaster AI Study Session\n${session.topic}`,
      start: { dateTime: session.startTime },
      end: { dateTime: session.endTime },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 10 }
        ]
      }
    };
    
    await googleCalendar.events.insert({
      calendarId: 'primary',
      resource: event
    });
  }
}
```

### 7.2 Pull (Google → MatricMaster)

```typescript
async function pullExternalEvents(userId: string) {
  const connection = await getCalendarConnection(userId);
  
  const events = await googleCalendar.events.list({
    calendarId: connection.calendarId,
    timeMin: new Date().toISOString(),
    maxResults: 50,
    singleEvents: true,
    orderBy: 'startTime'
  });
  
  return events.data.items?.map(mapGoogleEventToExternal);
}
```

---

## 8. Focus Mode Integration

### 8.1 Auto-Activation Logic

```typescript
// Check every minute
useEffect(() => {
  const interval = setInterval(async () => {
    const upcomingSession = await getNextStudySession(userId);
    const minutesUntilSession = getMinutesUntil(upcomingSession);
    
    if (minutesUntilSession <= 5 && minutesUntilSession > 0) {
      if (userSettings.autoEnableFocus) {
        enableFocusMode();
      } else {
        showFocusPrompt(upcomingSession);
      }
    }
  }, 60000);
  
  return () => clearInterval(interval);
}, []);
```

---

## 9. UI/UX Design

### 9.1 Settings Page

- Connection status card
- "Connect Google Calendar" button (or "Disconnect")
- Last sync timestamp
- Sync toggle (on/off)
- "Sync Now" button

### 9.2 Calendar View

- External events: dashed border, gray background
- Tooltip: "Synced from Google Calendar"
- Filter: "Show external events" toggle
- Conflict warning: red border when overlapping

---

## 10. Edge Cases & Error Handling

| Scenario | Handling |
|----------|----------|
| OAuth token expired | Auto-refresh using refresh token |
| User revokes access | Show "Reconnect" prompt |
| Sync conflict | Prefer MatricMaster events |
| Rate limiting | Exponential backoff, queue retries |
| Offline | Queue changes, sync on reconnect |

---

## 11. Security Considerations

- Tokens encrypted at rest (AES-256)
- HTTPS only for all calendar communications
- Minimal scope requested
- Token rotation on each use
- Revoke on user request

---

## 12. Testing Requirements

- [ ] OAuth flow end-to-end
- [ ] Token refresh mechanism
- [ ] Push sync: study session → Google event
- [ ] Pull sync: Google events → calendar view
- [ ] Focus mode auto-activation
- [ ] Conflict detection

---

## 13. Dependencies

- **Blocked by:** None
- **Enables:** Focus Mode auto-activation

---

## 14. Timeline Estimate

| Phase | Tasks | Estimate |
|-------|-------|----------|
| Phase 1 | Google OAuth + token management | 5 pts |
| Phase 2 | Push sync (study sessions → Google) | 5 pts |
| Phase 3 | Pull sync (Google → Smart Scheduler) | 5 pts |
| Phase 4 | Frontend UI + Focus Mode integration | 5 pts |
| **Total** | | **20 pts** |

---

## 15. Files to Modify/Create

### New Files
- `src/lib/calendar/google.ts`
- `src/lib/calendar/encryption.ts`
- `src/app/api/calendar/sync/auth-url/route.ts`
- `src/app/api/calendar/sync/callback/route.ts`
- `src/app/api/calendar/sync/disconnect/route.ts`
- `src/app/api/calendar/sync/status/route.ts`
- `src/app/api/calendar/sync/push/route.ts`
- `src/app/api/calendar/sync/pull/route.ts`
- `src/components/Calendar/ConnectCalendarButton.tsx`
- `src/components/Calendar/ExternalEventBadge.tsx`

### Modified Files
- `src/components/SmartScheduler/CalendarView.tsx`
- `src/hooks/useFocusMode.ts`
- `src/app/settings/page.tsx`