import { config } from '@keystone-next/keystone/schema';
import { statelessSessions, storedSessions } from '@keystone-next/keystone/session';
import { redisSessionStore } from '@keystone-next/session-store-redis';
import { createAuth } from '@keystone-next/auth';
import redis from 'redis'

import { lists } from './schema';

let sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'The SESSION_SECRET environment variable must be set in production'
    );
  } else {
    sessionSecret = '-- DEV COOKIE SECRET; CHANGE ME --';
  }
}

let sessionMaxAge = 60 * 60 * 24 * 30; // 30 days

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
  sessionData: 'name',
  initFirstItem: {
    fields: ['name', 'email', 'password'],
  },
});



/**
 * WITH THIS SESSION CONFIG WORKS FINE
 */
// const session = statelessSessions({
//   maxAge: sessionMaxAge,
//   secret: sessionSecret,
// });


/**
 * WITH THIS SESSION CONFIG STUCKS
 */
const session = storedSessions({
  store: redisSessionStore({ client: redis.createClient() }),
  maxAge: sessionMaxAge,
  secret: sessionSecret,
});




export default withAuth(
  config({
    db: {
      provider: 'sqlite',
      url: process.env.DATABASE_URL || 'file:./keystone.db',
    },
    ui: {
      isAccessAllowed: (context) => !!context.session?.data,
    },
    lists,
    session,
  })
);
