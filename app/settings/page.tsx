"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { GoogleClassroomIntegration } from "@/components/google-classroom-integration"
import { Badge } from "@/components/ui/badge"
import { Clock, AlertCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ComingSoonFeatures } from "@/components/coming-soon-features"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general")

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your application settings and preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="backup">Backup & Sync</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure general application settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input id="name" placeholder="Enter your name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="Enter your email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="academy">Academy</Label>
                <Select defaultValue="usafa">
                  <SelectTrigger id="academy">
                    <SelectValue placeholder="Select academy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usafa">United States Air Force Academy</SelectItem>
                    <SelectItem value="usma">United States Military Academy</SelectItem>
                    <SelectItem value="usna">United States Naval Academy</SelectItem>
                    <SelectItem value="uscga">United States Coast Guard Academy</SelectItem>
                    <SelectItem value="usmma">United States Merchant Marine Academy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="graduation-year">Graduation Year</Label>
                <Select defaultValue="2025">
                  <SelectTrigger id="graduation-year">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                    <SelectItem value="2027">2027</SelectItem>
                    <SelectItem value="2028">2028</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize the look and feel of the application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Enable dark mode for the application</p>
                </div>
                <Switch id="dark-mode" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="high-contrast">High Contrast</Label>
                  <p className="text-sm text-muted-foreground">Increase contrast for better visibility</p>
                </div>
                <Switch id="high-contrast" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="font-size">Font Size</Label>
                <Select defaultValue="medium">
                  <SelectTrigger id="font-size">
                    <SelectValue placeholder="Select font size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch id="email-notifications" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive push notifications on your device</p>
                </div>
                <Switch id="push-notifications" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="due-date-reminders">Due Date Reminders</Label>
                  <p className="text-sm text-muted-foreground">Get reminders for upcoming due dates</p>
                </div>
                <Switch id="due-date-reminders" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <GoogleClassroomIntegration />

          <Card className="relative overflow-hidden">
            {/* Coming Soon Badge */}
            <div className="absolute right-0 top-0">
              <Badge
                variant="secondary"
                className="rounded-tl-none rounded-br-none rounded-tr-md rounded-bl-md bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 font-medium"
              >
                <Clock className="h-3 w-3 mr-1" />
                Coming Soon
              </Badge>
            </div>

            <CardHeader>
              <CardTitle className="flex items-center">
                School Portal Integration
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertCircle className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-80">This feature is currently in development and will be available soon.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
              <CardDescription>Connect to your school portal at webappsca.pcrsoft.com</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="text-center py-4">
                <div className="relative mx-auto mb-4 h-20 w-20">
                  <img
                    src="/digital-schoolhouse.png"
                    alt="School Portal"
                    className="h-full w-full object-contain opacity-80"
                  />
                  <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center rounded-full">
                    <Clock className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
                <p className="mb-4 text-muted-foreground">
                  Connect to your school portal to import your official grades and course information
                </p>
                <div className="space-y-4 opacity-60">
                  <div className="space-y-2">
                    <Label htmlFor="portal-username">Username</Label>
                    <Input id="portal-username" placeholder="Enter your portal username" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="portal-password">Password</Label>
                    <Input id="portal-password" type="password" placeholder="Enter your portal password" disabled />
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <Button className="w-full" disabled>
                Connect to School Portal
              </Button>
            </CardFooter>

            {/* Overlay to indicate the feature is disabled */}
            <div className="absolute inset-0 bg-background/5 pointer-events-none" />
          </Card>

          <ComingSoonFeatures />
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Backup & Sync Settings</CardTitle>
              <CardDescription>Configure backup and synchronization options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-backup">Automatic Backup</Label>
                  <p className="text-sm text-muted-foreground">Automatically backup your data</p>
                </div>
                <Switch id="auto-backup" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="backup-frequency">Backup Frequency</Label>
                <Select defaultValue="daily">
                  <SelectTrigger id="backup-frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="backup-location">Backup Location</Label>
                <Textarea id="backup-location" placeholder="Enter backup location or cloud service URL" rows={2} />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Export Data</Button>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
