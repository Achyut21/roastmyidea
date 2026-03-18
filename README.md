# RoastMyIdea

> Pitch your idea. The internet tells you why it'll fail. Defend it or die trying.

## Authors

- **Achyut Katiyar** — Ideas, Investments, Profiles
- **Soni Rusagara** — Roasts, Defenses

## Project Objective

RoastMyIdea is a platform where users pitch startup ideas, side projects, or any concept and the community decides if they are worth building. Users roast ideas with critiques, defend them with counter-arguments, and back them with virtual RoastCoin. After 7 days a verdict is revealed: FIREPROOF, TORCHED, or LUKEWARM.

## Tech Stack

- **Backend:** Node.js + Express (ESM)
- **Database:** MongoDB (native driver)
- **Frontend:** React 18 + Vite
- **Auth:** JWT + bcrypt
- **Deployment:** Vercel

## Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account

### Install

```bash
# Backend
npm install

# Frontend
cd client && npm install --include=dev
```

### Environment

```bash
cp .env.example .env
# Fill in MONGODB_URI and JWT_SECRET
```
