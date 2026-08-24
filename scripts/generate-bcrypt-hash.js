const bcrypt = require('bcryptjs');

const password = process.argv[2];
if (!password) {
  console.error('Usage: node scripts/generate-bcrypt-hash.js <password>');
  process.exit(1);
}

const saltRounds = 10;

bcrypt.hash(password, saltRounds)
  .then((hash) => {
    console.log(hash);
  })
  .catch((err) => {
    console.error('Error generating hash:', err);
    process.exit(1);
  });
