import 'dotenv/config';
import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db('roastmyidea');

const NAMES = [
  'Nate Chen', 'Priya Sharma', 'Marco Rivera', 'Leila Hassan',
  'Jake Morrison', 'Aisha Okafor', 'Tommy Nguyen', 'Rosa Martinez',
  'Derek Williams', 'Fiona Clarke', 'Raj Patel', 'Chloe Kim',
  'Omar Diaz', 'Megan OBrien', 'Yusuf Ahmed', 'Hannah Lee',
  'Carlos Reyes', 'Zara Khan', 'Ben Fischer', 'Tanya Ivanova',
  'Luis Herrera', 'Simone Dubois', 'Eric Tanaka', 'Grace Muthu',
  'Noah Park', 'Aaliya Bashir', 'Dylan Watts', 'Kira Johansson',
  'Mateo Silva', 'Rina Takahashi',
];

const CATEGORIES = [
  'startup', 'side-project', 'life-hack',
  'tech-app', 'business', 'creative-art', 'other',
];

const IDEA_TITLES = [
  'Uber for Dog Walkers', 'Marketplace for Homemade Hot Sauce',
  'Subscription Box for Office Snacks', 'Reverse Job Board Where Companies Apply to You',
  'Platform That Matches Freelancers by Timezone', 'Tinder for Finding a Co-Founder',
  'Airbnb for Parking Spots', 'App That Tells You Which Friends Owe You Money',
  'Browser Extension That Blocks LinkedIn Hustle Posts',
  'Tool That Converts Recipes Into Grocery Lists',
  'CLI Tool That Roasts Your Code Quality', 'Bot That Texts You Compliments When Build Fails',
  'Site That Tells You If a Movie Is Worth Watching in 20 Minutes',
  'Tool That Tracks Hours in Meetings vs Actually Working',
  'App That Tells You the Fastest Grocery Checkout Line',
  'Service That Picks Your Outfit Based on Weather and Calendar',
  'App That Reminds You to Drink Water Aggressively',
  'Platform for Rating Public Bathrooms',
  'App That Calculates If Cooking at Home Is Cheaper',
  'Tool That Tells You When to Leave to Avoid Traffic',
  'AI That Writes Your Excuses for Skipping Plans',
  'App That Tells You If Your Outfit Is Mid',
  'Social Network Only for People Who Hate Social Networks',
  'AI That Generates Passive Aggressive Email Replies',
  'Platform Where You Can Hire Someone to Cancel Your Subscriptions',
  'AI That Rewrites Your Resume for Every Job Automatically',
  'App That Detects When a Zoom Call Could Have Been an Email',
  'Consulting Service for People Who Want to Start a Food Truck',
  'Platform for Small Businesses to Split Bulk Supply Orders',
  'Tool That Generates Invoices From Napkin Math Screenshots',
  'Platform for Musicians to Find Bandmates by Vibe Not Genre',
  'App That Generates Color Palettes From Nature Photos',
  'Tool That Turns Spotify History Into Wall Art',
  'Platform for Writers to Get Feedback Without the Ego',
  'App That Turns Voice Memos Into Song Lyrics',
  'Fitness App That Shames You With Push Notifications',
  'Dating App Where You Match Based on Food Only',
  'App That Ranks Your Friends by Response Time',
  'Platform Where People Compete to Write Best One Star Review',
  'Service That Mails You a Letter From Your Future Self',
  'App That Predicts How Many Times You Will Hit Snooze',
  'Platform for Reviewing and Rating Vending Machines',
  'Tool That Tells You Which House Plant Is Most Disappointed in You',
  'App That Pairs You With a Stranger to Split a Pizza',
  'Service That Sends Your Ex a Bill for Time Wasted',
  'App That Rates How Good Your Excuse Was for Missing Plans',
  'Website That Generates a Random Life Decision for You',
  'Spotify But for Niche Hobby Podcasts',
  'Platform for People Who Collect Weird Things',
  'App That Simulates What Your Face Looks Like If You Never Sleep',
  'Tool That Finds the Best Seat on Any Flight',
  'App That Plans Errands in the Most Efficient Route',
  'Service That Texts You When Your Favorite Restaurant Has No Wait',
  'App That Tracks Which Leftovers Are About to Go Bad',
  'Platform Where Business Owners Anonymously Share Revenue Numbers',
  'Tool That Predicts When Your Business Will Run Out of Cash',
  'SaaS Tool That Automates Tax Categorization for Freelancers',
  'Marketplace for Used Restaurant Equipment',
  'App That Helps Small Shops Manage Inventory Simply',
  'Platform for Local Businesses to Pool Advertising Budgets',
  'Collaborative Storytelling Platform One Sentence at a Time',
  'App That Generates Lo-Fi Music Based on Your Mood',
  'Platform Where Artists Trade Pieces Instead of Selling Them',
  'Tool That Creates Movie Poster Designs From Your Selfies',
  'Service That Matches You With a Photographer for One Photo',
  'Plugin That Adds a Sarcasm Detector to Email',
  'Script That Auto Replies to Recruiters With Salary Requirements',
  'Site That Ranks Every Coffee Shop by Outlet Availability',
  'Platform That Lets You Bet Fake Money on Tech Earnings',
  'Tool That Tells You How Much Life You Spent on Hold',
  'App That Adopts You a Random Pixel',
  'Website That Lets You Adopt a Random Pixel on the Internet',
  'Subscription Box for Indie Board Game Expansions',
  'App That Scores Your Parallel Parking Attempts',
  'Tool That Transcribes Whiteboard Photos Into Notion',
  'Platform That Matches Remote Workers With Local Coworking Buddies',
  'App That Tells You the Carbon Footprint of Your Meal',
  'Service That Writes Your LinkedIn Post From a Voice Memo',
];

