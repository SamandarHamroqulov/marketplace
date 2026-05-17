import { API_ORIGIN } from './client.js';

const DEFAULT_COLORS = ['#5e3a7a', '#8b2942', '#1a1a1a', '#d4af37', '#c8c8c8', '#f5f5f5'];
const DEFAULT_STORAGE = ['128GB', '256GB', '512GB', '1TB'];
const DEFAULT_SPECS = {
  screenSize: '6.7"',
  cpu: 'Apple A16 Bionic',
  cores: '6',
  mainCam: '48+12+12 MP',
  frontCam: '12 MP',
  battery: '4323 mAh',
};

export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return 'https://via.placeholder.com/140x140?text=Product';
  if (imageUrl.startsWith('http')) return imageUrl;
  const clean = imageUrl.replace(/^\.\//, '');
  const origin = API_ORIGIN || window.location.origin;
  return `${origin}/${clean}`;
};

export const mapProduct = (p) => {
  const specs = { ...DEFAULT_SPECS, ...(p.specs || {}) };
  return {
    id: p.id,
    name: p.title,
    model: (p.id || '').slice(0, 8).toUpperCase(),
    price: Number(p.price),
    oldPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
    brand: p.brand || p.category?.name || 'Other',
    category: p.category?.name || 'Products',
    categoryId: p.category?.id,
    images: (p.images?.length ? p.images.map((i) => getImageUrl(i.imageUrl)) : [getImageUrl(null)]),
    image: getImageUrl(p.images?.[0]?.imageUrl),
    colors: p.colors?.length ? p.colors : DEFAULT_COLORS,
    storage: p.storageOptions?.length ? p.storageOptions : DEFAULT_STORAGE,
    rating: p.avgRating ?? 4.8,
    reviews: p.reviews?.length ?? 0,
    screenSize: specs.screenSize,
    cpu: specs.cpu,
    cores: specs.cores,
    mainCam: specs.mainCam,
    frontCam: specs.frontCam,
    battery: specs.battery,
    specs,
    detailSpecs: p.detailSpecs || {
      Screen: {
        'Screen diagonal': '6.7"',
        Resolution: '2796x1290',
        'Refresh rate': '120 Hz',
        'Pixel density': '460 ppi',
        'Screen type': 'OLED',
        Additionally: 'Dynamic Island, Always-On display',
      },
      CPU: {
        CPU: 'A16 Bionic',
        'Number of cores': '6',
      },
    },
    inStock: p.inStock !== false,
    description: p.description,
  };
};

export const mapCartItem = (item) => ({
  id: item.product.id,
  cartItemId: item.id,
  name: item.product.title,
  sku: `#${String(item.product.id).replace(/-/g, '').slice(0, 14)}`,
  price: Number(item.product.price),
  qty: item.quantity,
  image: getImageUrl(item.product.images?.[0]?.imageUrl),
});

export const mapReview = (r) => ({
  id: r.id,
  rating: r.rating,
  comment: r.comment,
  userName: r.user?.fullName || 'User',
  date: r.createdAt
    ? new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : '',
});
