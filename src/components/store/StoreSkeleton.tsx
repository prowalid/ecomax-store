/**
 * Reusable skeleton primitives for the storefront.
 * Matches the visual language of the existing design system
 * (rounded-2xl, accent-tinted surfaces, etc.).
 */

interface ProductCardSkeletonProps {
  count?: number;
}

export function ProductCardSkeleton({ count = 8 }: ProductCardSkeletonProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-100 bg-white overflow-hidden animate-pulse"
        >
          {/* Image placeholder */}
          <div className="aspect-square bg-slate-100" />
          {/* Content */}
          <div className="p-4 space-y-3">
            {/* Category badge */}
            <div className="h-4 w-16 bg-slate-100 rounded-full" />
            {/* Product name */}
            <div className="h-5 w-3/4 bg-slate-100 rounded-lg" />
            {/* Price */}
            <div className="flex items-center gap-2">
              <div className="h-6 w-20 bg-slate-200 rounded-lg" />
              <div className="h-4 w-14 bg-slate-100 rounded-lg" />
            </div>
            {/* Button */}
            <div className="h-10 w-full bg-slate-100 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CategorySkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl bg-slate-100 animate-pulse aspect-[4/3]"
        />
      ))}
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-slate-100 animate-pulse aspect-[21/9] sm:aspect-[21/7]" />
  );
}

export function FilterBarSkeleton() {
  return (
    <div className="rounded-[2rem] border border-slate-100 bg-white p-4 sm:p-5 animate-pulse">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(220px,0.7fr)]">
        <div className="h-12 rounded-2xl bg-slate-100" />
        <div className="h-12 rounded-2xl bg-slate-100" />
      </div>
    </div>
  );
}
