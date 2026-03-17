# WhatsApp Study Buddy Implementation Plan

> **For agentic workers:** Use this plan to implement the WhatsApp bot.

**Goal:** Allow students to message WhatsApp for quick answers and study reminders.

**Architecture:** WhatsApp Webhook → FAQ Cache → Gemini API → Response

---

## File Structure

```
src/
├── app/
│   └── api/
│       └── webhooks/
│           └── whatsapp/
│               └── route.ts    # NEW - WhatsApp webhook
├── lib/
│   └── whatsapp/
│       └── client.ts           # NEW - WhatsApp API client
├── services/
│   └── whatsapp-service.ts     # NEW - Business logic
└── env.local                  # MODIFY - Add WhatsApp credentials
```

---

## Implementation Tasks

### Task 1: WhatsApp API Client

**Files:**
- Create: `src/lib/whatsapp/client.ts`

- [ ] **Step 1: Create the client**

```typescript
// src/lib/whatsapp/client.ts
import { WhatsApp } from '@phosphor-icons/react';

interface WhatsAppMessage {
  from: string;
  to: string;
  body: string;
}

export class WhatsAppClient {
  private phoneNumberId: string;
  private accessToken: string;
  private apiUrl: string;

  constructor() {
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
    this.apiUrl = 'https://graph.facebook.com/v18.0';
  }

  async sendMessage(to: string, message: string): Promise<void> {
    if (!this.accessToken || !this.phoneNumberId) {
      console.warn('WhatsApp not configured');
      return;
    }

    try {
      const response = await fetch(
        `${this.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to,
            type: 'text',
            text: { body: message },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error('WhatsApp send error:', error);
      }
    } catch (error) {
      console.error('WhatsApp error:', error);
    }
  }

  async sendTemplate(to: string, templateName: string, components?: unknown): Promise<void> {
    // For study reminders, etc.
  }
}

export const whatsappClient = new WhatsAppClient();
```

- [ ] **Step 2: Commit**
```bash
git add src/lib/whatsapp/client.ts
git commit -m "feat: add WhatsApp API client"
```

---

### Task 2: WhatsApp Service (Business Logic)

**Files:**
- Create: `src/services/whatsapp-service.ts`

- [ ] **Step 1: Create the service**

```typescript
// src/services/whatsapp-service.ts
import { whatsappClient } from '@/lib/whatsapp/client';
import { getCachedResponse } from '@/lib/cache/vercel-kv';
import { generateAI, AI_MODELS } from '@/lib/ai-config';

const GREETING = `Hi! I'm your MatricMaster Study Buddy. 

I can help you with:
📚 Study questions
📊 APS calculation
🎓 University info
📝 Past paper help

Just ask me anything!`;

const FALLBACK = `That's a great question! For detailed answers and practice, check the MatricMaster app. 

Quick tip: Visit matrimaster.ai to:
• Practice past papers
• Get AI explanations
• Track your progress

Need more help? Ask me another question!`;

export async function handleWhatsAppMessage(
  from: string,
  message: string
): Promise<string> {
  const normalized = message.toLowerCase().trim();

  // Check for greeting
  if (normalized.match(/^(hi|hello|hey|start)/)) {
    return GREETING;
  }

  // Check FAQ cache first
  const cached = await getCachedResponse(normalized);
  if (cached) {
    return cached;
  }

  // Use AI for complex questions
  try {
    const response = await generateAI({
      prompt: `You are a helpful South African matric study assistant. 
Keep answers concise (under 160 characters for WhatsApp).
Student asks: ${message}`,
      model: AI_MODELS.PRIMARY,
    });

    return response.slice(0, 400); // Truncate for WhatsApp
  } catch (error) {
    console.error('WhatsApp AI error:', error);
    return FALLBACK;
  }
}

export async function sendStudyReminder(to: string): Promise<void> {
  const reminder = `📚 Study Reminder from MatricMaster!

Time to practice some questions today.
Keep your streak going!

Visit matrimaster.ai to continue learning.`;

  await whatsappClient.sendMessage(to, reminder);
}
```

- [ ] **Step 2: Commit**
```bash
git add src/services/whatsapp-service.ts
git commit -m "feat: add WhatsApp service business logic"
```

---

### Task 3: WhatsApp Webhook

**Files:**
- Create: `src/app/api/webhooks/whatsapp/route.ts`

- [ ] **Step 1: Create the webhook**

```typescript
// src/app/api/webhooks/whatsapp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { handleWhatsAppMessage } from '@/services/whatsapp-service';
import { whatsappClient } from '@/lib/whatsapp/client';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // Verify webhook
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
  
  if (mode === 'subscribe' && token === verifyToken) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];

    if (!message) {
      return NextResponse.json({ ok: true });
    }

    const from = message.from;
    const text = message.text?.body;

    if (!text) {
      return NextResponse.json({ ok: true });
    }

    // Handle the message
    const response = await handleWhatsAppMessage(from, text);

    // Send response
    await whatsappClient.sendMessage(from, response);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit**
```bash
git add src/app/api/webhooks/whatsapp/route.ts
git commit -m "feat: add WhatsApp webhook endpoint"
```

---

### Task 4: Environment Variables

**Files:**
- Modify: `.env.example`

- [ ] **Step 1: Add WhatsApp vars**

```bash
# WhatsApp Business API
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_VERIFY_TOKEN=your_verify_token
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
```

- [ ] **Step 2: Commit**
```bash
git add .env.example
git commit -m "docs: add WhatsApp env vars to .env.example"
```

---

## Summary

| Task | Files | Status |
|------|-------|--------|
| 1. WhatsApp Client | src/lib/whatsapp/client.ts | Pending |
| 2. WhatsApp Service | src/services/whatsapp-service.ts | Pending |
| 3. Webhook Endpoint | src/app/api/webhooks/whatsapp/route.ts | Pending |
| 4. Environment Vars | .env.example | Pending |

## Testing Checklist

- [ ] Webhook verifies correctly with Meta
- [ ] Incoming messages trigger AI response
- [ ] FAQ cache works for common questions
- [ ] Response sends back to WhatsApp user

## WhatsApp Business Setup Required

1. Create Meta Developer account
2. Create WhatsApp Business app
3. Get phone number ID
4. Generate access token
5. Set webhook URL to `https://yourapp.com/api/webhooks/whatsapp`
6. Verify with token
7. Subscribe to messages
