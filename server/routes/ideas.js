import { Router } from 'express';
import { getDB } from '../db/connection.js';
import { requireAuth } from '../middleware/passport.js';
import { processVerdict } from '../services/verdict.js';
import { parseId } from '../utils/parseId.js';
import { ObjectId } from 'mongodb';

const router = Router();

const VALID_CATEGORIES = [
  'startup',
  'side-project',
  'life-hack',
  'tech-app',
  'business',
  'creative-art',
  'other',
];

function validateIdeaFields({
  title,
  pitch,
  problem,
  targetAudience,
  category,
}) {
  if (!title || title.length < 10 || title.length > 100)
    return 'Title must be between 10 and 100 characters';
  if (!pitch || pitch.length < 50 || pitch.length > 500)
    return 'Pitch must be between 50 and 500 characters';
  if (problem && problem.length > 300)
    return 'Problem must be 300 characters or fewer';
  if (targetAudience && targetAudience.length > 200)
    return 'Target audience must be 200 characters or fewer';
  if (!VALID_CATEGORIES.includes(category)) return 'Invalid category';
  return null;
}

async function attachAuthor(db, ideas) {
  const ids = [...new Set(ideas.map((i) => i.authorId.toString()))];
  const authors = await db
    .collection('users')
    .find({ _id: { $in: ids.map((id) => ObjectId.createFromHexString(id)) } })
    .project({ displayName: 1 })
    .toArray();
  const map = Object.fromEntries(
    authors.map((a) => [a._id.toString(), a.displayName])
  );
  return ideas.map((idea) => ({
    ...idea,
    authorDisplayName: map[idea.authorId.toString()] || 'Unknown',
  }));
}

// GET /api/ideas
router.get('/', async (req, res) => {
  const db = getDB();
  const { sort = 'newest', category, status } = req.query;
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const filter = {};
  if (category) filter.category = category;
  if (status === 'open') {
    filter.verdict = null;
    filter.createdAt = { $gt: cutoff };
  } else if (status) {
    filter.verdict = status;
  }

  const sortMap = {
    newest: { createdAt: -1 },
    mostInvested: { totalRoastCoinInvested: -1 },
    mostRoasted: { roastCount: -1 },
    mostDefended: { defenseCount: -1 },
    endingSoon: { createdAt: 1 },
  };

  if (sort === 'endingSoon') {
    filter.verdict = null;
    filter.createdAt = { $gt: cutoff };
  }

  const ideas = await db
    .collection('ideas')
    .find(filter)
    .sort(sortMap[sort] || { createdAt: -1 })
    .toArray();

  res.json({ ideas: await attachAuthor(db, ideas) });
});

// GET /api/ideas/:id
router.get('/:id', async (req, res) => {
  const db = getDB();
  const ideaId = parseId(req.params.id);
  if (!ideaId) return res.status(400).json({ error: 'Invalid idea ID' });

  const idea = await db.collection('ideas').findOne({ _id: ideaId });
  if (!idea) return res.status(404).json({ error: 'Idea not found' });

  const deadline = new Date(idea.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);
  if (!idea.verdict && !idea.verdictProcessed && Date.now() > deadline) {
    await processVerdict(idea._id);
    Object.assign(idea, await db.collection('ideas').findOne({ _id: ideaId }));
  }

  const author = await db
    .collection('users')
    .findOne({ _id: idea.authorId }, { projection: { displayName: 1 } });
  idea.authorDisplayName = author?.displayName || 'Unknown';
  res.json({ idea });
});

// POST /api/ideas
router.post('/', requireAuth, async (req, res) => {
  const db = getDB();
  const { title, pitch, problem, targetAudience, category } = req.body;
  const err = validateIdeaFields({
    title,
    pitch,
    problem,
    targetAudience,
    category,
  });
  if (err) return res.status(400).json({ error: err });

  const authorId = req.user._id;
  const openCount = await db
    .collection('ideas')
    .countDocuments({ authorId, verdict: null });
  if (openCount >= 5)
    return res.status(400).json({ error: 'You already have 5 open ideas' });

  const now = new Date();
  const result = await db.collection('ideas').insertOne({
    authorId,
    title,
    pitch,
    problem: problem || '',
    targetAudience: targetAudience || '',
    category,
    roastCount: 0,
    defenseCount: 0,
    totalRoastCoinInvested: 0,
    verdict: null,
    verdictProcessed: false,
    createdAt: now,
    updatedAt: now,
  });

  await db
    .collection('users')
    .updateOne({ _id: authorId }, { $inc: { roastCoinBalance: 10 } });
  const idea = await db.collection('ideas').findOne({ _id: result.insertedId });
  res.status(201).json({ idea });
});

// PUT /api/ideas/:id
router.put('/:id', requireAuth, async (req, res) => {
  const db = getDB();
  const ideaId = parseId(req.params.id);
  if (!ideaId) return res.status(400).json({ error: 'Invalid idea ID' });

  const idea = await db.collection('ideas').findOne({ _id: ideaId });
  if (!idea) return res.status(404).json({ error: 'Idea not found' });
  if (idea.authorId.toString() !== req.user._id.toString())
    return res.status(403).json({ error: 'Not your idea' });

  const { title, pitch, problem, targetAudience, category } = req.body;
  const err = validateIdeaFields({
    title,
    pitch,
    problem,
    targetAudience,
    category,
  });
  if (err) return res.status(400).json({ error: err });

  await db.collection('ideas').updateOne(
    { _id: ideaId },
    {
      $set: {
        title,
        pitch,
        problem: problem || '',
        targetAudience: targetAudience || '',
        category,
        updatedAt: new Date(),
      },
    }
  );
  res.json({ idea: await db.collection('ideas').findOne({ _id: ideaId }) });
});

// DELETE /api/ideas/:id
router.delete('/:id', requireAuth, async (req, res) => {
  const db = getDB();
  const ideaId = parseId(req.params.id);
  if (!ideaId) return res.status(400).json({ error: 'Invalid idea ID' });

  const idea = await db.collection('ideas').findOne({ _id: ideaId });
  if (!idea) return res.status(404).json({ error: 'Idea not found' });
  if (idea.authorId.toString() !== req.user._id.toString())
    return res.status(403).json({ error: 'Not your idea' });
  if (idea.totalRoastCoinInvested > 0)
    return res
      .status(400)
      .json({ error: 'Cannot delete an idea with investments' });

  await db.collection('ideas').deleteOne({ _id: ideaId });
  await db.collection('roasts').deleteMany({ ideaId });
  await db.collection('defenses').deleteMany({ ideaId });
  res.json({ message: 'Idea deleted' });
});

export default router;
