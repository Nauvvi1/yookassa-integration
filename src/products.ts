export type Product = {
    id: string;
    title: string;
    price: number;
    description?: string;
};

export const products: Product[] = [
    { id: "p1", title: "Pro-подписка (1 мес.)", price: 299, description: "Доступ к премиум-функциям" },
    { id: "p2", title: "Pro-подписка (12 мес.)", price: 2490, description: "Годовая подписка со скидкой" },
    { id: "p3", title: "Пакет монет (1000)", price: 199, description: "Внутренняя валюта" }
];

export function getProduct(id: string) {
    return products.find(p => p.id === id) || null;
}
