import {Order} from "../../models/Order";

const now : Date = new Date();


export async function getOrderStatus(orderId: string, userId: string) {
  try {
    const order = await Order.findOne({orderId, userId});
    console.log(
      `getOrderStatus: Looking up ${order} ${orderId} for user ${userId}`,
    );
    if (!order) {
      return {success: false, error: `Order ${orderId} not found.`};
    }
    return {
      success: true,
      data: {
        orderId: order.orderId,
        customerName: order.customerName,
        items: order.items,
        totalAmount: order.totalAmount,
        status: order.status,
        orderTimestamp: order.orderTimestamp,
        deliveryTimestamp: order.deliveryTimestamp,
        deliveryAddress: order.deliveryAddress,
        refundStatus: order.refundStatus,
        driverName: order.driverName,
      },
    };
  } catch (error) {
    console.log("error from getOrderStatus ", (error as Error).message);
  }
}

export async function processRefund(
  orderId: string,
  userId: string,
  reason?: string,
) {
  const order = await Order.findOne({orderId, userId});

  if (!order) {
    return {success: false, error: `Order ${orderId} not found.`};
  }

  if (order.status === "refunded") {
    return {
      success: false,
      error: `Order ${orderId} has already been refunded.`,
    };
  }

  if (order.refundStatus === "denied") {
    return {
      success: false,
      error: `Refund for order ${orderId} was previously denied. The order was delivered less than 45 minutes ago.`,
    };
  }

  if (order.status !== "delivered") {
    return {
      success: false,
      error: `Order ${orderId} has not been delivered yet (status: ${order.status}). Refunds can only be processed for delivered orders.`,
    };
  }

  if (!order.deliveryTimestamp) {
    return {
      success: false,
      error: `Order ${orderId} does not have a delivery timestamp.`,
    };
  }

  // ─── CORE REFUND RULE: 45 minute check ─────────────────────────
  const now = new Date();
  const deliveryTime = new Date(order.deliveryTimestamp);
  const minutesSinceDelivery =
    (now.getTime() - deliveryTime.getTime()) / (1000 * 60);

  if (minutesSinceDelivery > 45) {
    // APPROVE: More than 45 minutes since delivery
    order.status = "refunded";
    order.refundStatus = "approved";
    order.refundReason = reason || "Customer requested refund";
    order.refundedAt = now;
    await order.save();

    return {
      success: true,
      approved: true,
      data: {
        orderId: order.orderId,
        refundAmount: order.totalAmount,
        message: `Refund of $${order.totalAmount.toFixed(2)} approved for order ${orderId}. ${minutesSinceDelivery.toFixed(0)} minutes have passed since delivery.`,
        minutesSinceDelivery: Math.round(minutesSinceDelivery),
      },
    };
  } else {
    // DENY: Less than 45 minutes since delivery
    order.refundStatus = "denied";
    await order.save();

    const minutesRemaining = Math.ceil(45 - minutesSinceDelivery);
    return {
      success: true,
      approved: false,
      data: {
        orderId: order.orderId,
        message: `Refund DENIED for order ${orderId}. Only ${minutesSinceDelivery.toFixed(0)} minutes have passed since delivery. The 45-minute threshold has not been met. Please wait ${minutesRemaining} more minutes.`,
        minutesSinceDelivery: Math.round(minutesSinceDelivery),
        minutesRemaining,
      },
    };
  }
}

export async function trackDriver(orderId: string, userId: string) {
  const order = await Order.findOne({orderId, userId});

  if (!order) {
    return {success: false, error: `Order ${orderId} not found.`};
  }

  if (
    order.status === "delivered" ||
    order.status === "refunded" ||
    order.status === "cancelled"
  ) {
    return {
      success: true,
      data: {
        orderId: order.orderId,
        message: `Order has already been ${order.status}. No active delivery tracking available.`,
        status: order.status,
      },
    };
  }

  if (order.status !== "out_for_delivery") {
    return {
      success: true,
      data: {
        orderId: order.orderId,
        message: `Order is currently ${order.status}. Driver tracking is available once the order is out for delivery.`,
        status: order.status,
      },
    };
  }

  return {
    success: true,
    data: {
      orderId: order.orderId,
      driverName: order.driverName || "Driver assigned",
      driverLocation: order.driverLocation || {lat: 28.6139, lng: 77.209},
      deliveryAddress: order.deliveryAddress,
      status: order.status,
    },
  };
}

export async function getOrderHistory(userId: string,orderId?: string, limit: number = 10) {
  const orders = await Order.find({
    userId,
    orderId,
    status: {$in: ["delivered", "refunded", "cancelled"]},
  })
    .sort({orderTimestamp: -1})
    .limit(limit)
    .lean();

  if (!orders.length) {
    return {success: false, error: `No orders found for user ${userId}.`};
  }

  return {
    success: true,
    data: orders.map((order) => ({
      orderId: order.orderId,
      items: order.items,
      totalAmount: order.totalAmount,
      status: order.status,
      orderTimestamp: order.orderTimestamp,
      deliveryTimestamp: order.deliveryTimestamp,
      refundStatus: order.refundStatus,
    })),
  };
}
