const { MongoClient } = require("mongodb");

async function clearCards() {
  const client = new MongoClient("mongodb://localhost:27017");

  try {
    await client.connect();
    const db = client.db("kanban-board");
    const result = await db.collection("cards").deleteMany({});
    console.log(`Eliminadas ${result.deletedCount} tarjetas`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

clearCards();