const PITCHES = [
  'Everyone has been in this situation. You need something but every option is either too expensive or too complicated. This app makes it dead simple. No signup walls and no premium tiers. Just a clean tool that does one thing well.',
  'Think about the last time you tried to solve this problem. It probably took way longer than it should have. We are building something that cuts that process down to minutes. The target audience is large and the model is simple.',
  'This started as a joke between friends but the more we talked about it the more it made sense. There are millions of people who deal with this every day and nobody is building for them.',
  'I have been doing this for years and every tool I have used is terrible. Either bloated with features nobody asked for or so basic it barely works. There has to be a middle ground and that is what this is.',
  'Right now if you want to do this you have to use three different apps and a spreadsheet. We put it all in one place. One dashboard and one workflow.',
  'People spend an absurd amount of time every week dealing with this problem. We automate most of it so you can focus on what actually matters.',
  'Nobody is going to build this because the market looks small. But if you actually talk to people in this space you realize they are desperate for a solution and willing to pay for it.',
  'The target user is someone who does this regularly. That is a surprisingly large group once you look at the numbers. The entry point is free and the premium tier adds the features power users want.',
  'Every other solution in this space is built for enterprises. We are building for the individual. Simpler interface and lower price point.',
  'Half the people I pitched this to said it was genius and the other half said it was stupid. That is usually a good sign.',
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickMultiple(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function daysAgo(n) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

async function seedUsers() {
  const hashed = await bcrypt.hash('password123', 10);
  const users = NAMES.map((name) => {
    const [first, last] = name.split(' ');
    return {
      _id: new ObjectId(),
      email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
      password: hashed,
      displayName: first,
      roastCoinBalance: 1000,
      createdAt: daysAgo(Math.floor(Math.random() * 60) + 10),
    };
  });
  await db.collection('users').insertMany(users);
  console.log(`Seeded ${users.length} users`);
  return users;
}

async function seedIdeas(users) {
  const ideas = [];
  const usedTitles = new Set();
  const userOpenCount = {};

  const shuffledTitles = [...IDEA_TITLES].sort(() => Math.random() - 0.5);

  for (let i = 0; i < 80; i++) {
    const author = pick(users);
    const authorId = author._id;
    const openForAuthor = userOpenCount[authorId.toString()] || 0;
    if (openForAuthor >= 5 && i < 60) continue;

    const title = shuffledTitles[i] || `Idea ${i}`;
    if (usedTitles.has(title)) continue;
    usedTitles.add(title);

    const isOld = i < 60;
    const createdAt = isOld
      ? daysAgo(Math.floor(Math.random() * 30) + 8)
      : daysAgo(Math.floor(Math.random() * 6));

    const idea = {
      _id: new ObjectId(),
      authorId,
      title,
      pitch: pick(PITCHES),
      problem: Math.random() > 0.4 ? 'Most existing tools are either too complex or designed for enterprise. Nobody is building for the individual who just needs something that works.' : '',
      targetAudience: Math.random() > 0.4 ? 'Early adopters, indie hackers, and people frustrated with over-engineered solutions.' : '',
      category: pick(CATEGORIES),
      roastCount: 0,
      defenseCount: 0,
      totalRoastCoinInvested: 0,
      verdict: null,
      verdictProcessed: false,
      createdAt,
      updatedAt: createdAt,
    };

    if (!isOld) {
      userOpenCount[authorId.toString()] = openForAuthor + 1;
    }

    await db.collection('users').updateOne(
      { _id: authorId },
      { $inc: { roastCoinBalance: 10 } }
    );

    ideas.push(idea);
  }

  await db.collection('ideas').insertMany(ideas);
  console.log(`Seeded ${ideas.length} ideas`);
  return ideas;
}

async function seedBacks(users, ideas) {
  const backs = [];

  for (const idea of ideas) {
    const eligible = users.filter((u) => u._id.toString() !== idea.authorId.toString());
    const backers = pickMultiple(eligible, Math.floor(Math.random() * 4) + 1);

    for (const backer of backers) {
      const amount = (Math.floor(Math.random() * 9) + 1) * 10;
      const balance = await db.collection('users').findOne({ _id: backer._id });
      if (balance.roastCoinBalance < amount) continue;

      const createdAt = new Date(
        idea.createdAt.getTime() +
        Math.random() * (Math.min(Date.now(), idea.createdAt.getTime() + 6.9 * 24 * 60 * 60 * 1000) - idea.createdAt.getTime())
      );

      backs.push({
        _id: new ObjectId(),
        ideaId: idea._id,
        backerId: backer._id,
        amount,
        createdAt,
      });

      await db.collection('users').updateOne(
        { _id: backer._id },
        { $inc: { roastCoinBalance: -amount } }
      );
      await db.collection('ideas').updateOne(
        { _id: idea._id },
        { $inc: { totalRoastCoinInvested: amount } }
      );
    }
  }

  if (backs.length > 0) await db.collection('backs').insertMany(backs);
  console.log(`Seeded ${backs.length} backs`);
  return backs;
}

async function processVerdicts(ideas) {
  const oldIdeas = ideas.filter((i) => {
    const deadline = new Date(i.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);
    return Date.now() > deadline;
  });

  for (const idea of oldIdeas) {
    const roastCount = await db.collection('roasts').countDocuments({ ideaId: idea._id, deleted: false });
    const defenseCount = await db.collection('defenses').countDocuments({ ideaId: idea._id, deleted: false });
    const totalInteractions = roastCount + defenseCount;

    let verdict;
    if (totalInteractions < 5) {
      verdict = 'lukewarm';
    } else {
      const roastAgg = await db.collection('roasts').aggregate([
        { $match: { ideaId: idea._id, deleted: false } },
        { $group: { _id: null, total: { $sum: '$upvoteCount' } } },
      ]).toArray();
      const defenseAgg = await db.collection('defenses').aggregate([
        { $match: { ideaId: idea._id, deleted: false } },
        { $group: { _id: null, total: { $sum: '$upvoteCount' } } },
      ]).toArray();

      const roastUpvotes = roastAgg[0]?.total || 0;
      const defenseUpvotes = defenseAgg[0]?.total || 0;

      if (defenseUpvotes > roastUpvotes) verdict = 'fireproof';
      else if (roastUpvotes > defenseUpvotes) verdict = 'torched';
      else verdict = 'lukewarm';
    }

    await db.collection('ideas').updateOne(
      { _id: idea._id },
      { $set: { verdict, verdictProcessed: true } }
    );

    const backs = await db.collection('backs').find({ ideaId: idea._id }).toArray();

    if (verdict === 'fireproof') {
      await db.collection('users').updateOne(
        { _id: idea.authorId },
        { $inc: { roastCoinBalance: 50 } }
      );
      for (const back of backs) {
        await db.collection('users').updateOne(
          { _id: back.backerId },
          { $inc: { roastCoinBalance: Math.floor(back.amount * 1.5) } }
        );
      }
    } else if (verdict === 'lukewarm') {
      for (const back of backs) {
        await db.collection('users').updateOne(
          { _id: back.backerId },
          { $inc: { roastCoinBalance: back.amount } }
        );
      }
    }
  }

  console.log(`Processed verdicts for ${oldIdeas.length} ideas`);
}

async function seed() {
  await client.connect();
  console.log('Connected to MongoDB');

  await db.collection('users').deleteMany({});
  await db.collection('ideas').deleteMany({});
  await db.collection('roasts').deleteMany({});
  await db.collection('defenses').deleteMany({});
  await db.collection('backs').deleteMany({});
  console.log('Cleared all collections');

  const users = await seedUsers();
  const ideas = await seedIdeas(users);
  await seedBacks(users, ideas);

  // Need to add seedRoasts(users, ideas) and seedDefenses(users, ideas) here before processVerdicts runs
  // Roasts schema would be like { _id, ideaId, authorId, content, upvotedBy: [], upvoteCount: 0, deleted: false, createdAt }
  // and Defenses schema { _id, ideaId, roastId, authorId, content, upvotedBy: [], upvoteCount: 0, deleted: false, createdAt }
  // for Rules one roast per user per idea, no roasting own idea, side-pick enforced (cant roast AND defend same idea)
  //  and one defense per user per roast.
  // After inserting, update idea.roastCount and idea.defenseCount.
  
  await processVerdicts(ideas);

  const counts = await Promise.all([
    db.collection('users').countDocuments(),
    db.collection('ideas').countDocuments(),
    db.collection('roasts').countDocuments(),
    db.collection('defenses').countDocuments(),
    db.collection('backs').countDocuments(),
  ]);

  console.log(`\nFinal counts:`);
  console.log(`  Users:    ${counts[0]}`);
  console.log(`  Ideas:    ${counts[1]}`);
  console.log(`  Roasts:   ${counts[2]}`);
  console.log(`  Defenses: ${counts[3]}`);
  console.log(`  Backs:    ${counts[4]}`);
  console.log(`  Total:    ${counts.reduce((a, b) => a + b, 0)}`);

  await client.close();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
