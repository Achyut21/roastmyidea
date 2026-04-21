import 'dotenv/config';
import { MongoClient, ObjectId } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db('roastmyidea');

const FRESH_TITLES = [
  'App That Turns Lecture Notes Into Flashcards Automatically',
  'Platform for Renting High End Camera Gear by the Day',
  'Tool That Rewrites Your Bio Depending on Who Is Reading It',
  'App That Tells You Exactly How Much You Spent on Coffee This Year',
  'Marketplace for Swapping Unused Software Licenses',
  'Service That Builds Your Personal Website From a LinkedIn Profile',
  'App That Reminds You of Promises You Made to People',
  'Platform for Freelancers to Find Accountants Who Actually Get Them',
  'Tool That Turns Any Reddit Thread Into a Structured Summary',
  'App That Lets You Practice Difficult Conversations With AI',
  'Service That Sends Your Team a Weekly Wins Digest',
  'Platform for Trading Unused Gym Membership Days',
  'App That Calculates the True Hourly Rate of Any Job Offer',
  'Tool That Detects When Your PR Is Stale and Nudges Reviewers',
  'App That Gamifies Language Learning Through Real News Articles',
  'Platform Where Designers Post Rejected Concepts for Others to Build',
  'Service That Monitors Your Competitors Pricing and Alerts You',
  'App That Turns Your Browser Tabs Into a Reading Queue With Deadlines',
  'Tool That Finds the Cheapest Route Between Multiple Grocery Stores',
  'Platform for Booking Private Chefs for Small Dinner Parties',
  'App That Summarizes What You Missed While on Vacation in Slack',
  'Tool That Converts Any Spreadsheet Into a Public Dashboard',
  'Service That Writes Your Engineering Blog Post From a Git Diff',
  'App That Tracks Whether Your Habits Actually Improve Your Sleep',
  'Platform for Sharing and Voting on Local Zoning Proposals',
];

const PITCHES = [
  'Everyone has been in this situation. You need something but every option is either too expensive or too complicated. This solves it without the bloat.',
  'I have been doing this manually for years and every tool I tried was either overkill or useless. There has to be a middle ground and this is it.',
  'This started as a weekend project and three people immediately asked if they could pay for it. That felt like a signal worth following.',
  'The target audience does this task every single week and there is still no good tool for it. Not because the problem is hard but because nobody bothered.',
  'Right now if you want to do this you need three apps and a spreadsheet. We put it in one place with one workflow that actually makes sense.',
  'Half the people I pitched this to said it was genius and the other half said it was obvious. Either way nobody is building it.',
  'The market looks niche from the outside but once you talk to people in this space you find they are desperate and willing to pay immediately.',
  'People waste an absurd amount of time every week on this. Automating even half of it would be worth paying for.',
];

const ROAST_CONTENTS = [
  'This solves a problem nobody actually has. The people who deal with this already figured out a workaround years ago and will not switch.',
  'Cool concept but the unit economics fall apart quickly. CAC will be brutal and retention tanks once the novelty wears off.',
  'I have seen three startups attempt exactly this in the past two years. All dead. What changes here?',
  'The market research is vibes only. Talk to twenty actual customers before writing a line of code.',
  'Technically possible but operationally a nightmare. The support burden alone would kill this before you find product market fit.',
  'Your moat is nonexistent. The moment this gets traction a bigger player clones it over a long weekend.',
  'The people who need this most are the least likely to pay for it. Classic free tier trap with no monetization path.',
  'You are treating the symptom not the disease. The real problem here is much deeper and this is just a bandaid.',
  'Nobody is going to trust a random app with this kind of data. The trust barrier is enormous and you have zero brand to overcome it.',
  'This only works at a scale you will never reach bootstrapped. The network effects require critical mass that takes years and millions to build.',
];

const DEFENSE_CONTENTS = [
  'You are thinking about the wrong customer segment entirely. The motivated early adopters will pay on day one and spread it themselves.',
  'The moat is not the feature set. It is the data flywheel. Every interaction makes it smarter in ways a weekend clone cannot replicate.',
  'The failed competitors you are thinking of had a distribution problem not a product problem. That gap is now closed.',
  'Monetization is straightforward once you see who the power users are. The free tier drives distribution and converts at a rate that would surprise you.',
  'Trust is a real concern but two specific design decisions eliminate ninety percent of it. Happy to go deeper on that.',
  'Narrow focus is intentional for the first year. Dominate one segment before expanding. The playbook is well documented.',
  'The operational complexity is real and it is also exactly what makes this defensible. If it were easy someone would have done it already.',
  'The spreadsheet comparison breaks down completely on the collaborative use case. Solo users cope. Teams cannot.',
];

const CATEGORIES = ['startup', 'side-project', 'life-hack', 'tech-app', 'business', 'creative-art', 'other'];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function pickMultiple(arr, n) { return [...arr].sort(() => Math.random() - 0.5).slice(0, Math.min(n, arr.length)); }
function freshDate() {
  const hoursBack = Math.floor(Math.random() * 5 * 24);
  return new Date(Date.now() - hoursBack * 60 * 60 * 1000);
}

