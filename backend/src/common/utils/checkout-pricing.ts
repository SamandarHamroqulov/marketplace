export const CHECKOUT_TAX = 50;
export const CHECKOUT_HANDLING = 29;

export function getShippingFee(method?: string): number {
  if (method === 'express') return 8.5;
  if (method === 'schedule') return 0;
  return CHECKOUT_HANDLING;
}

export function calculateOrderTotals(subtotal: number, shippingMethod?: string) {
  const taxAmount = CHECKOUT_TAX;
  const shippingFee = getShippingFee(shippingMethod);
  const totalPrice = Number(subtotal) + taxAmount + shippingFee;
  return { subtotal: Number(subtotal), taxAmount, shippingFee, totalPrice };
}
