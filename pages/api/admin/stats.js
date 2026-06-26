import { requireAdmin } from "../../../lib/auth";
import { queryOne, query } from "../../../lib/db";

async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const [
    ordersTotal,
    clientsTotal,
    revenueRow,
    ordersByStatus,
    popularDrawings,
    recentOrders,
    monthlyRevenue,
  ] = await Promise.all([
    queryOne("SELECT COUNT(*) as total FROM orders"),
    queryOne("SELECT COUNT(*) as total FROM users WHERE role = 'client'"),
    queryOne("SELECT COALESCE(SUM(price_snapshot), 0) as total FROM orders WHERE status IN ('confirmed','shipped','delivered')"),
    query("SELECT status, COUNT(*) as count FROM orders GROUP BY status"),
    query(
      `SELECT d.id, d.title, d.total_orders, d.average_rating
       FROM drawings d ORDER BY d.total_orders DESC LIMIT 5`
    ),
    query(
      `SELECT o.id, o.status, o.price_snapshot, o.created_at,
              u.name as client_name, d.title as drawing_title
       FROM orders o
       JOIN users u ON o.user_id = u.id
       JOIN drawings d ON o.drawing_id = d.id
       ORDER BY o.created_at DESC LIMIT 10`
    ),
    query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') as month,
              SUM(price_snapshot) as revenue,
              COUNT(*) as orders
       FROM orders
       WHERE status IN ('confirmed','shipped','delivered')
         AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
       GROUP BY month ORDER BY month ASC`
    ),
  ]);

  return res.status(200).json({
    totalOrders: ordersTotal.total,
    totalClients: clientsTotal.total,
    totalRevenue: revenueRow.total,
    ordersByStatus,
    popularDrawings,
    recentOrders,
    monthlyRevenue,
  });
}

export default requireAdmin(handler);
