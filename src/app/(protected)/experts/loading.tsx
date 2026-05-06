export default function Loading() {
  return (
    <div className="pb-20 px-4 pt-4 space-y-3 animate-pulse">
      <div className="h-8 w-32 rounded-lg bg-bg-secondary" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-20 rounded-xl bg-bg-secondary" />
      ))}
    </div>
  )
}
