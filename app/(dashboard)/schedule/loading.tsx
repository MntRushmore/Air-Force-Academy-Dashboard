import { Skeleton } from "@/components/ui/skeleton"

export default function ScheduleLoading() {
  return (
    <div className="container mx-auto py-4">
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-8 w-40" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>

      <Skeleton className="h-[600px] w-full rounded-lg" />
    </div>
  )
}
