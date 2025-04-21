"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ResourceDiagnostics } from "@/components/resource-diagnostics"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Trash2, RefreshCw, Save } from "lucide-react"

export default function ResourceSettingsPage() {
  const [settings, setSettings] = useState({
    preloadImages: true,
    useLocalStorage: true,
    enableErrorReporting: true,
    useFallbackImages: true,
  })

  const [isSaving, setIsSaving] = useState(false)

  const handleSaveSettings = () => {
    setIsSaving(true)

    // Save settings to localStorage
    localStorage.setItem("resourceSettings", JSON.stringify(settings))

    setTimeout(() => {
      setIsSaving(false)
    }, 1000)
  }

  const clearResourceCache = () => {
    if (typeof caches !== "undefined") {
      caches.keys().then((cacheNames) => {
        cacheNames.forEach((cacheName) => {
          caches.delete(cacheName)
        })
      })
    }

    // Clear image cache by forcing reload
    const images = document.querySelectorAll("img")
    images.forEach((img) => {
      const src = img.src
      img.src = ""
      img.src = src
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Resource Settings</h1>
        <p className="text-muted-foreground">Manage how the application loads and handles resources</p>
      </div>

      <Tabs defaultValue="settings">
        <TabsList>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resource Loading Preferences</CardTitle>
              <CardDescription>Configure how the application loads images and other resources</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="preload-images" className="flex flex-col space-y-1">
                  <span>Preload critical images</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Load important images in advance to improve performance
                  </span>
                </Label>
                <Switch
                  id="preload-images"
                  checked={settings.preloadImages}
                  onCheckedChange={(checked) => setSettings({ ...settings, preloadImages: checked })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="use-local-storage" className="flex flex-col space-y-1">
                  <span>Cache resources locally</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Store resources in browser cache to reduce loading times
                  </span>
                </Label>
                <Switch
                  id="use-local-storage"
                  checked={settings.useLocalStorage}
                  onCheckedChange={(checked) => setSettings({ ...settings, useLocalStorage: checked })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="error-reporting" className="flex flex-col space-y-1">
                  <span>Error reporting</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Report resource loading errors to help improve the application
                  </span>
                </Label>
                <Switch
                  id="error-reporting"
                  checked={settings.enableErrorReporting}
                  onCheckedChange={(checked) => setSettings({ ...settings, enableErrorReporting: checked })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="fallback-images" className="flex flex-col space-y-1">
                  <span>Use fallback images</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Show placeholder images when resources fail to load
                  </span>
                </Label>
                <Switch
                  id="fallback-images"
                  checked={settings.useFallbackImages}
                  onCheckedChange={(checked) => setSettings({ ...settings, useFallbackImages: checked })}
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={clearResourceCache} className="flex items-center">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear Cache
                </Button>

                <Button onClick={handleSaveSettings} disabled={isSaving} className="flex items-center">
                  {isSaving ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diagnostics">
          <ResourceDiagnostics />
        </TabsContent>
      </Tabs>
    </div>
  )
}
