const mysql = require("mysql2/promise");

async function test() {
  try {
    const conn = await mysql.createConnection({
      host: "mysql-1d4be475-mrdb.i.aivencloud.com",
      port: 12555,
      user: "avnadmin",
      password: "AVNS_GR0oJ3YgfGs_1NLOOT-",
      database: "defaultdb",
      ssl: { rejectUnauthorized: false },
    });
    console.log("✅ Connexion réussie !");
    const [rows] = await conn.execute("SELECT 1");
    console.log("✅ Query OK:", rows);
    await conn.end();
  } catch (err) {
    console.error("❌ Erreur:", err.message);
    console.error("Code:", err.code);
  }
}

test();