export default function Loading() {
  return (
    <div className="pb-20 px-4 pt-4 space-y-3 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-24 rounded-xl bg-bg-secondary" />
      ))}
    </div>
  )
}
