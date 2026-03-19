import { Router } from 'express';
import { getDB } from '../db/connection.js';
import { parseId } from '../utils/parseId.js';

const router = Router();

function roasterTitle(upvotes) {
  if (upvotes >= 500) return 'Arsonist';
  if (upvotes >= 100) return 'Inferno';
  if (upvotes >= 25) return 'Flame';
  return 'Spark';
}

function defenderTitle(upvotes) {
  if (upvotes >= 500) return 'Phoenix';
  if (upvotes >= 100) return 'Fireproof';
  if (upvotes >= 25) return 'Firewall';
  return 'Kindling';
}

function pitcherTitle(fireproofCount) {
  if (fireproofCount >= 25) return 'Unicorn';
  if (fireproofCount >= 10) return 'Mogul';
  if (fireproofCount >= 3) return 'Visionary';
  return 'Dreamer';
}

router.get('/:id/profile', async (req, res) => {
  const db = getDB();
  const userId = parseId(req.params.id);
  if (!userId) return res.status(400).json({ error: 'Invalid user ID' });

  const user = await db
    .collection('users')
    .findOne({ _id: userId }, { projection: { password: 0 } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const [
    ideasPitched,
    ideasFireproof,
    ideasTorched,
    roastsWritten,
    defensesWritten,
    rcInvestedAgg,
    roastUpvotesAgg,
    defenseUpvotesAgg,
  ] = await Promise.all([
    db.collection('ideas').countDocuments({ authorId: userId }),
    db.collection('ideas').countDocuments({ authorId: userId, verdict: 'fireproof' }),
    db.collection('ideas').countDocuments({ authorId: userId, verdict: 'torched' }),
    db.collection('roasts').countDocuments({ authorId: userId, deleted: { $ne: true } }),
    db
      .collection('defenses')
      .countDocuments({ authorId: userId, deleted: { $ne: true } }),
    db
      .collection('backs')
      .aggregate([
        { $match: { backerId: userId } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ])
      .toArray(),
    db
      .collection('roasts')
      .aggregate([
        { $match: { authorId: userId, deleted: { $ne: true } } },
        { $group: { _id: null, total: { $sum: '$upvoteCount' } } },
      ])
      .toArray(),
    db
      .collection('defenses')
      .aggregate([
        { $match: { authorId: userId, deleted: { $ne: true } } },
        { $group: { _id: null, total: { $sum: '$upvoteCount' } } },
      ])
      .toArray(),
  ]);

  const totalRcInvested = rcInvestedAgg[0]?.total || 0;
  const totalRoastUpvotes = roastUpvotesAgg[0]?.total || 0;
  const totalDefenseUpvotes = defenseUpvotesAgg[0]?.total || 0;

  res.json({
    profile: {
      displayName: user.displayName,
      roastCoinBalance: user.roastCoinBalance,
      createdAt: user.createdAt,
      stats: {
        ideasPitched,
        ideasFireproof,
        ideasTorched,
        roastsWritten,
        defensesWritten,
        totalRcInvested,
      },
      titles: {
        roaster: roasterTitle(totalRoastUpvotes),
        defender: defenderTitle(totalDefenseUpvotes),
        pitcher: pitcherTitle(ideasFireproof),
      },
    },
  });
});

export default router;
