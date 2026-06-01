const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const id = "e8507ad5-68f9-4595-a34c-1fa39d76a673"; // ID from user error
    const tenantId = "00000000-0000-0000-0000-000000000000"; // Default tenant
    const res = await prisma.$runCommandRaw({
      update: 'GeneratedDocument',
      updates: [
        {
          q: { _id: { $oid: id }, tenantId },
          u: {
            $set: {
              status: 'signed',
              signedAt: { $date: new Date().toISOString() }
            }
          }
        }
      ]
    });
    console.log("Success with $oid:", res);
  } catch (e) {
    console.error("Error with $oid:", e.message);
  }

  try {
    const id = "e8507ad5-68f9-4595-a34c-1fa39d76a673";
    const tenantId = "00000000-0000-0000-0000-000000000000";
    const res = await prisma.$runCommandRaw({
      update: 'GeneratedDocument',
      updates: [
        {
          q: { _id: id, tenantId },
          u: {
            $set: {
              status: 'signed',
              signedAt: { $date: new Date().toISOString() }
            }
          }
        }
      ]
    });
    console.log("Success with string ID:", res);
  } catch (e) {
    console.error("Error with string ID:", e.message);
  }
}
run().then(() => prisma.$disconnect());
