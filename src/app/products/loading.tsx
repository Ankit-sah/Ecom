export default function ProductsLoading() {
  return (
    <div className="space-y-16 px-4 py-16">
      <section className="mx-auto flex max-w-6xl flex-col gap-6 text-center">
        <div className="h-4 w-32 animate-pulse rounded bg-[#f6b2c5]/50 mx-auto" />
        <div className="h-10 w-64 animate-pulse rounded bg-[#f6b2c5]/50 mx-auto" />
        <div className="h-4 w-96 animate-pulse rounded bg-[#f6b2c5]/50 mx-auto" />
      </section>

      <section className="mx-auto max-w-6xl">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex h-full flex-col rounded-2xl border border-[#f6b2c5]/60 bg-white/90 shadow-sm"
            >
              <div className="aspect-square animate-pulse rounded-t-2xl bg-[#f6b2c5]/30" />
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="h-4 w-20 animate-pulse rounded bg-[#f6b2c5]/30" />
                <div className="h-6 w-full animate-pulse rounded bg-[#f6b2c5]/30" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-[#f6b2c5]/30" />
                <div className="mt-auto flex items-center justify-between">
                  <div className="h-6 w-20 animate-pulse rounded bg-[#f6b2c5]/30" />
                  <div className="h-10 w-24 animate-pulse rounded-full bg-[#f6b2c5]/30" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

