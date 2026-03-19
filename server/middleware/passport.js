import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { getDB } from '../db/connection.js';
import { parseId } from '../utils/parseId.js';

export function configurePassport() {
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET,
      },
      async (payload, done) => {
        try {
          const db = getDB();
          const user = await db
            .collection('users')
            .findOne({ _id: parseId(payload.userId) });
          if (!user) return done(null, false);
          return done(null, user);
        } catch (err) {
          return done(err, false);
        }
      }
    )
  );

  passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
      try {
        const db = getDB();
        const user = await db.collection('users').findOne({ email });
        if (!user) return done(null, false, { message: 'Invalid credentials' });
        const match = await bcrypt.compare(password, user.password);
        if (!match) return done(null, false, { message: 'Invalid credentials' });
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  return passport;
}

export const requireAuth = passport.authenticate('jwt', { session: false });
