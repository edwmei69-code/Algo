# algo ⚡

> Meet the people your algorithm would have shown you.

Omegle-style social app that matches users based on shared interests. Built with Next.js, Supabase, and Tailwind CSS.

---

## 🚀 Quick Start

### 1. Clone & install

```bash
git clone https://github.com/your-username/algo.git
cd algo
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Navigate to **SQL Editor** and run the entire contents of `supabase/schema.sql`.
3. Go to **Database > Replication** and enable realtime for:
   - `messages`
   - `rooms`
   - `match_queue`

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in your Supabase values from **Project Settings > API**:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 📁 Project Structure

```
algo/
├── app/
│   ├── auth/
│   │   ├── login/page.tsx       # Login page
│   │   └── signup/page.tsx      # Signup page
│   ├── main/
│   │   ├── interests/page.tsx   # Interest selection
│   │   ├── match/page.tsx       # Matching / lobby
│   │   ├── chat/[roomId]/       # Real-time chat room
│   │   └── profile/page.tsx     # User profile
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Landing page
│   └── globals.css
├── components/
│   └── chat/
│       ├── MessageBubble.tsx    # Chat message UI
│       └── ReportModal.tsx      # Report user modal
├── hooks/
│   ├── useChat.ts               # Real-time chat hook
│   ├── useMatch.ts              # Matching logic hook
│   └── useProfile.ts            # Profile data hook
├── lib/
│   ├── supabase/
│   │   ├── client.ts            # Browser Supabase client
│   │   └── server.ts            # Server Supabase client
│   ├── matching.ts              # Match queue logic
│   └── utils.ts                 # Utility functions
├── types/index.ts               # TypeScript types
├── middleware.ts                 # Auth route protection
└── supabase/schema.sql          # Full DB schema
```

---

## 🗄️ Database

See `supabase/schema.sql` for the full schema. Key tables:

| Table | Purpose |
|---|---|
| `profiles` | User profiles (username, age, country, interests) |
| `match_queue` | Users waiting for a match |
| `rooms` | Active/ended chat sessions |
| `messages` | Chat messages (real-time) |
| `reports` | User reports |
| `blocks` | Blocked user pairs |

---

## 🔌 Adding Video Chat (WebRTC)

The app is structured for video chat to be added:

1. Install `simple-peer`: `npm install simple-peer`
2. Create `hooks/useWebRTC.ts` with peer connection logic
3. Add a `VideoChat` component in `components/chat/`
4. In the chat room, add a toggle between text and video modes
5. Use Supabase realtime as the signalling channel (send SDP offers/answers via broadcast)

---

## 🚀 Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Add your environment variables in the Vercel dashboard under **Settings > Environment Variables**.

---

## 🧭 Roadmap

- [ ] Video chat (WebRTC)
- [ ] Algo Premium (Stripe)
- [ ] Interest-based rooms / groups
- [ ] Anonymous mode
- [ ] Mobile app (React Native)
