const bcrypt = require('bcrypt');
const pool = require('./db');

async function seedUsers() {
  try {
    //  Check if at least one user exists
    const check = await pool.query('SELECT COUNT(*) FROM users');
    if (parseInt(check.rows[0].count) > 0) {
      console.log('⚠️ Users already exist. Skipping seeding.');
      return;
    }

    //  Users to seed
    const users = [
      { name: 'Alice Johnson', username: 'alice_admin', password: 'password123', role: 'admin' },
      { name: 'Michael Smith', username: 'michael_admin', password: 'securepass', role: 'admin' },
      { name: 'John Doe', username: 'john_doe', password: 'student123', role: 'student' },
      { name: 'Emily Davis', username: 'emily_davis', password: 'student123', role: 'student' }
    ];

    //  Insert each user
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);

      await pool.query(
        `INSERT INTO users (name, username, password, role)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (username) DO NOTHING`,
        [user.name, user.username, hashedPassword, user.role]
      );

      console.log(` Inserted user: ${user.username} (${user.role})`);
    }

    console.log(' Seeding users completed.');
  } catch (error) {
    console.error('❌ Error seeding users:', error);
  }
}

module.exports = seedUsers;
