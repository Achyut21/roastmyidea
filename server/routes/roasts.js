import { Router } from 'express';
import { getDB } from '../db/connection.js';
import { requireAuth } from '../middleware/passport.js';
import { parseId } from '../utils/parseId.js';
import { ObjectId } from 'mongodb';

const router = Router();

router.get('/ideas/:id/roasts', async (req, res) => {
  const db = getDB();
  const ideaId = parseId(req.params.id);
  if (!ideaId) return res.status(400).json({ error: 'Invalid idea ID' });
  const roasts = await db
    .collection('roasts')
    .find({ ideaId, deleted: false })
    .sort({ upvoteCount: -1, createdAt: -1 })
    .toArray();
  const authorIds = [...new Set(roasts.map((r) => r.authorId.toString()))];
  const authors = await db
    .collection('users')
    .find({ _id: { $in: authorIds.map((id) => ObjectId.createFromHexString(id)) } })
    .project({ displayName: 1 })
    .toArray();
  const authorMap = Object.fromEntries(
    authors.map((a) => [a._id.toString(), a.displayName])
  );
  res.json({
    roasts: roasts.map((r) => ({
      ...r,
      authorDisplayName: authorMap[r.authorId.toString()] || 'Unknown',
    })),
  });
});

router.post('/ideas/:id/roasts', requireAuth, async (req, res) => {
  const db = getDB();
  const ideaId = parseId(req.params.id);
  if (!ideaId) return res.status(400).json({ error: 'Invalid idea ID' });
  const idea = await db.collection('ideas').findOne({ _id: ideaId });
  if (!idea) return res.status(404).json({ error: 'Idea not found' });
  if (idea.verdict !== null) return res.status(400).json({ error: 'Idea is closed' });
  const deadline = new Date(idea.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);
  if (Date.now() > deadline) return res.status(400).json({ error: 'Idea is closed' });
  const { content } = req.body;
  if (!content || content.trim().length < 10 || content.trim().length > 500)
    return res.status(400).json({ error: 'Roast must be between 10 and 500 characters' });
  const authorId = req.user._id;
  if (idea.authorId.toString() === authorId.toString())
    return res.status(403).json({ error: "You can't roast your own idea" });
  const existing = await db
    .collection('roasts')
    .findOne({ ideaId, authorId, deleted: false });
  if (existing) return res.status(400).json({ error: 'You already roasted this idea' });
  const result = await db
    .collection('roasts')
    .insertOne({
      ideaId,
      authorId,
      content: content.trim(),
      upvotedBy: [],
      upvoteCount: 0,
      defenseCount: 0,
      deleted: false,
      createdAt: new Date(),
    });
  await db.collection('ideas').updateOne({ _id: ideaId }, { $inc: { roastCount: 1 } });
  const roast = await db.collection('roasts').findOne({ _id: result.insertedId });
  roast.authorDisplayName = req.user.displayName;
  res.status(201).json({ roast });
});

router.put('/roasts/:id', requireAuth, async (req, res) => {
  const db = getDB();
  const roastId = parseId(req.params.id);
  if (!roastId) return res.status(400).json({ error: 'Invalid roast ID' });
  const roast = await db.collection('roasts').findOne({ _id: roastId, deleted: false });
  if (!roast) return res.status(404).json({ error: 'Roast not found' });
  if (roast.authorId.toString() !== req.user._id.toString())
    return res.status(403).json({ error: 'Not your roast' });
  const { content } = req.body;
  if (!content || content.trim().length < 10 || content.trim().length > 500)
    return res.status(400).json({ error: 'Roast must be between 10 and 500 characters' });
  await db
    .collection('roasts')
    .updateOne({ _id: roastId }, { $set: { content: content.trim() } });
  const updated = await db.collection('roasts').findOne({ _id: roastId });
  updated.authorDisplayName = req.user.displayName;
  res.json({ roast: updated });
});

router.delete('/roasts/:id', requireAuth, async (req, res) => {
  const db = getDB();
  const roastId = parseId(req.params.id);
  if (!roastId) return res.status(400).json({ error: 'Invalid roast ID' });
  const roast = await db.collection('roasts').findOne({ _id: roastId, deleted: false });
  if (!roast) return res.status(404).json({ error: 'Roast not found' });
  if (roast.authorId.toString() !== req.user._id.toString())
    return res.status(403).json({ error: 'Not your roast' });
  await db.collection('roasts').updateOne({ _id: roastId }, { $set: { deleted: true } });
  await db
    .collection('ideas')
    .updateOne({ _id: roast.ideaId }, { $inc: { roastCount: -1 } });
  res.json({ message: 'Roast deleted' });
});

router.post('/roasts/:id/upvote', requireAuth, async (req, res) => {
  const db = getDB();
  const roastId = parseId(req.params.id);
  if (!roastId) return res.status(400).json({ error: 'Invalid roast ID' });
  const roast = await db.collection('roasts').findOne({ _id: roastId, deleted: false });
  if (!roast) return res.status(404).json({ error: 'Roast not found' });
  const userId = req.user._id;
  const alreadyVoted = roast.upvotedBy.some((id) => id.toString() === userId.toString());
  if (alreadyVoted) {
    await db
      .collection('roasts')
      .updateOne(
        { _id: roastId },
        { $pull: { upvotedBy: userId }, $inc: { upvoteCount: -1 } }
      );
  } else {
    await db
      .collection('roasts')
      .updateOne(
        { _id: roastId },
        { $addToSet: { upvotedBy: userId }, $inc: { upvoteCount: 1 } }
      );
  }
  const updated = await db.collection('roasts').findOne({ _id: roastId });
  res.json({ upvoteCount: updated.upvoteCount, upvoted: !alreadyVoted });
});

export default router;
