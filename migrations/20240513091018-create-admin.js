const argon2 = require('argon2');

/**
 * Create a `User` with role of `admin`
 */
module.exports = {
  async up(db) {
    const now = new Date();
    const hashedPassword = await argon2.hash('12345678');
    const user = {
      email: 'admin@kwanso.com',
      name: 'admin',
      password: hashedPassword,
      role: 'admin',
      createdAt: now,
      updatedAt: now,
    };
    await db.collection('users').insertOne(user);
  },

  async down(db) {
    await db.collection('users').deleteOne({ role: 'admin' });
  },
};
