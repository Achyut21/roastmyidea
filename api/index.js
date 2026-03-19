import 'dotenv/config';
import express from 'express';
import { connectDB } from '../server/db/connection.js';
import { configurePassport } from '../server/middleware/passport.js';
import authRoutes from '../server/routes/auth.js';
import ideaRoutes from '../server/routes/ideas.js';
import backRoutes from '../server/routes/backs.js';
import userRoutes from '../server/routes/users.js';
import roastRoutes from '../server/routes/roasts.js';
import defenseRoutes from '../server/routes/defenses.js';

const app = express();
app.use(express.json());

const passport = configurePassport();
app.use(passport.initialize());

let connected = false;

app.use(async (req, res, next) => {
  try {
    if (!connected) {
      await connectDB();
      connected = true;
    }
    next();
  } catch {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/ideas', ideaRoutes);
app.use('/api', backRoutes);
app.use('/api/users', userRoutes);
app.use('/api', roastRoutes);
app.use('/api', defenseRoutes);

if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3000;
  connectDB().then(() => {
    app.listen(port, () => console.log(`Server running on port ${port}`));
  });
}

export default app;
