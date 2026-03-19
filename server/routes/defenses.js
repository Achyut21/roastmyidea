import { Router } from 'express';
import { getDB } from '../db/connection.js';
import { requireAuth } from '../middleware/passport.js';
import { parseId } from '../utils/parseId.js';
import { ObjectId } from 'mongodb';

const router = Router();

router.get('/roasts/:id/defenses', async (req, res) => {
  const db = getDB();
  const roastId = parseId(req.params.id);
  if (!roastId) return res.status(400).json({ error: 'Invalid roast ID' });
  const defenses = await db.collection('defenses').find({ roastId, deleted: false }).sort({ upvoteCount: -1, createdAt: -1 }).toArray();
  const authorIds = [...new Set(defenses.map((d) => d.authorId.toString()))];
  const authors = await db.collection('users').find({ _id: { $in: authorIds.map((id) => ObjectId.createFromHexString(id)) } }).project({ displayName: 1 }).toArray();
  const authorMap = Object.fromEntries(authors.map((a) => [a._id.toString(), a.displayName]));
  res.json({ defenses: defenses.map((d) => ({ ...d, authorDisplayName: authorMap[d.authorId.toString()] || 'Unknown' })) });
});

router.post('/roasts/:id/defenses', requireAuth, async (req, res) => {
  const db = getDB();
  const roastId = parseId(req.params.id);
  if (!roastId) return res.status(400).json({ error: 'Invalid roast ID' });
  const roast = await db.collection('roasts').findOne({ _id: roastId, deleted: false });
  if (!roast) return res.status(404).json({ error: 'Roast not found' });
  const idea = await db.collection('ideas').findOne({ _id: roast.ideaId });
  if (!idea) return res.status(404).json({ error: 'Idea not found' });
  if (idea.verdict !== null) return res.status(400).json({ error: 'Idea is closed' });
  const deadline = new Date(idea.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);
  if (Date.now() > deadline) return res.status(400).json({ error: 'Idea is closed' });
  const { content } = req.body;
  if (!content || content.trim().length < 10 || content.trim().length > 500) return res.status(400).json({ error: 'Defense must be between 10 and 500 characters' });
  const authorId = req.user._id;
  if (roast.authorId.toString() === authorId.toString()) return res.status(403).json({ error: "You can't defend against your own roast" });
  const existing = await db.collection('defenses').findOne({ roastId, authorId, deleted: false });
  if (existing) return res.status(400).json({ error: 'You already defended against this roast' });
  const result = await db.collection('defenses').insertOne({ ideaId: roast.ideaId, roastId, authorId, content: content.trim(), upvotedBy: [], upvoteCount: 0, deleted: false, createdAt: new Date() });
  await db.collection('ideas').updateOne({ _id: roast.ideaId }, { $inc: { defenseCount: 1 } });
  await db.collection('roasts').updateOne({ _id: roastId }, { $inc: { defenseCount: 1 } });
  const defense = await db.collection('defenses').findOne({ _id: result.insertedId });
  defense.authorDisplayName = req.user.displayName;
  res.status(201).json({ defense });
});

router.put('/defenses/:id', requireAuth, async (req, res) => {
  const db = getDB();
  const defenseId = parseId(req.params.id);
  if (!defenseId) return res.status(400).json({ error: 'Invalid defense ID' });
  const defense = await db.collection('defenses').findOne({ _id: defenseId, deleted: false });
  if (!defense) return res.status(404).json({ error: 'Defense not found' });
  if (defense.authorId.toString() !== req.user._id.toString()) return res.status(403).json({ error: 'Not your defense' });
  const { content } = req.body;
  if (!content || content.trim().length < 10 || content.trim().length > 500) return res.status(400).json({ error: 'Defense must be between 10 and 500 characters' });
  await db.collection('defenses').updateOne({ _id: defenseId }, { $set: { content: content.trim() } });
  const updated = await db.collection('defenses').findOne({ _id: defenseId });
  updated.authorDisplayName = req.user.displayName;
  res.json({ defense: updated });
});

router.delete('/defenses/:id', requireAuth, async (req, res) => {
  const db = getDB();
  const defenseId = parseId(req.params.id);
  if (!defenseId) return res.status(400).json({ error: 'Invalid defense ID' });
  const defense = await db.collection('defenses').findOne({ _id: defenseId, deleted: false });
  if (!defense) return res.status(404).json({ error: 'Defense not found' });
  if (defense.authorId.toString() !== req.user._id.toString()) return res.status(403).json({ error: 'Not your defense' });
  await db.collection('defenses').updateOne({ _id: defenseId }, { $set: { deleted: true } });
  await db.collection('ideas').updateOne({ _id: defense.ideaId }, { $inc: { defenseCount: -1 } });
  await db.collection('roasts').updateOne({ _id: defense.roastId }, { $inc: { defenseCount: -1 } });
  res.json({ message: 'Defense deleted' });
});

router.post('/defenses/:id/upvote', requireAuth, async (req, res) => {
  const db = getDB();
  const defenseId = parseId(req.params.id);
  if (!defenseId) return res.status(400).json({ error: 'Invalid defense ID' });
  const defense = await db.collection('defenses').findOne({ _id: defenseId, deleted: false });
  if (!defense) return res.status(404).json({ error: 'Defense not found' });
  const userId = req.user._id;
  const alreadyVoted = defense.upvotedBy.some((id) => id.toString() === userId.toString());
  if (alreadyVoted) {
    await db.collection('defenses').updateOne({ _id: defenseId }, { $pull: { upvotedBy: userId }, $inc: { upvoteCount: -1 } });
  } else {
    await db.collection('defenses').updateOne({ _id: defenseId }, { $addToSet: { upvotedBy: userId }, $inc: { upvoteCount: 1 } });
  }
  const updated = await db.collection('defenses').findOne({ _id: defenseId });
  res.json({ upvoteCount: updated.upvoteCount, upvoted: !alreadyVoted });
});

export default router;
