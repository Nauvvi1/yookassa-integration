# YooKassa Demo (Node.js + TypeScript + Express + EJS)

Мини-демо интеграции YooKassa v3: каталог товаров -> создание платежа -> редирект на страницу оплаты → возврат на `success` → вебхук `/webhook` с проверкой статуса.

## Как запустить

1) Установите зависимости:
```bash
npm i
```
2) Скопируйте `.env.example` → `.env` и заполните нужные данные:

3) Запустите dev-сервер:
```bash
npm run dev
```
4) Откройте `http://localhost:3000` и нажмите "Купить"

## Что реализовано
- Каталог товаров (in-memory).
- Создание платежа через API `POST /v3/payments` с **Idempotence-Key**.
- Редирект на `confirmation_url` YooKassa.
- Обработка `GET /success` (по `orderId`) — дополнительно запрашивает статус платежа через `GET /v3/payments/{paymentId}`.
- Обработка `POST /webhook` (уведомления YooKassa) — помечает заказ оплаченным по `payment.succeeded`.
- In-memory хранилище заказов.

## Настройки в кабинете YooKassa
- Укажите **Webhook URL**: `${APP_BASE_URL}/webhook`
- Укажите **Return URL** *(опционально в кабинете; мы передаём также в createPayment)*: `${APP_BASE_URL}/success`
- Включите отправку уведомлений (events): `payment.succeeded` (минимум) и, при желании, `payment.canceled`