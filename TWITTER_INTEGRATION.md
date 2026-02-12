# Twitter OAuth Integration Guide

## 🐦 Setting up Twitter Login for MatricMaster

### Step 1: Create Twitter Developer Account
1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Apply for a developer account if you don't have one
3. Create a new Project and App

### Step 2: Configure Your Twitter App
1. In your Twitter App dashboard, go to **Settings**
2. Under **Authentication settings**, enable:
   - ✅ **3-legged OAuth** 
   - ✅ **Request email address from users**
3. Set callback URLs:
   ```
   http://localhost:3000/api/auth/callback/twitter
   https://your-production-domain.com/api/auth/callback/twitter
   ```

### Step 3: Get Your Credentials
1. Go to **Keys and Tokens** section
2. Copy your:
   - **API Key** (Consumer Key) → `TWITTER_CLIENT_ID`
   - **API Secret** (Consumer Secret) → `TWITTER_CLIENT_SECRET`

### Step 4: Update Environment Variables
Update your `.env.local` file:

```env
TWITTER_CLIENT_ID="your_actual_twitter_api_key_here"
TWITTER_CLIENT_SECRET="your_actual_twitter_api_secret_here"
```

> **Security Note:** Never commit `.env.local` to version control. Ensure `.env.local` is listed in `.gitignore` so sensitive credentials are not checked in. Use separate credentials for development and production environments.

### Step 5: Test the Integration
1. Restart your development server
2. Navigate to your login page
3. Click "Sign in with Twitter"
4. You should be redirected to Twitter for authentication

## 🛠️ Technical Implementation

### Backend Configuration
The Twitter provider is already configured in `src/lib/auth.ts` with explicit validation:

```typescript
// Validate Twitter OAuth credentials
const twitterClientId = process.env.TWITTER_CLIENT_ID;
const twitterClientSecret = process.env.TWITTER_CLIENT_SECRET;

if (!twitterClientId || !twitterClientSecret) {
	console.warn(
		'⚠️ Twitter OAuth credentials are not configured. Sign in with Twitter will not be available.'
	);
}

const socialProviders: Record<string, { clientId: string; clientSecret: string }> = {
	google: {
		clientId: process.env.GOOGLE_CLIENT_ID ?? '',
		clientSecret: process.env.GOOGLE_SECRET_KEY ?? '',
	},
};

// Only add Twitter provider if credentials are available
if (twitterClientId && twitterClientSecret) {
	socialProviders.twitter = {
		clientId: twitterClientId,
		clientSecret: twitterClientSecret,
	};
}
```

### Frontend Usage
Use the Twitter login component:

```typescript
import { signIn } from '@/lib/auth-client';

// Trigger Twitter sign-in
await signIn.social({
  provider: 'twitter',
  callbackURL: '/dashboard',
});
```

### Component Example
See `src/components/TwitterLoginDemo.tsx` for a complete implementation.

## 🔧 Troubleshooting

### Common Issues:

1. **"Social provider twitter is missing clientId or clientSecret"**
   - Ensure `TWITTER_CLIENT_ID` and `TWITTER_CLIENT_SECRET` are set in `.env.local`
   - Restart your development server after updating env vars

2. **Callback URL mismatch**
   - Make sure your Twitter app's callback URLs match your deployment
   - Include both localhost and production URLs

3. **Email permission issues**
   - Ensure "Request email address from users" is enabled in Twitter app settings
   - Some Twitter accounts may not have email addresses associated

## 🚀 Production Deployment

When deploying to production:
1. Update callback URLs in Twitter Developer Portal
2. Set environment variables in your hosting platform (Vercel, Netlify, etc.)
3. Test thoroughly in production environment

## 📱 User Experience

Users will:
1. Click "Sign in with Twitter" button
2. Be redirected to Twitter authorization page
3. Grant permission to your app
4. Be redirected back to your application
5. Automatically logged in with their Twitter profile

The system will automatically create an account if it's their first time, or log them in if they've used Twitter before.