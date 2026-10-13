/** Indian mobile: 10 digit, 6-9 se shuru */
export const isValidPhone = (p: string) => /^[6-9]\d{9}$/.test(p);

/** Sirf digits rakho, max 10 */
export const cleanPhone = (p: string) => p.replace(/\D/g, "").slice(-10);

export const isValidName = (n: string) => n.trim().length >= 2;
