export default function Steps({ steps, current }) {
  return (
    <div className="flex items-center justify-center gap-2 py-2">
      {steps.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={i} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                ${done ? 'bg-green-500 text-white' : active ? 'bg-red-600 text-white ring-2 ring-red-500/40' : 'bg-gray-800 text-gray-500'}`}>
                {done ? '✓' : i + 1}
              </div>
              <span className={`text-[10px] font-medium whitespace-nowrap
                ${active ? 'text-white' : done ? 'text-green-400' : 'text-gray-600'}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-8 h-0.5 mb-4 rounded-full transition-all
                ${done ? 'bg-green-500' : 'bg-gray-700'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
