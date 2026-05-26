const { Client } = require('pg');
require('dotenv').config();

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const res = await client.query('SELECT id, username, role, "tenantId" FROM "User"');
    console.log("USERS:", res.rows);
  } catch (err) {
    console.error("DB Query error:", err.message);
  } finally {
    await client.end();
  }
}

main();
