# RoastMyIdea

**Authors:** Achyut Katiyar, Soni Rusagara

**Class:** CS5610 Web Development — [https://johnguerra.co/classes/webDevelopment_online_spring_2026/](https://johnguerra.co/classes/webDevelopment_online_spring_2026/)

## Table of Contents

- [Project Objective](#project-objective)
- [Screenshot](#screenshot)
- [Design Document](#design-document)
- [Live Demo](#live-demo)
- [Demo Video](#demo-video)
- [Tech Stack](#tech-stack)
- [Database](#database)
- [How to Use](#how-to-use)
- [Instructions to Build](#instructions-to-build)
- [API Endpoints](#api-endpoints)
- [MongoDB Collections](#mongodb-collections)
- [Gen AI Usage](#gen-ai-usage)

## Project Objective

RoastMyIdea is a community platform where users pitch startup ideas, side projects, or any concept and the internet decides if they are worth building. Users roast ideas with critiques, defend them with counter-arguments, and back them with virtual RoastCoin. After 7 days a verdict is revealed: FIREPROOF, TORCHED, or LUKEWARM. Fireproof ideas pay out 1.5x to backers, torched ideas lose their stake, and lukewarm ideas get refunded.

## Screenshot

![RoastMyIdea Screenshot](screenshots/screenshot.png)

## Design Document

[View the full Design Document](https://github.com/Achyut21/roastmyidea/blob/main/docs/design-document.md) including project description, user personas, user stories, design mockups and technical decisions.

## Live Demo

[Deployed on Vercel](https://roastmyidea-nine.vercel.app/)

## Demo Video

[Watch on YouTube](https://youtu.be/PLACEHOLDER)

## Tech Stack

Node.js, Express (ESM), MongoDB (native driver), React 18 + Vite, Passport.js + JWT, bcrypt

## Database

The app uses MongoDB Atlas with five collections: users, ideas, roasts, defenses, and backs. The database is seeded with over 2200 records including 30 users, 150 ideas with unique titles, and hundreds of roasts, defenses, and investments.

## How to Use

**Step 1: Create an account.** Click "Log In" in the navbar, then switch to "Register". Enter a display name, email, and password. You will start with 1000 RoastCoin.

**Step 2: Browse ideas.** The home page shows all pitched ideas. Use the search bar to find ideas by keyword. Use the dropdowns to filter by category, status, or sort by newest, most invested, most roasted, or ending soon.

**Step 3: Read an idea.** Click any card to open the idea detail page. The left side shows the full pitch, problem statement, and target audience. The right sidebar shows the verdict timer, stats, and the invest widget.

**Step 4: Invest RoastCoin.** On an open idea's detail page, enter an amount (minimum 10 RC) and click Invest. If the idea ends FIREPROOF your stake returns at 1.5x. TORCHED ideas lose the stake. LUKEWARM ideas refund it.

**Step 5: Post a roast.** Scroll down on any idea detail page to the Roasts & Defenses section. Write a critique of at least 10 characters and click Post Roast. You cannot roast your own idea.

**Step 6: Post a defense.** Click "Defend" under any roast to counter it. Write a defense of at least 10 characters and click Defend. You cannot defend against your own roast.

**Step 7: Upvote.** Click the thumbs up on any roast or defense to upvote it. Upvote counts influence the final verdict when the 7-day window closes.

**Step 8: Pitch your own idea.** Click "+ Pitch Your Idea" on the browse page. Fill in the title, pitch, optional problem statement and target audience, and choose a category. Click Submit Pitch.

**Step 9: View your profile.** Click Profile in the navbar to see your stats, title badges, RC balance, and investment history.

## Instructions to Build

1. Clone the repository

```bash
git clone https://github.com/Achyut21/roastmyidea.git
cd roastmyidea
```

2. Install backend dependencies

```bash
npm install
```

3. Install frontend dependencies

```bash
cd client && npm install --include=dev && cd ..
```

4. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in:

```
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
```

5. Seed the database

```bash
npm run seed
```

This seeds 30 users, 150 ideas, ~400 backs, ~600 roasts, and ~1050 defenses (2200+ total records). All seeded users have password `password123`.

6. Run the backend locally

```bash
npm run dev
```

7. Run the frontend locally (separate terminal)

```bash
cd client && npm run dev
```

The frontend will be at `http://localhost:5173` and the API at `http://localhost:3000`.

## API Endpoints

### Auth

- `POST /api/auth/register` — Create a new user
- `POST /api/auth/login` — Log in and receive JWT
- `GET /api/auth/me` — Get current user info (requires auth)

### Ideas

- `GET /api/ideas` — Get ideas with pagination, filtering, and search (`?sort=`, `?category=`, `?status=`, `?q=`, `?lastId=`, `?lastVal=`)
- `GET /api/ideas/:id` — Get a single idea
- `POST /api/ideas` — Create a new idea (requires auth)
- `PUT /api/ideas/:id` — Update an idea (requires auth, author only)
- `DELETE /api/ideas/:id` — Delete an idea (requires auth, author only)

### Roasts

- `GET /api/ideas/:id/roasts` — Get all roasts for an idea
- `POST /api/ideas/:id/roasts` — Post a roast (requires auth)
- `PUT /api/roasts/:id` — Edit a roast (requires auth, author only)
- `DELETE /api/roasts/:id` — Delete a roast (requires auth, author only)
- `POST /api/roasts/:id/upvote` — Toggle upvote on a roast (requires auth)

### Defenses

- `GET /api/roasts/:id/defenses` — Get all defenses for a roast
- `POST /api/roasts/:id/defenses` — Post a defense (requires auth)
- `PUT /api/defenses/:id` — Edit a defense (requires auth, author only)
- `DELETE /api/defenses/:id` — Delete a defense (requires auth, author only)
- `POST /api/defenses/:id/upvote` — Toggle upvote on a defense (requires auth)

### Backs (Investments)

- `GET /api/ideas/:id/backs` — Get all backers for an idea
- `POST /api/ideas/:id/back` — Invest RoastCoin in an idea (requires auth)
- `GET /api/users/:id/backs` — Get investment history for a user

### Users

- `GET /api/users/:id/profile` — Get a user's public profile and stats

## MongoDB Collections

1. **users** — Stores registered users
   - `_id` : ObjectId
   - `displayName` : String (unique)
   - `email` : String (unique)
   - `password` : String (bcrypt hashed)
   - `roastCoinBalance` : Number
   - `stats` : Object (ideasPitched, roastsWritten, defensesWritten, ideasFireproof, ideasTorched, totalRcInvested)
   - `titles` : Object (roaster, defender, pitcher)
   - `createdAt` : Date

2. **ideas** — Stores pitched ideas
   - `_id` : ObjectId
   - `authorId` : ObjectId (reference to users)
   - `title` : String
   - `pitch` : String
   - `problem` : String (optional)
   - `targetAudience` : String (optional)
   - `category` : String
   - `roastCount` : Number
   - `defenseCount` : Number
   - `totalRoastCoinInvested` : Number
   - `verdict` : String (null, fireproof, torched, lukewarm)
   - `createdAt` : Date

3. **roasts** — Stores roast comments on ideas
   - `_id` : ObjectId
   - `ideaId` : ObjectId
   - `authorId` : ObjectId
   - `content` : String
   - `upvotedBy` : Array of ObjectIds
   - `upvoteCount` : Number
   - `defenseCount` : Number
   - `deleted` : Boolean
   - `createdAt` : Date

4. **defenses** — Stores defenses on roasts
   - `_id` : ObjectId
   - `ideaId` : ObjectId
   - `roastId` : ObjectId
   - `authorId` : ObjectId
   - `content` : String
   - `upvotedBy` : Array of ObjectIds
   - `upvoteCount` : Number
   - `deleted` : Boolean
   - `createdAt` : Date

5. **backs** — Stores RoastCoin investments
   - `_id` : ObjectId
   - `ideaId` : ObjectId
   - `backerId` : ObjectId
   - `amount` : Number
   - `createdAt` : Date

## Gen AI Usage

**Model**: Claude

**Prompt 1:** "How do I implement keyset pagination with a compound sort in MongoDB so that switching sort fields (createdAt, roastCount, etc.) still produces stable, consistent pages?"

**Prompt 2:** "What is the correct way to set up Passport.js with both a LocalStrategy for login and a JwtStrategy for protecting routes in an Express ESM project?"

**Prompt 3:** "How should I structure a $text index on multiple fields with different weights so that title matches rank higher than pitch body matches in MongoDB full-text search?"
