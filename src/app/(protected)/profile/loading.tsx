export default function Loading() {
  return (
    <div className="pb-20 px-4 pt-4 space-y-4 animate-pulse">
      <div className="flex items-center gap-4 p-4">
        <div className="w-16 h-16 rounded-full bg-bg-secondary" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-32 rounded bg-bg-secondary" />
          <div className="h-3 w-20 rounded bg-bg-secondary" />
        </div>
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-16 rounded-xl bg-bg-secondary" />
      ))}
    </div>
  )
}
