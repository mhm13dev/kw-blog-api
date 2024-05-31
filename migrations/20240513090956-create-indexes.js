/**
 * Create indexes for collections for production
 */
module.exports = {
  async up(db, client) {
    // Only create indexes in production
    if (process.env.NODE_ENV !== 'production') {
      return;
    }
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
  },

  async down(db, client) {
    // Only drop indexes in production
    if (process.env.NODE_ENV !== 'production') {
      return;
    }
    await db.collection('users').dropIndex('email_1');
  },
};
