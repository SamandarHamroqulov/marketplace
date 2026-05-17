export const CHECKOUT_TAX = 50;
export const CHECKOUT_HANDLING = 29;

export function getShippingFee(method) {
  if (method === 'express') return 8.5;
  if (method === 'schedule') return 0;
  return CHECKOUT_HANDLING;
}

export function calculateTotals(subtotal, shippingMethod = 'free') {
  const tax = CHECKOUT_TAX;
  const shipping = getShippingFee(shippingMethod);
  const total = subtotal + tax + shipping;
  return { subtotal, tax, shipping, total };
}

export const SHIPPING_OPTIONS = [
  {
    id: 'free',
    title: 'Free',
    subtitle: 'Regulary shipment',
    date: '17 Oct, 2023',
    fee: 0,
  },
  {
    id: 'express',
    title: '$8.50',
    subtitle: 'Get your delivery as soon as possible',
    date: '1 Oct, 2023',
    fee: 8.5,
  },
  {
    id: 'schedule',
    title: 'Schedule',
    subtitle: 'Pick a date when you want to get your delivery',
    date: null,
    fee: 0,
  },
];

export function formatShippingLabel(method) {
  const opt = SHIPPING_OPTIONS.find((o) => o.id === method);
  return opt ? opt.title : 'Free';
}
