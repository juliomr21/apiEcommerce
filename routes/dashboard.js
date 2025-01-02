const express = require('express');
const router = express.Router();
const Order = require('../models/Orders');
const Product = require('../models/Products');

// Endpoint para obtener el resumen del dashboard
router.get('/summary', async (req, res) => {
  try {
    // Fechas relevantes
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const lastWeek = new Date(startOfDay);
    lastWeek.setDate(lastWeek.getDate() - 7);

    // ID del usuario (puedes obtenerlo del token de autenticación o parámetro)
    const userId = req.user.id; // Ajusta según tu autenticación

    // Consultas simultáneas
    const [userProductsCount, dailySummary, weeklyOrders] = await Promise.all([
      // Conteo de productos registrados por el usuario
      Product.countDocuments({ user: userId }),

      // Resumen diario
      Order.aggregate([
        { $match: { date: { $gte: startOfDay } } },
        {
          $group: {
            _id: null,
            differentProducts: { $addToSet: "$products.product" }, // IDs únicos de productos
            totalOrders: { $sum: 1 },
            totalSpending: { $sum: "$total" },
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
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            orders: { $sum: 1 },
            spending: { $sum: "$total" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Formato del resumen diario
    const dailyData = dailySummary[0] || {
      differentProducts: 0,
      totalOrders: 0,
      totalSpending: 0,
    };

    // Respuesta JSON
    res.status(200).json({
      productsRegistered: userProductsCount,
      today: {
        differentProducts: dailyData.differentProducts,
        totalOrders: dailyData.totalOrders,
        totalSpending: dailyData.totalSpending,
      },
      last7Days: weeklyOrders,
    });
  } catch (error) {
    console.error("Error en el endpoint /summary:", error);
    res.status(500).json({ message: "Error al obtener el resumen", error });
  }
});

module.exports = router;
