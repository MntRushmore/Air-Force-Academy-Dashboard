"use client"

import { Award, Trophy } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export function XPProgress() {
  const currentXP = 1250
  const nextLevelXP = 2000
  const level = 12
  const progress = (currentXP / nextLevelXP) * 100

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
            <Trophy className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <div className="text-sm font-medium">Level {level}</div>
            <div className="text-xs text-muted-foreground">Dedicated Cadet</div>
          </div>
        </div>
        <div className="text-sm font-medium">
          {currentXP} / {nextLevelXP} XP
        </div>
      </div>

      <Progress value={progress} className="h-2" />

      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="space-y-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 mx-auto">
            <Award className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>5 Badges</div>
        </div>
        <div className="space-y-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900 mx-auto">
            <Trophy className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div>14 Day Streak</div>
        </div>
        <div className="space-y-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900 mx-auto">
            <Award className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>8 Goals</div>
        </div>
      </div>
    </div>
  )
}
