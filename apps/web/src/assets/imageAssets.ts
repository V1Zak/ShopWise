// Royalty-free food photography from Unsplash
// Images loaded via CDN, not bundled — optimized WebP format with auto sizing

const UNSPLASH_BASE = 'https://images.unsplash.com';

export const images = {
  // Auth hero — fresh vegetables spread
  authHero: `${UNSPLASH_BASE}/photo-1543362906-acfc16c67564?w=1200&q=80&auto=format&fit=crop`,
  // Category photos
  produce: `${UNSPLASH_BASE}/photo-1610832958506-aa56368176cf?w=600&q=80&auto=format&fit=crop`,
  meat: `${UNSPLASH_BASE}/photo-1607623814075-e51df1bdc82f?w=600&q=80&auto=format&fit=crop`,
  dairy: `${UNSPLASH_BASE}/photo-1628088062854-d1870b4553da?w=600&q=80&auto=format&fit=crop`,
  bakery: `${UNSPLASH_BASE}/photo-1509440159596-0249088772ff?w=600&q=80&auto=format&fit=crop`,
  beverages: `${UNSPLASH_BASE}/photo-1544145945-f90425340c7e?w=600&q=80&auto=format&fit=crop`,
  // Generic food placeholder
  placeholder: `${UNSPLASH_BASE}/photo-1606787366850-de6330128bfc?w=600&q=80&auto=format&fit=crop`,
} as const;

export const categoryImages: Record<string, string> = {
  produce: images.produce,
  meat: images.meat,
  dairy: images.dairy,
  bakery: images.bakery,
  beverages: images.beverages,
  frozen: images.placeholder,
  pantry: images.placeholder,
  household: images.placeholder,
  snacks: images.placeholder,
};
