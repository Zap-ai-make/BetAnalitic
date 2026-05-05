export default function Loading() {
  return (
    <div className="min-h-screen bg-bg-primary pb-20 px-4 pt-4 space-y-4 animate-pulse">
      {/* Intro card skeleton */}
      <div className="h-40 rounded-2xl bg-bg-secondary" />
      {/* Agent grid skeleton */}
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-bg-secondary" />
        ))}
      </div>
      {/* Content skeleton */}
      <div className="h-32 rounded-2xl bg-bg-secondary" />
    </div>
  )
}
