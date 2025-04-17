import { PomodoroTimer } from "@/components/pomodoro-timer"

export default function PomodoroPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Pomodoro Timer</h1>
        <p className="text-muted-foreground">Use the Pomodoro Technique to boost your productivity and focus</p>
      </div>

      <PomodoroTimer />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">What is the Pomodoro Technique?</h2>
          <p className="text-muted-foreground">
            The Pomodoro Technique is a time management method that uses a timer to break work into intervals,
            traditionally 25 minutes in length, separated by short breaks.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">How to use it</h2>
          <ol className="list-decimal list-inside text-muted-foreground space-y-1 pl-1">
            <li>Choose a task to work on</li>
            <li>Start the timer and focus on the task</li>
            <li>When the timer rings, take a short break</li>
            <li>After 4 pomodoros, take a longer break</li>
          </ol>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Benefits</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-1">
            <li>Improves focus and concentration</li>
            <li>Reduces mental fatigue</li>
            <li>Increases accountability</li>
            <li>Helps manage distractions</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
