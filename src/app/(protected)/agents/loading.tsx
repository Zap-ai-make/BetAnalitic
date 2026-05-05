export default function Loading() {
  return (
    <div className="pb-20 px-4 pt-4 space-y-3 animate-pulse">
      <div className="h-14 rounded-xl bg-bg-secondary" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-bg-secondary" />
        ))}
      </div>
    </div>
  )
}
