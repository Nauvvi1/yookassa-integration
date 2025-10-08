export type Order = {
    id: number;
    productId: string;
    amount: number;
    status: "new" | "paid" | "failed";
    createdAt: Date;
    paidAt?: Date;
    paymentId?: string;
};

class OrderStore {
    private seq = 1000;
    private data = new Map<number, Order>();

    create(productId: string, amount: number): Order {
        const id = ++this.seq;
        const order: Order = { id, productId, amount, status: "new", createdAt: new Date() };
        this.data.set(id, order);
        return order;
    }

    get(id: number): Order | undefined {
        return this.data.get(id);
    }

    byPaymentId(paymentId: string): Order | undefined {
        return [...this.data.values()].find(o => o.paymentId === paymentId);
    }

    setPaymentId(id: number, paymentId: string) {
        const o = this.data.get(id);
        if (o) { o.paymentId = paymentId; }
    }

    markPaid(id: number) {
        const o = this.data.get(id);
        if (o) { o.status = "paid"; o.paidAt = new Date(); }
    }

    markFailed(id: number) {
        const o = this.data.get(id);
        if (o) { o.status = "failed"; }
    }

    all(): Order[] {
        return [...this.data.values()].sort((a, b) => b.id - a.id);
    }
}

export const orders = new OrderStore();
