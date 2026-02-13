import { images } from '@/assets/imageAssets';

export function CatalogHeroBanner() {
  return (
    <div className="relative overflow-hidden rounded-xl mx-6 lg:mx-10 mt-4 h-36 sm:h-44">
      <img
        src={images.produce}
        alt="Fresh produce"
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
      <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-8">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/20 backdrop-blur-sm text-primary text-[10px] font-bold uppercase tracking-wider mb-2 w-fit">
          <span aria-hidden="true" className="material-symbols-outlined text-[14px]">eco</span>
          Fresh This Season
        </span>
        <h2 className="text-white text-xl sm:text-2xl font-bold">Product Catalog</h2>
        <p className="text-white/70 text-sm mt-1">Browse, compare, and add items to your lists</p>
      </div>
    </div>
  );
}