async function run() {
  await client.connect();
  console.log('Connected to MongoDB');

  const users = await db.collection('users').find({}).toArray();
  if (users.length === 0) {
    console.error('No users found. Run the main seed first.');
    process.exit(1);
  }
  console.log(`Found ${users.length} existing users`);

  const existingTitles = new Set(
    (await db.collection('ideas').find({}, { projection: { title: 1 } }).toArray()).map(i => i.title)
  );

  const titlesToUse = FRESH_TITLES.filter(t => !existingTitles.has(t));
  if (titlesToUse.length === 0) {
    console.log('All titles already exist. Nothing to add.');
    await client.close();
    return;
  }
  console.log(`Adding ${titlesToUse.length} fresh ideas...`);

  const ideas = [];
  for (const title of titlesToUse) {
    const author = pick(users);
    const createdAt = freshDate();
    ideas.push({
      _id: new ObjectId(),
      authorId: author._id,
      title,
      pitch: pick(PITCHES),
      problem: Math.random() > 0.4 ? 'Most existing tools are either too complex or designed for enterprise. Nobody is building for the individual.' : '',
      targetAudience: Math.random() > 0.4 ? 'Early adopters, indie hackers, and people frustrated with over-engineered solutions.' : '',
      category: pick(CATEGORIES),
      roastCount: 0,
      defenseCount: 0,
      totalRoastCoinInvested: 0,
      verdict: null,
      verdictProcessed: false,
      createdAt,
      updatedAt: createdAt,
    });
    await db.collection('users').updateOne({ _id: author._id }, { $inc: { roastCoinBalance: 10 } });
  }
  await db.collection('ideas').insertMany(ideas);
  console.log(`Inserted ${ideas.length} ideas`);

  // roasts
  const roasts = [];
  const sidePicks = {};
  for (const idea of ideas) {
    const eligible = users.filter(u => u._id.toString() !== idea.authorId.toString());
    const roasters = pickMultiple(eligible, Math.floor(Math.random() * 4) + 2);
    for (const roaster of roasters) {
      const sideKey = `${roaster._id}-${idea._id}`;
      if (sidePicks[sideKey]) continue;
      sidePicks[sideKey] = 'roast';
      const upvoteCount = Math.floor(Math.random() * 10);
      const upvotedBy = pickMultiple(users.filter(u => u._id.toString() !== roaster._id.toString()), upvoteCount).map(u => u._id);
      const createdAt = new Date(idea.createdAt.getTime() + Math.random() * (Date.now() - idea.createdAt.getTime()) * 0.8);
      roasts.push({
        _id: new ObjectId(), ideaId: idea._id, authorId: roaster._id,
        content: pick(ROAST_CONTENTS), upvotedBy, upvoteCount, defenseCount: 0, deleted: false, createdAt,
      });
      await db.collection('ideas').updateOne({ _id: idea._id }, { $inc: { roastCount: 1 } });
    }
  }
  if (roasts.length > 0) await db.collection('roasts').insertMany(roasts);
  console.log(`Inserted ${roasts.length} roasts`);

  // defenses
  const defenses = [];
  const defendedPairs = new Set();
  for (const roast of roasts) {
    const eligible = users.filter(u => u._id.toString() !== roast.authorId.toString());
    const defenders = pickMultiple(eligible, Math.floor(Math.random() * 3) + 1);
    for (const defender of defenders) {
      const pair = `${defender._id}-${roast._id}`;
      if (defendedPairs.has(pair)) continue;
      const sideKey = `${defender._id}-${roast.ideaId}`;
      if (sidePicks[sideKey] === 'roast') continue;
      defendedPairs.add(pair);
      sidePicks[sideKey] = 'defend';
      const upvoteCount = Math.floor(Math.random() * 7);
      const upvotedBy = pickMultiple(users.filter(u => u._id.toString() !== defender._id.toString()), upvoteCount).map(u => u._id);
      const createdAt = new Date(roast.createdAt.getTime() + Math.random() * (Date.now() - roast.createdAt.getTime()) * 0.7);
      defenses.push({
        _id: new ObjectId(), ideaId: roast.ideaId, roastId: roast._id, authorId: defender._id,
        content: pick(DEFENSE_CONTENTS), upvotedBy, upvoteCount, deleted: false, createdAt,
      });
      await db.collection('ideas').updateOne({ _id: roast.ideaId }, { $inc: { defenseCount: 1 } });
      await db.collection('roasts').updateOne({ _id: roast._id }, { $inc: { defenseCount: 1 } });
    }
  }
  if (defenses.length > 0) await db.collection('defenses').insertMany(defenses);
  console.log(`Inserted ${defenses.length} defenses`);

  const counts = await Promise.all([
    db.collection('users').countDocuments(),
    db.collection('ideas').countDocuments(),
    db.collection('roasts').countDocuments(),
    db.collection('defenses').countDocuments(),
    db.collection('backs').countDocuments(),
  ]);
  console.log('\nDatabase totals after additive seed:');
  console.log(`  Users:    ${counts[0]}`);
  console.log(`  Ideas:    ${counts[1]} (${ideas.length} new, all open)`);
  console.log(`  Roasts:   ${counts[2]}`);
  console.log(`  Defenses: ${counts[3]}`);
  console.log(`  Backs:    ${counts[4]}`);
  await client.close();
  console.log('\nDone. All new ideas have verdict: null and are ready for the study.');
}

run().catch(err => { console.error(err); process.exit(1); });
