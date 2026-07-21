const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order');
const { validateCustomerPayload, validateOrderPayload } = require('../middleware/validation');

// --- CUSTOMER ROUTES ---
// CREATE: Register customer
router.post('/customers', validateCustomerPayload, orderController.createCustomer);

// READ: Get all customers with order counts
router.get('/customers', orderController.getAllCustomers);

// DELETE: Delete customer (and cascade orders)
router.delete('/customers/:id', orderController.deleteCustomer);

// --- ORDER ROUTES (1:Many Relation) ---
// CREATE: Create order linked to customer
router.post('/orders', validateOrderPayload, orderController.createOrder);

// READ: Get orders for a specific customer
router.get('/customers/:id/orders', orderController.getCustomerOrders);

// UPDATE: Modify order status/amount
router.put('/orders/:id', orderController.updateOrder);

// DELETE: Remove order
router.delete('/orders/:id', orderController.deleteOrder);

module.exports = router;
