import CountdownTimer from './CountdownTimer'

export default function CookStep({ step, index, total }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-sm font-sans text-stone-400">
        <span>Step {index + 1} of {total}</span>
        <div className="flex-1 h-1 bg-stone-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-terracotta/60 rounded-full transition-all duration-300"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
      </div>
      <p className="font-sans text-lg text-stone-800 leading-relaxed">{step.text}</p>
      {step.duration_seconds && step.duration_seconds > 0 && (
        <CountdownTimer seconds={step.duration_seconds} />
      )}
    </div>
  )
}
