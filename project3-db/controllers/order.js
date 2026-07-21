const { prisma } = require('../config/db');

/**
 * CREATE: Create Customer
 * POST /api/customers
 */
exports.createCustomer = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    const newCustomer = await prisma.customer.create({
      data: { name, email }
    });

    res.status(201).json({
      success: true,
      message: 'Customer registered successfully.',
      data: newCustomer
    });
  } catch (error) {
    next(error);
  }
};

/**
 * READ ALL: Get all customers with their total order count
 * GET /api/customers
 */
exports.getAllCustomers = async (req, res, next) => {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        _count: {
          select: { orders: true }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: customers
    });
  } catch (error) {
    next(error);
  }
};

/**
 * CREATE ORDER: Create an Order linked to a Customer (1:Many relation)
 * POST /api/orders
 */
exports.createOrder = async (req, res, next) => {
  try {
    const { amount, status, customerId } = req.body;

    // Verify customer exists first
    const customer = await prisma.customer.findUnique({
      where: { id: parseInt(customerId, 10) }
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: `FK Constraint Error: Customer with ID ${customerId} does not exist.`
      });
    }

    const newOrder = await prisma.order.create({
      data: {
        amount: parseFloat(amount),
        status: status ? status.toLowerCase() : "pending",
        customerId: parseInt(customerId, 10)
      }
    });

    res.status(201).json({
      success: true,
      message: 'Order created and linked to Customer (1:Many relation).',
      data: newOrder
    });
  } catch (error) {
    next(error);
  }
};

/**
 * READ ORDERS: Retrieve all orders for a specific Customer
 * GET /api/customers/:id/orders
 */
exports.getCustomerOrders = async (req, res, next) => {
  try {
    const customerId = parseInt(req.params.id, 10);
    if (isNaN(customerId)) {
      return res.status(400).json({ success: false, message: 'Invalid Customer ID.' });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: { orders: true }
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    res.status(200).json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email
      },
      ordersCount: customer.orders.length,
      orders: customer.orders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * UPDATE ORDER: Modify existing Order status or amount
 * PUT /api/orders/:id
 */
exports.updateOrder = async (req, res, next) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    const { amount, status } = req.body;

    if (isNaN(orderId)) {
      return res.status(400).json({ success: false, message: 'Invalid Order ID.' });
    }

    const updateData = {};
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (status !== undefined) updateData.status = status.toLowerCase();

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData
    });

    res.status(200).json({
      success: true,
      message: 'Order updated successfully.',
      data: updatedOrder
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE ORDER: Remove specific Order
 * DELETE /api/orders/:id
 */
exports.deleteOrder = async (req, res, next) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    if (isNaN(orderId)) {
      return res.status(400).json({ success: false, message: 'Invalid Order ID.' });
    }

    await prisma.order.delete({
      where: { id: orderId }
    });

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE CUSTOMER: Delete Customer and all associated Orders (1:Many Cascade Delete)
 * DELETE /api/customers/:id
 */
exports.deleteCustomer = async (req, res, next) => {
  try {
    const customerId = parseInt(req.params.id, 10);
    if (isNaN(customerId)) {
      return res.status(400).json({ success: false, message: 'Invalid Customer ID.' });
    }

    await prisma.customer.delete({
      where: { id: customerId }
    });

    res.status(200).json({
      success: true,
      message: 'Customer and all linked Orders deleted successfully (1:Many Cascade Delete).'
    });
  } catch (error) {
    next(error);
  }
};
