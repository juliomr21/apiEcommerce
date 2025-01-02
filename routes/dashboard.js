const express = require('express');
const router = express.Router();
const Order = require('../models/Orders');

// Endpoint para obtener el resumen del dashboard
router.get('/summary', async (req, res) => {
  try {
    // Fechas relevantes
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const lastWeek = new Date(startOfDay);
    lastWeek.setDate(lastWeek.getDate() - 7);

    // Consultas simultáneas
    const [dailySummary, weeklyOrders, userProducts] = await Promise.all([
      // Resumen diario
      Order.aggregate([
        { $match: { date: { $gte: startOfDay } } },
        {
          $group: {
            _id: null,
            differentProducts: { $addToSet: "$products.product" }, // IDs únicos de productos
            totalOrders: { $sum: 1 },
            totalSpending: { $sum: "$valor" },
          },
        },
        {
          $project: {
            _id: 0,
            differentProducts: { $size: "$differentProducts" }, // Conteo de productos únicos
            totalOrders: 1,
            totalSpending: 1,
          },
        },
      ]),

      // Pedidos últimos 7 días
      Order.aggregate([
        { $match: { date: { $gte: lastWeek } } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalSpending: { $sum: "$valor" },
          },
        },
        {
          $project: {
            _id: 0,
            totalOrders: 1,
            totalSpending: 1,
          },
        },
      ]),

      // Productos de un usuario de manera general
      Order.aggregate([
        {
          $group: {
            _id: "$user",
            differentProducts: { $addToSet: "$products.product" }, // IDs únicos de productos por usuario
          },
        },
        {
          $project: {
            _id: 0,
            user: "$_id",
            differentProducts: { $size: "$differentProducts" }, // Conteo de productos únicos por usuario
          },
        },
      ]),
    ]);

    res.json({
      dailySummary: dailySummary[0] || {},
      weeklyOrders: weeklyOrders[0] || {},
      userProducts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;