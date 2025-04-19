"use client"

import { useEffect } from "react"

import { useState } from "react"

import Link from "next/link"
import { Bell, Cloud, Download, Moon, Palette, Save, SettingsIcon, Sun, Upload } from "lucide-react"
import { useTheme } from "next-themes"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase-client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ComingSoonFeature } from "@/components/coming-soon-features"

interface UserSettings {
  theme: string
  notifications: boolean
  pomodoro_work_duration: number
  pomodoro_break_duration: number
  pomodoro_long_break_duration: number
  pomodoro_cycles: number
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const [settings, setSettings] = useState<UserSettings>({
    theme: "system",
    notifications: true,
    pomodoro_work_duration: 25,
    pomodoro_break_duration: 5,
    pomodoro_long_break_duration: 15,
    pomodoro_cycles: 4,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      setLoading(true)

      const { data, error } = await supabase.from("settings").select("*")

      if (error) {
        throw error
      }

      if (data && data.length > 0) {
        const settingsData = data[0]
        setSettings({
          theme: settingsData.theme || "system",
          notifications: settingsData.notifications !== false,
          pomodoro_work_duration: settingsData.pomodoro_work_duration || 25,
          pomodoro_break_duration: settingsData.pomodoro_break_duration || 5,
          pomodoro_long_break_duration: settingsData.pomodoro_long_break_duration || 15,
          pomodoro_cycles: settingsData.pomodoro_cycles || 4,
        })

        // Update theme
        setTheme(settingsData.theme || "system")
      }
    } catch (error) {
      console.error("Error loading settings:", error)
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function saveSettings() {
    try {
      setSaving(true)

      const { error } = await supabase.from("settings").upsert({
        theme: settings.theme,
        notifications: settings.notifications,
        pomodoro_work_duration: settings.pomodoro_work_duration,
        pomodoro_break_duration: settings.pomodoro_break_duration,
        pomodoro_long_break_duration: settings.pomodoro_long_break_duration,
        pomodoro_cycles: settings.pomodoro_cycles,
      })

      if (error) {
        throw error
      }

      // Update theme
      setTheme(settings.theme)

      toast({
        title: "Settings Saved",
        description: "Your settings have been updated successfully",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  function handleSettingChange(key: keyof UserSettings, value: any) {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="pomodoro">Pomodoro</TabsTrigger>
          <TabsTrigger value="backup">Backup & Sync</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how the application looks on your device</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={settings.theme === "light" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSettingChange("theme", "light")}
                    className="flex items-center gap-1"
                  >
                    <Sun className="h-4 w-4" />
                    Light
                  </Button>
                  <Button
                    variant={settings.theme === "dark" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSettingChange("theme", "dark")}
                    className="flex items-center gap-1"
                  >
                    <Moon className="h-4 w-4" />
                    Dark
                  </Button>
                  <Button
                    variant={settings.theme === "system" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSettingChange("theme", "system")}
                    className="flex items-center gap-1"
                  >
                    <Palette className="h-4 w-4" />
                    System
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Configure how you want to receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for important events and reminders
                  </p>
                </div>
                <Switch
                  checked={settings.notifications}
                  onCheckedChange={(checked) => handleSettingChange("notifications", checked)}
                />
              </div>
              <Separator />
              <ComingSoonFeature
                title="Notification Preferences"
                description="Choose which types of notifications you want to receive"
                icon={<Bell className="h-4 w-4" />}
                buttonText="Configure Notifications"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resources</CardTitle>
              <CardDescription>Access helpful resources and documentation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Button variant="outline" asChild>
                  <Link href="/settings/resources">
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    View Resources
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pomodoro" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pomodoro Timer Settings</CardTitle>
              <CardDescription>Customize your pomodoro timer durations and cycles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="workDuration">Work Duration (minutes)</Label>
                  <Input
                    id="workDuration"
                    type="number"
                    min="1"
                    max="120"
                    value={settings.pomodoro_work_duration}
                    onChange={(e) => handleSettingChange("pomodoro_work_duration", Number.parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="breakDuration">Break Duration (minutes)</Label>
                  <Input
                    id="breakDuration"
                    type="number"
                    min="1"
                    max="30"
                    value={settings.pomodoro_break_duration}
                    onChange={(e) => handleSettingChange("pomodoro_break_duration", Number.parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longBreakDuration">Long Break Duration (minutes)</Label>
                  <Input
                    id="longBreakDuration"
                    type="number"
                    min="1"
                    max="60"
                    value={settings.pomodoro_long_break_duration}
                    onChange={(e) =>
                      handleSettingChange("pomodoro_long_break_duration", Number.parseInt(e.target.value))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cycles">Cycles until Long Break</Label>
                  <Input
                    id="cycles"
                    type="number"
                    min="1"
                    max="10"
                    value={settings.pomodoro_cycles}
                    onChange={(e) => handleSettingChange("pomodoro_cycles", Number.parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Backup & Sync</CardTitle>
              <CardDescription>Backup your data and sync across devices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ComingSoonFeature
                title="Cloud Backup"
                description="Automatically backup your data to the cloud"
                icon={<Cloud className="h-4 w-4" />}
                buttonText="Configure Backup"
              />

              <Separator />

              <ComingSoonFeature
                title="Export Data"
                description="Export your data to a file for backup or transfer"
                icon={<Download className="h-4 w-4" />}
                buttonText="Export Data"
              />

              <Separator />

              <ComingSoonFeature
                title="Import Data"
                description="Import data from a backup file"
                icon={<Upload className="h-4 w-4" />}
                buttonText="Import Data"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
