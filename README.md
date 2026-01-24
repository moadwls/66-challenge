# 66 Challenge

Build unbreakable discipline through consistent daily habits. A 66-day habit tracking app.

## Features

- Track daily habits across a 66-day challenge
- Progress photos gallery
- Friends & social features (Pro)
- Squads - compete with groups of 3-8 people (Pro)
- Activity feed with reactions
- Achievement badges
- Leaderboard

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Auth, Database)
- **Mobile**: Capacitor (iOS)
- **Deployment**: Vercel (Web), App Store (iOS)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/66-challenge.git
cd 66-challenge

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file with:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Deployment

### Vercel (Web)

1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### iOS (Capacitor)

```bash
# Build for iOS
npm run ios

# Or just sync
npm run ios:sync
```

Then open Xcode and build to device.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production (Vercel)
- `npm run ios` - Build and open iOS project
- `npm run ios:sync` - Build and sync iOS without opening Xcode

## License

Private - All rights reserved.
