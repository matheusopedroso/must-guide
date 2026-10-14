export const uid = (size = 10) => crypto.randomUUID().replace(/-/g, '').slice(0, size);
