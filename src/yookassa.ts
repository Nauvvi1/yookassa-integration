import axios from 'axios';
import { randomUUID } from 'crypto';

const API_BASE = 'https://api.yookassa.ru/v3';

function basicAuth(shopId: string, secretKey: string) {
    return 'Basic ' + Buffer.from(`${shopId}:${secretKey}`).toString('base64');
}

export async function createPayment(opts: {
    shopId: string;
    secretKey: string;
    amountRub: number;
    description: string;
    returnUrl: string;
}) {
    const { shopId, secretKey, amountRub, description, returnUrl } = opts;

    const body = {
        amount: { value: amountRub.toFixed(2), currency: 'RUB' },
        capture: true,
        confirmation: { type: 'redirect', return_url: returnUrl },
        description,
    };

    const { data } = await axios.post(
        `${API_BASE}/payments`,
        body,
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': basicAuth(shopId, secretKey),
                'Idempotence-Key': randomUUID(),
            },
        }
    );

    return data as {
        id: string;
        status: string;
        confirmation?: { type: string; confirmation_url?: string };
    };
}

export async function getPayment(opts: { shopId: string; secretKey: string; paymentId: string; }) {
    const { shopId, secretKey, paymentId } = opts;

    const { data } = await axios.get(
        `${API_BASE}/payments/${paymentId}`,
        {
            headers: {
                'Authorization': basicAuth(shopId, secretKey),
            },
        }
    );

    return data as { id: string; status: string; paid?: boolean };
}
