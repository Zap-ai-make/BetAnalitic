export default function Loading() {
  return (
    <div className="pb-20 px-4 pt-4 space-y-4 animate-pulse">
      <div className="h-12 rounded-xl bg-bg-secondary" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-bg-secondary" />
        ))}
      </div>
      <div className="h-48 rounded-xl bg-bg-secondary" />
    </div>
  )
}
