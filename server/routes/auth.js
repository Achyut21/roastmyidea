import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getDB } from '../db/connection.js';
import { requireAuth } from '../middleware/passport.js';

const router = Router();
const SALT_ROUNDS = 10;
const STARTING_BALANCE = 1000;

function makeToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function userResponse(user) {
  return {
    id: user._id,
    email: user.email,
    displayName: user.displayName,
    roastCoinBalance: user.roastCoinBalance,
  };
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, displayName, password } = req.body;
  if (!email || !displayName || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  const db = getDB();
  const existing = await db
    .collection('users')
    .findOne({ $or: [{ email }, { displayName }] });
  if (existing) {
    const field = existing.email === email ? 'Email' : 'Display name';
    return res.status(409).json({ error: `${field} already taken` });
  }
  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const result = await db.collection('users').insertOne({
    email,
    displayName,
    password: hashed,
    roastCoinBalance: STARTING_BALANCE,
    createdAt: new Date(),
  });
  const user = await db.collection('users').findOne({ _id: result.insertedId });
  const token = makeToken(user._id.toString());
  res.status(201).json({ token, user: userResponse(user) });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const db = getDB();
  const user = await db.collection('users').findOne({ email });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = makeToken(user._id.toString());
  res.json({ token, user: userResponse(user) });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: userResponse(req.user) });
});

export default router;
