<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# MatricMaster AI

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

**Master your Matric exams through interactive practice.** Access past papers, step-by-step guides, and AI-powered explanations for South African Grade 12 students.

## Features

- 📚 **Interactive Past Papers** - Practice with real NSC exam questions
- 🤖 **AI-Powered Explanations** - Get instant help with difficult concepts
- 📊 **Progress Tracking** - Monitor your learning journey with detailed analytics
- 🎯 **Personalized Study Plans** - AI-generated study paths tailored to your goals
- 🏆 **Gamification** - Earn achievements, maintain streaks, and climb the leaderboard
- 🌙 **Dark Mode** - Comfortable studying at any time
- 📱 **Mobile-First Design** - Optimized for mobile devices

## Tech Stack

- **Framework:** Next.js 16 with App Router
- **UI:** React 19, Tailwind CSS 4, Radix UI
- **AI:** Google Gemini API
- **Language:** TypeScript
- **Styling:** Tailwind CSS with custom design system

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm, yarn, or bun
- Google Gemini API key ([Get one here](https://aistudio.google.com/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd matricmaster-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
   ```
   
   You can copy `.env.local.example` as a template:
   ```bash
   cp .env.local.example .env.local
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   bun dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run linter
- `npm run lint:fix` - Fix linting issues
- `npm run format` - Format code
- `npm run typecheck` - Run TypeScript type checking
- `npm run test` - Run tests

## Project Structure

```
matricmaster-ai/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/        # React components
│   │   ├── Layout/        # Layout components
│   │   └── ui/            # UI primitives
│   ├── screens/           # Screen/page components
│   ├── services/          # API services
│   ├── constants/         # Constants and mock data
│   ├── hooks/             # Custom React hooks
│   ├── styles/            # Global styles
│   └── types/             # TypeScript types
├── public/                # Static assets
└── next.config.mjs        # Next.js configuration
```

## Production Deployment

### Build for Production

```bash
npm run build
npm run start
```

### Environment Variables for Production

Make sure to set the following environment variables in your production environment:

- `NEXT_PUBLIC_GEMINI_API_KEY` - Your Google Gemini API key

### Deployment Platforms

This app can be deployed on:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **Railway**
- **Any Node.js hosting platform**

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is private and proprietary.

## Support

For issues and questions, please open an issue on the repository.
