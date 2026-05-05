export default function Loading() {
  return (
    <div className="pb-20 px-4 pt-4 space-y-3 animate-pulse">
      <div className="h-12 rounded-xl bg-bg-secondary" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-32 rounded-xl bg-bg-secondary" />
      ))}
    </div>
  )
}
