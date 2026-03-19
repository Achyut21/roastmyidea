import { Router } from 'express';
import { getDB } from '../db/connection.js';
import { requireAuth } from '../middleware/passport.js';
import { parseId } from '../utils/parseId.js';

const router = Router();

router.post('/ideas/:id/back', requireAuth, async (req, res) => {
  const db = getDB();
  const ideaId = parseId(req.params.id);
  if (!ideaId) return res.status(400).json({ error: 'Invalid idea ID' });

  const { amount } = req.body;
  if (!amount || typeof amount !== 'number' || amount < 10) {
    return res.status(400).json({ error: 'Minimum investment is 10 RC' });
  }

  const idea = await db.collection('ideas').findOne({ _id: ideaId });
  if (!idea) return res.status(404).json({ error: 'Idea not found' });
  if (idea.verdict !== null)
    return res.status(400).json({ error: 'Idea is closed' });

  const deadline = new Date(idea.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);
  if (Date.now() > deadline)
    return res.status(400).json({ error: 'Idea is closed' });

  const backerId = req.user._id;
  if (idea.authorId.toString() === req.user._id.toString()) {
    return res.status(403).json({ error: "You can't back your own idea" });
  }

  const backer = await db.collection('users').findOne({ _id: backerId });
  if (backer.roastCoinBalance < amount) {
    return res.status(400).json({ error: 'Insufficient RoastCoin balance' });
  }

  await db
    .collection('users')
    .updateOne({ _id: backerId }, { $inc: { roastCoinBalance: -amount } });
  await db
    .collection('ideas')
    .updateOne({ _id: ideaId }, { $inc: { totalRoastCoinInvested: amount } });

  const back = await db.collection('backs').insertOne({
    ideaId,
    backerId,
    amount,
    createdAt: new Date(),
  });

  const newBalance = backer.roastCoinBalance - amount;
  res.status(201).json({ back: { _id: back.insertedId }, newBalance });
});

router.get('/ideas/:id/backs', async (req, res) => {
  const db = getDB();
  const ideaId = parseId(req.params.id);
  if (!ideaId) return res.status(400).json({ error: 'Invalid idea ID' });

  const backs = await db
    .collection('backs')
    .find({ ideaId })
    .sort({ createdAt: 1 })
    .toArray();

  const backerIds = [...new Set(backs.map((b) => b.backerId.toString()))];
  const users = await db
    .collection('users')
    .find({ _id: { $in: backerIds.map(parseId) } })
    .project({ displayName: 1 })
    .toArray();
  const userMap = Object.fromEntries(
    users.map((u) => [u._id.toString(), u.displayName])
  );

  const result = backs.map((b) => ({
    ...b,
    backerDisplayName: userMap[b.backerId.toString()] || 'Unknown',
  }));

  res.json({ backs: result });
});

router.get('/users/:id/backs', async (req, res) => {
  const db = getDB();
  const backerId = parseId(req.params.id);
  if (!backerId) return res.status(400).json({ error: 'Invalid user ID' });

  const backs = await db
    .collection('backs')
    .find({ backerId })
    .sort({ createdAt: -1 })
    .toArray();

  const ideaIds = [...new Set(backs.map((b) => b.ideaId.toString()))];
  const ideas = await db
    .collection('ideas')
    .find({ _id: { $in: ideaIds.map(parseId) } })
    .project({ title: 1, verdict: 1 })
    .toArray();
  const ideaMap = Object.fromEntries(ideas.map((i) => [i._id.toString(), i]));

  const result = backs.map((b) => ({
    ...b,
    ideaTitle: ideaMap[b.ideaId.toString()]?.title || 'Unknown',
    verdict: ideaMap[b.ideaId.toString()]?.verdict || null,
  }));

  res.json({ backs: result });
});

export default router;
