import 'dotenv/config';
import express from 'express';
import { connectDB } from '../server/db/connection.js';
import authRoutes from '../server/routes/auth.js';
import ideaRoutes from '../server/routes/ideas.js';
import backRoutes from '../server/routes/backs.js';
import userRoutes from '../server/routes/users.js';
import roastRoutes from '../server/routes/roasts.js';
import defenseRoutes from '../server/routes/defenses.js';

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/ideas', ideaRoutes);
app.use('/api', backRoutes);
app.use('/api/users', userRoutes);
app.use('/api', roastRoutes);
app.use('/api', defenseRoutes);

connectDB().then(() => {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Server running on port ${port}`));
});

export default app;
