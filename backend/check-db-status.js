const { Client } = require('pg');
require('dotenv').config();

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const tenants = await client.query('SELECT * FROM "Tenant"');
    console.log("TENANTS:", tenants.rows);
    const users = await client.query('SELECT * FROM "User"');
    console.log("USERS:", users.rows);
  } catch (err) {
    console.error("DB Query error:", err.message);
  } finally {
    await client.end();
  }
}

main();
