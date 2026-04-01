const express = require('express');
const router = express.Router();
const {
  placeOrder, getMyOrders, getOrderById,
  getAllOrders, updateOrderStatus, cancelOrder
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// IMPORTANT: specific routes must come BEFORE /:id routes
router.post('/', protect, placeOrder);
router.get('/my', protect, getMyOrders);
router.get('/all', protect, adminOnly, getAllOrders);      // changed from '/' to '/all'
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);
router.delete('/:id', protect, cancelOrder);

module.exports = router;