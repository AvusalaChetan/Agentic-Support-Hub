import { Router, Request, Response } from 'express';
import { Order } from '../models/Order';
import { User } from '../models/User';

const router = Router();

// ─── Health Check ───────────────────────────────────────────────────
router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Orders ─────────────────────────────────────────────────────────
router.get('/orders', async (_req: Request, res: Response) => {
  try {
    const orders = await Order.find().sort({ orderTimestamp: -1 }).lean();
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch orders.' });
  }
});

router.get('/orders/:orderId', async (req: Request, res: Response) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId }).lean();
    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found.' });
      return;
    }
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch order.' });
  }
});

// ─── Users ──────────────────────────────────────────────────────────
router.get('/users/:userId', async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ userId: req.params.userId }).lean();
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found.' });
      return;
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch user.' });
  }
});

// ─── Order History for a user ───────────────────────────────────────
router.get('/users/:userId/orders', async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .sort({ orderTimestamp: -1 })
      .lean();
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch order history.' });
  }
});

export default router;
