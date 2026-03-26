// Composant de base skeleton
function SkeletonBlock({ className = '' }) {
  return (
    <div className={`bg-gray-700/60 rounded-xl animate-pulse ${className}`} />
  )
}

// Skeleton carte agent
export function AgentCardSkeleton() {
  return (
    <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700/50">
      <div className="flex items-start gap-3">
        <SkeletonBlock className="w-14 h-14 rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonBlock className="h-4 w-32" />
          <SkeletonBlock className="h-3 w-24" />
          <SkeletonBlock className="h-3 w-full" />
          <div className="flex gap-1 pt-1">
            <SkeletonBlock className="h-5 w-16 rounded-full" />
            <SkeletonBlock className="h-5 w-20 rounded-full" />
            <SkeletonBlock className="h-5 w-14 rounded-full" />
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <SkeletonBlock className="flex-1 h-10 rounded-xl" />
        <SkeletonBlock className="flex-1 h-10 rounded-xl" />
      </div>
    </div>
  )
}

// Skeleton liste agents
export function AgentsListSkeleton({ count = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <AgentCardSkeleton key={i} />
      ))}
    </div>
  )
}

// Skeleton mission card
export function MissionCardSkeleton() {
  return (
    <div className="bg-gray-800 rounded-2xl border border-gray-700/50 overflow-hidden mb-3">
      <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SkeletonBlock className="w-8 h-8 rounded-lg" />
          <div className="space-y-1.5">
            <SkeletonBlock className="h-3.5 w-36" />
            <SkeletonBlock className="h-3 w-24" />
          </div>
        </div>
        <SkeletonBlock className="h-6 w-20 rounded-full" />
      </div>
      <div className="px-4 py-3 space-y-2">
        <SkeletonBlock className="h-3 w-full" />
        <SkeletonBlock className="h-3 w-3/4" />
        <SkeletonBlock className="h-3 w-1/2" />
      </div>
      <div className="px-4 pb-4 flex gap-2">
        <SkeletonBlock className="flex-1 h-10 rounded-xl" />
        <SkeletonBlock className="flex-1 h-10 rounded-xl" />
      </div>
    </div>
  )
}

// Skeleton profil agent (page détail)
export function AgentProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gray-900 pb-28">
      <div className="bg-gray-800 px-4 pt-14 pb-8 flex flex-col items-center gap-3">
        <SkeletonBlock className="w-28 h-28 rounded-2xl" />
        <SkeletonBlock className="h-6 w-40" />
        <SkeletonBlock className="h-4 w-28" />
        <div className="flex gap-8 mt-2">
          {[1,2,3].map(i => (
            <div key={i} className="flex flex-col items-center gap-1">
              <SkeletonBlock className="h-6 w-8" />
              <SkeletonBlock className="h-3 w-10" />
            </div>
          ))}
        </div>
      </div>
      <div className="px-4 mt-4 space-y-3">
        {[1,2,3].map(i => (
          <div key={i} className="bg-gray-800 rounded-2xl p-4 border border-gray-700/50 space-y-2">
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="h-3 w-full" />
            <SkeletonBlock className="h-3 w-5/6" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default SkeletonBlock
