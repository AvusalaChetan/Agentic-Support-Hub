const now = new Date();
// ...existing code...

// Type export should be at the end for esbuild compatibility
export type OrderSampleDataType = {
  orderId: string;
  userId: string;
  customerName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: "delivered" | "out_for_delivery" | "preparing";
  deliveryTimestamp: Date | null;
  orderTimestamp: Date;
  refundStatus: string;
  driverName?: string;
  driverLocation?: {lat: number; lng: number};
  deliveryAddress: string;
};

export const orderSampleData: OrderSampleDataType[] = [
  {
    orderId: "ORD-001",
    userId: "USR-001",
    customerName: "Alex Johnson",
    items: [
      {name: "Margherita Pizza", quantity: 2, price: 12.99},
      {name: "Garlic Bread", quantity: 1, price: 4.99},
    ],
    totalAmount: 30.97,
    status: "delivered",
    deliveryTimestamp: new Date(now.getTime() - 120 * 60000), // 2 hours ago — REFUND ELIGIBLE
    orderTimestamp: new Date(now.getTime() - 180 * 60000),
    refundStatus: "none",
    driverName: "Mike Rodriguez",
    deliveryAddress: "221B Baker Street, London",
  },
  {
    orderId: "ORD-002",
    userId: "USR-001",
    customerName: "Alex Johnson",
    items: [
      {name: "Butter Chicken", quantity: 1, price: 15.99},
      {name: "Naan Bread", quantity: 2, price: 3.49},
      {name: "Mango Lassi", quantity: 1, price: 4.99},
    ],
    totalAmount: 27.96,
    status: "delivered",
    deliveryTimestamp: new Date(now.getTime() - 20 * 60000), // 20 mins ago — REFUND DENIED
    orderTimestamp: new Date(now.getTime() - 60 * 60000),
    refundStatus: "none",
    driverName: "Sarah Chen",
    deliveryAddress: "1600 Pennsylvania Avenue NW, Washington, DC",
  },
  {
    orderId: "ORD-003",
    userId: "USR-001",
    customerName: "Alex Johnson",
    items: [
      {name: "Double Cheeseburger", quantity: 1, price: 11.49},
      {name: "French Fries (Large)", quantity: 1, price: 5.99},
      {name: "Chocolate Milkshake", quantity: 1, price: 6.49},
    ],
    totalAmount: 23.97,
    status: "out_for_delivery",
    deliveryTimestamp: null,
    orderTimestamp: new Date(now.getTime() - 35 * 60000),
    refundStatus: "none",
    driverName: "David Park",
    driverLocation: {lat: 28.6139, lng: 77.209},
    deliveryAddress: "10 Downing Street, London",
  },
  {
    orderId: "ORD-004",
    userId: "USR-001",
    customerName: "Alex Johnson",
    items: [
      {name: "Sushi Platter", quantity: 1, price: 24.99},
      {name: "Edamame", quantity: 1, price: 5.99},
    ],
    totalAmount: 30.98,
    status: "preparing",
    deliveryTimestamp: null,
    orderTimestamp: new Date(now.getTime() - 10 * 60000),
    refundStatus: "none",
    deliveryAddress: "350 Fifth Avenue, New York, NY",
  },
];

export const userSampleData = [
  {
    userId: "USR-001",
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    phone: "+1-555-0123",
    address: "221B Baker Street, London",
    orderHistory: ["ORD-001", "ORD-002", "ORD-003", "ORD-004"],
  },
];
