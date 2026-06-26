import mysql from "mysql2/promise";

function getPool() {
  if (!globalThis._mysqlPool) {
    globalThis._mysqlPool = mysql.createPool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 3,
      queueLimit: 0,
      charset: "utf8mb4",
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
      connectTimeout: 30000,
    });
  }
  return globalThis._mysqlPool;
}

export async function query(sql, params = []) {
  const [rows] = await getPool().query(sql, params);
  return rows;
}

export async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] || null;
}

export default getPool;