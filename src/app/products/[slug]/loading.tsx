export default function ProductDetailLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-16">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="grid gap-6">
          <div className="aspect-square animate-pulse rounded-3xl bg-[#f6b2c5]/30" />
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-2xl bg-[#f6b2c5]/30" />
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <div className="h-4 w-32 animate-pulse rounded bg-[#f6b2c5]/30" />
            <div className="h-10 w-full animate-pulse rounded bg-[#f6b2c5]/30" />
            <div className="h-4 w-full animate-pulse rounded bg-[#f6b2c5]/30" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-[#f6b2c5]/30" />
          </div>

          <div className="h-12 w-full animate-pulse rounded-full bg-[#f6b2c5]/30" />

          <div className="space-y-4 rounded-3xl border border-[#f6b2c5]/70 bg-white/85 p-8">
            <div className="h-6 w-40 animate-pulse rounded bg-[#f6b2c5]/30" />
            <div className="space-y-3">
              <div className="h-4 w-full animate-pulse rounded bg-[#f6b2c5]/30" />
              <div className="h-4 w-full animate-pulse rounded bg-[#f6b2c5]/30" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-[#f6b2c5]/30" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

