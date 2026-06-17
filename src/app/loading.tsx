export default function Loading() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 bg-forest-900 rounded-xl flex items-center justify-center">
            <span className="text-amber-400 font-display font-extrabold text-sm">M</span>
          </div>
          <div className="absolute -inset-1.5 border-2 border-forest-300 border-t-forest-600 rounded-2xl animate-spin" />
        </div>
        <p className="text-xs text-slate-400 font-medium">Loading…</p>
      </div>
    </div>
  );
}
