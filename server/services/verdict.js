import { ObjectId } from 'mongodb';
import { getDB } from '../db/connection.js';

export async function processVerdict(ideaId) {
  const db = getDB();
  const id = ideaId instanceof ObjectId ? ideaId : ObjectId.createFromHexString(ideaId);

  const roastCount = await db
    .collection('roasts')
    .countDocuments({ ideaId: id, deleted: false });
  const defenseCount = await db
    .collection('defenses')
    .countDocuments({ ideaId: id, deleted: false });
  const totalInteractions = roastCount + defenseCount;

  let verdict;

  if (totalInteractions < 5) {
    verdict = 'lukewarm';
  } else {
    const roastAgg = await db
      .collection('roasts')
      .aggregate([
        { $match: { ideaId: id, deleted: false } },
        { $group: { _id: null, total: { $sum: '$upvoteCount' } } },
      ])
      .toArray();
    const defenseAgg = await db
      .collection('defenses')
      .aggregate([
        { $match: { ideaId: id, deleted: false } },
        { $group: { _id: null, total: { $sum: '$upvoteCount' } } },
      ])
      .toArray();

    const roastUpvotes = roastAgg[0]?.total || 0;
    const defenseUpvotes = defenseAgg[0]?.total || 0;

    if (defenseUpvotes > roastUpvotes) verdict = 'fireproof';
    else if (roastUpvotes > defenseUpvotes) verdict = 'torched';
    else verdict = 'lukewarm';
  }

  await db
    .collection('ideas')
    .updateOne({ _id: id }, { $set: { verdict, verdictProcessed: true } });

  const idea = await db.collection('ideas').findOne({ _id: id });

  if (verdict === 'fireproof') {
    await db
      .collection('users')
      .updateOne({ _id: idea.authorId }, { $inc: { roastCoinBalance: 50 } });
    const backs = await db.collection('backs').find({ ideaId: id }).toArray();
    for (const back of backs) {
      const payout = Math.floor(back.amount * 1.5);
      await db
        .collection('users')
        .updateOne({ _id: back.backerId }, { $inc: { roastCoinBalance: payout } });
    }
  } else if (verdict === 'lukewarm') {
    const backs = await db.collection('backs').find({ ideaId: id }).toArray();
    for (const back of backs) {
      await db
        .collection('users')
        .updateOne({ _id: back.backerId }, { $inc: { roastCoinBalance: back.amount } });
    }
  }
}
