# 66 Day Challenge

A minimalist, discipline-focused PWA for tracking your 66-day habit challenge.

## Features

- **Live Clock Display** - Real-time clock at the top
- **Day Counter** - Track your current day out of 66
- **6 Daily Rules** - Custom rules with checkbox toggles
- **Daily Notes** - Write reflections and learnings
- **Best Streak & Failure Tracking** - See your progress stats
- **Complete/Fail Actions** - Advance or reset your streak
- **Local-Only Storage** - All data stays on your device

## Setup & Run

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build for Production
```bash
npm run build
npm start
```

## Project Structure

```
66-challenge-v2/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home (redirects to /today)
│   ├── globals.css         # Global styles
│   └── today/
│       └── page.tsx        # Main tracking screen
├── contexts/
│   └── AppContext.tsx      # Global state
├── lib/
│   └── storage.ts          # localStorage utilities
├── types/
│   └── index.ts            # TypeScript types
└── public/
    └── manifest.json       # PWA config
```

## Daily Rules

1. 45 Min Workout
2. Read 10 Pages (non-fiction)
3. Post 1 Piece of Content
4. Eat Healthy Meals Only
5. 10 Min Sauna
6. Sleep 8 Hours

## Features

- ✅ Real-time clock display
- ✅ Day counter (Day X / 66)
- ✅ Best streak tracking
- ✅ Failure count
- ✅ Daily notes with persistence
- ✅ Complete day (increments streak)
- ✅ Fail day (resets to Day 1)
- ✅ All data saved locally

## Design

Based on your uploaded design with:
- Orange/black brand colors (#FF4D00)
- Courier New monospace font
- Large, bold typography
- Clean checkbox toggles
- Daily notes section

## Data Storage

All data persists in browser `localStorage`:
- Current day
- Best streak
- Failure count
- Daily notes
- Rule completion status
- History

## License

MIT - Free for personal use
