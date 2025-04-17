import { CheckCircle2, Circle, Clock, FileText, GraduationCap, Medal, User } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function TimelinePage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">USAFA Journey Timeline</h1>
        <p className="text-muted-foreground">Track your progress through the entire application and academy journey</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="freshman">Freshman</TabsTrigger>
          <TabsTrigger value="sophomore">Sophomore</TabsTrigger>
          <TabsTrigger value="junior">Junior</TabsTrigger>
          <TabsTrigger value="senior">Senior</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">42%</div>
                <Progress value={42} className="h-2 mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Current Phase</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Application Preparation</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Next Milestone</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-purple-500" />
                  <span className="font-medium">Congressional Nomination</span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">Due in 45 days</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Completed Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8/19</div>
                <div className="text-sm text-muted-foreground mt-1">Key requirements</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Application Journey</CardTitle>
              <CardDescription>Key milestones in your USAFA application process</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative ml-4 space-y-8 before:absolute before:inset-y-0 before:left-0 before:ml-[5.75px] before:w-0.5 before:bg-muted">
                <div className="relative">
                  <div className="absolute left-0 top-0 flex h-3 w-3 -translate-x-1/2 items-center justify-center rounded-full bg-green-500 text-background">
                    <CheckCircle2 className="h-3 w-3" />
                  </div>
                  <div className="ml-6 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Research and Preparation</span>
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-600 dark:bg-green-900 dark:text-green-400">
                        Completed
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Research USAFA requirements and prepare academically and physically
                    </p>
                    <div className="text-xs text-muted-foreground">Completed on May 15, 2023</div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute left-0 top-0 flex h-3 w-3 -translate-x-1/2 items-center justify-center rounded-full bg-green-500 text-background">
                    <CheckCircle2 className="h-3 w-3" />
                  </div>
                  <div className="ml-6 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">SAT/ACT Exams</span>
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-600 dark:bg-green-900 dark:text-green-400">
                        Completed
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Take standardized tests and achieve competitive scores
                    </p>
                    <div className="text-xs text-muted-foreground">Completed on June 10, 2023</div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute left-0 top-0 flex h-3 w-3 -translate-x-1/2 items-center justify-center rounded-full bg-blue-500 text-background">
                    <Clock className="h-3 w-3" />
                  </div>
                  <div className="ml-6 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Congressional Nomination</span>
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                        In Progress
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Apply for and secure a nomination from your congressional representative
                    </p>
                    <div className="text-xs text-muted-foreground">Due by October 15, 2023</div>
                    <Progress value={60} className="h-1.5 mt-2" />
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute left-0 top-0 flex h-3 w-3 -translate-x-1/2 items-center justify-center rounded-full bg-blue-500 text-background">
                    <Clock className="h-3 w-3" />
                  </div>
                  <div className="ml-6 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Fitness Assessment</span>
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                        In Progress
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">Complete the Candidate Fitness Assessment (CFA)</p>
                    <div className="text-xs text-muted-foreground">Due by November 30, 2023</div>
                    <Progress value={75} className="h-1.5 mt-2" />
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute left-0 top-0 flex h-3 w-3 -translate-x-1/2 items-center justify-center rounded-full bg-slate-500 text-background">
                    <Circle className="h-3 w-3" />
                  </div>
                  <div className="ml-6 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Medical Examination</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        Scheduled
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Complete the Department of Defense Medical Examination Review Board (DoDMERB) exam
                    </p>
                    <div className="text-xs text-muted-foreground">Scheduled for December 5, 2023</div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute left-0 top-0 flex h-3 w-3 -translate-x-1/2 items-center justify-center rounded-full bg-slate-500 text-background">
                    <Circle className="h-3 w-3" />
                  </div>
                  <div className="ml-6 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">USAFA Application</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        Not Started
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">Complete and submit the official USAFA application</p>
                    <div className="text-xs text-muted-foreground">Due by January 31, 2024</div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute left-0 top-0 flex h-3 w-3 -translate-x-1/2 items-center justify-center rounded-full bg-slate-500 text-background">
                    <Circle className="h-3 w-3" />
                  </div>
                  <div className="ml-6 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Admissions Decision</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        Upcoming
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">Receive admissions decision from USAFA</p>
                    <div className="text-xs text-muted-foreground">Expected by April 15, 2024</div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute left-0 top-0 flex h-3 w-3 -translate-x-1/2 items-center justify-center rounded-full bg-slate-500 text-background">
                    <Circle className="h-3 w-3" />
                  </div>
                  <div className="ml-6 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Basic Cadet Training</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        Upcoming
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">Begin Basic Cadet Training (BCT) at USAFA</p>
                    <div className="text-xs text-muted-foreground">Expected in June 2024</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="freshman" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle>Freshman Year</CardTitle>
                <CardDescription>Building your foundation</CardDescription>
              </div>
              <GraduationCap className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Academic Focus</h3>
                <ul className="ml-6 space-y-2 list-disc text-sm">
                  <li>Maintain a strong GPA (3.5+) in core subjects</li>
                  <li>Take challenging courses, especially in STEM</li>
                  <li>Begin SAT/ACT preparation</li>
                  <li>Join academic clubs related to your interests</li>
                </ul>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="font-medium">Physical Preparation</h3>
                <ul className="ml-6 space-y-2 list-disc text-sm">
                  <li>Participate in school sports or athletic activities</li>
                  <li>Develop a regular fitness routine</li>
                  <li>Learn about the Candidate Fitness Assessment requirements</li>
                </ul>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="font-medium">Leadership Development</h3>
                <ul className="ml-6 space-y-2 list-disc text-sm">
                  <li>Join student organizations or clubs</li>
                  <li>Volunteer in your community</li>
                  <li>Seek leadership roles in extracurricular activities</li>
                </ul>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="font-medium">Research and Exploration</h3>
                <ul className="ml-6 space-y-2 list-disc text-sm">
                  <li>Learn about the USAFA and its mission</li>
                  <li>Research the application process and requirements</li>
                  <li>Consider attending a USAFA summer program</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sophomore" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle>Sophomore Year</CardTitle>
                <CardDescription>Building momentum</CardDescription>
              </div>
              <Medal className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Academic Focus</h3>
                <ul className="ml-6 space-y-2 list-disc text-sm">
                  <li>Continue taking challenging courses, especially in STEM</li>
                  <li>Maintain a strong GPA (3.5+)</li>
                  <li>Take PSAT and begin SAT/ACT preparation</li>
                  <li>Consider taking AP or IB courses</li>
                </ul>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="font-medium">Physical Preparation</h3>
                <ul className="ml-6 space-y-2 list-disc text-sm">
                  <li>Continue participating in sports or athletic activities</li>
                  <li>Intensify your fitness routine</li>
                  <li>Begin specific training for the CFA components</li>
                </ul>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="font-medium">Leadership Development</h3>
                <ul className="ml-6 space-y-2 list-disc text-sm">
                  <li>Take on leadership roles in clubs or organizations</li>
                  <li>Increase community service involvement</li>
                  <li>Consider joining Civil Air Patrol or JROTC</li>
                </ul>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="font-medium">Application Preparation</h3>
                <ul className="ml-6 space-y-2 list-disc text-sm">
                  <li>Attend USAFA information sessions if available</li>
                  <li>Research the congressional nomination process</li>
                  <li>Consider attending a USAFA summer program</li>
                  <li>Begin building relationships with teachers for recommendations</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="junior" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle>Junior Year</CardTitle>
                <CardDescription>Critical preparation phase</CardDescription>
              </div>
              <FileText className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Academic Focus</h3>
                <ul className="ml-6 space-y-2 list-disc text-sm">
                  <li>Take challenging courses, including AP or IB if available</li>
                  <li>Maintain a strong GPA (3.5+)</li>
                  <li>Take the SAT/ACT (multiple times if needed)</li>
                  <li>Consider SAT Subject Tests in math and science</li>
                </ul>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="font-medium">Physical Preparation</h3>
                <ul className="ml-6 space-y-2 list-disc text-sm">
                  <li>Continue sports participation and fitness training</li>
                  <li>Practice specific CFA events regularly</li>
                  <li>Track your progress on each CFA component</li>
                </ul>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="font-medium">Application Preparation</h3>
                <ul className="ml-6 space-y-2 list-disc text-sm">
                  <li>Open a preliminary application with USAFA</li>
                  <li>Begin the congressional nomination application process</li>
                  <li>Attend USAFA Summer Seminar if possible</li>
                  <li>Schedule a DoDMERB medical exam</li>
                  <li>Request letters of recommendation</li>
                </ul>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="font-medium">Leadership Development</h3>
                <ul className="ml-6 space-y-2 list-disc text-sm">
                  <li>Take on significant leadership positions</li>
                  <li>Continue community service and volunteer work</li>
                  <li>Document your leadership experiences for applications</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="senior" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle>Senior Year</CardTitle>
                <CardDescription>Application and decision phase</CardDescription>
              </div>
              <User className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Application Completion</h3>
                <ul className="ml-6 space-y-2 list-disc text-sm">
                  <li>Complete and submit your USAFA application</li>
                  <li>Finalize congressional nomination process</li>
                  <li>Complete the Candidate Fitness Assessment</li>
                  <li>Ensure all medical examinations are completed</li>
                  <li>Submit all required documents and transcripts</li>
                </ul>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="font-medium">Academic Focus</h3>
                <ul className="ml-6 space-y-2 list-disc text-sm">
                  <li>Maintain strong grades through graduation</li>
                  <li>Complete challenging courses successfully</li>
                  <li>Take AP exams if applicable</li>
                  <li>Avoid senioritis - colleges will see your final transcript</li>
                </ul>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="font-medium">Physical Preparation</h3>
                <ul className="ml-6 space-y-2 list-disc text-sm">
                  <li>Continue fitness training and preparation</li>
                  <li>Prepare for Basic Cadet Training physical demands</li>
                  <li>Maintain a healthy lifestyle and nutrition</li>
                </ul>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="font-medium">Decision and Preparation</h3>
                <ul className="ml-6 space-y-2 list-disc text-sm">
                  <li>Review admissions decisions</li>
                  <li>If accepted, complete all required paperwork</li>
                  <li>Prepare mentally and physically for Basic Cadet Training</li>
                  <li>Connect with other incoming cadets</li>
                  <li>Attend orientation events if available</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
