import express from 'express';
import morgan from 'morgan';
import path from 'path';
import dotenv from 'dotenv';
import { products, getProduct } from './products';
import { orders } from './orders';
import { createPayment, getPayment } from './yookassa';

dotenv.config();

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PORT = Number(process.env.PORT || 3000);
const APP_BASE_URL = process.env.APP_BASE_URL || `http://localhost:${PORT}`;

const YK_SHOP_ID = process.env.YOOKASSA_SHOP_ID || '';
const YK_SECRET = process.env.YOOKASSA_SECRET_KEY || '';

if (!YK_SHOP_ID || !YK_SECRET) {
  console.warn('YooKassa переменные окружения не заданы. Заполните .env');
}

app.get('/', (req, res) => {
  res.render('index', { products, orders: orders.all() });
});

app.get('/pay/:productId', async (req, res) => {
  const productId = req.params.productId;
  const product = getProduct(productId);
  if (!product) return res.status(404).send('Product not found');

  const order = orders.create(product.id, product.price);
  const description = `${product.title} (заказ №${order.id})`;

  try {
    const payment = await createPayment({
      shopId: YK_SHOP_ID,
      secretKey: YK_SECRET,
      amountRub: product.price,
      description,
      returnUrl: `${APP_BASE_URL}/success?orderId=${order.id}`,
    });

    if (!payment.confirmation?.confirmation_url) {
      return res.status(500).send('No confirmation url from YooKassa');
    }

    orders.setPaymentId(order.id, payment.id);

    res.redirect(payment.confirmation.confirmation_url);
  } catch (e: any) {
    console.error(e);
    res.status(500).send('Payment init failed: ' + e.message);
  }
});

app.get('/success', async (req, res) => {
  const orderId = Number(req.query.orderId || 0);
  if (!orderId) return res.status(400).send('Missing orderId');

  const order = orders.get(orderId);
  if (!order || !order.paymentId) return res.status(404).send('Order not found');

  try {
    const info = await getPayment({
      shopId: YK_SHOP_ID,
      secretKey: YK_SECRET,
      paymentId: order.paymentId,
    });
    if (info.status === 'succeeded' || info.status === 'waiting_for_capture' || (info as any).paid) {
      orders.markPaid(orderId);
      return res.render('success', { orderId });
    }
    return res.render('pending', { orderId, status: info.status });
  } catch (e: any) {
    console.error(e);
    return res.status(500).send('Failed to check payment status: ' + e.message);
  }
});

app.post('/webhook', async (req, res) => {
  const { event, object } = req.body || {};
  try {
    if (event === 'payment.succeeded' && object?.id) {
      const order = orders.byPaymentId(object.id);
      if (order) {
        orders.markPaid(order.id);
        console.log(`Marked order ${order.id} as PAID by webhook`);
      } else {
        console.warn(`Payment ${object.id} received, but order not found`);
      }
    }
    res.status(200).send('OK');
  } catch (e: any) {
    console.error('Webhook error:', e);
    res.status(200).send('OK');
  }
});

app.get('/fail', (req, res) => {
  res.render('fail', { msg: 'Платёж не завершён' });
});

app.listen(PORT, () => {
  console.log(`Server running at ${APP_BASE_URL}`);
});
