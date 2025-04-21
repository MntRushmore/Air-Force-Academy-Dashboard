"use client";

import { useEffect } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  Cloud,
  Download,
  LogOut,
  Moon,
  Palette,
  Save,
  SettingsIcon,
  Sun,
  Upload,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComingSoonFeature } from "@/components/coming-soon-features";
import { createClient } from "@/utils/supabase/client";

interface UserSettings {
  theme: string;
  notifications: boolean;
  pomodoro_work_duration: number;
  pomodoro_break_duration: number;
  pomodoro_long_break_duration: number;
  pomodoro_cycles: number;
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const router = useRouter();
  const [settings, setSettings] = useState<UserSettings>({
    theme: theme || "system",
    notifications: true,
    pomodoro_work_duration: 25,
    pomodoro_break_duration: 5,
    pomodoro_long_break_duration: 15,
    pomodoro_cycles: 4,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setSettings({
          theme: data.theme || theme || "system",
          notifications: data.notifications !== false,
          pomodoro_work_duration: data.pomodoro_work_duration || 25,
          pomodoro_break_duration: data.pomodoro_break_duration || 5,
          pomodoro_long_break_duration: data.pomodoro_long_break_duration || 15,
          pomodoro_cycles: data.pomodoro_cycles || 4,
        });

        // Update theme
        setTheme(data.theme || "system");
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    try {
      setSaving(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { error } = await supabase.from("settings").upsert({
        user_id: user.id,
        theme: settings.theme,
        notifications: settings.notifications,
        pomodoro_work_duration: settings.pomodoro_work_duration,
        pomodoro_break_duration: settings.pomodoro_break_duration,
        pomodoro_long_break_duration: settings.pomodoro_long_break_duration,
        pomodoro_cycles: settings.pomodoro_cycles,
      });

      if (error) {
        throw error;
      }

      // Update theme
      setTheme(settings.theme);

      toast({
        title: "Settings Saved",
        description: "Your settings have been updated successfully",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });

      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  }

  function handleSettingChange(key: keyof UserSettings, value: any) {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        <div className="flex gap-2">
          {/* <Button onClick={saveSettings} disabled={saving}>
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
          </Button> */}
          <Button variant="destructive" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
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
              <CardDescription>
                Customize how the application looks on your device
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setTheme("light");
                      handleSettingChange("theme", "light");
                    }}
                    className="flex items-center gap-1"
                  >
                    <Sun className="h-4 w-4" />
                    Light
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setTheme("dark");
                      handleSettingChange("theme", "dark");
                    }}
                    className="flex items-center gap-1"
                  >
                    <Moon className="h-4 w-4" />
                    Dark
                  </Button>
                  <Button
                    variant={theme === "system" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setTheme("system");
                      handleSettingChange("theme", "system");
                    }}
                    className="flex items-center gap-1"
                  >
                    <Palette className="h-4 w-4" />
                    System
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notifications">Notifications</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="notifications"
                    checked={settings.notifications}
                    onCheckedChange={(checked) =>
                      handleSettingChange("notifications", checked)
                    }
                  />
                  <Label htmlFor="notifications">
                    Enable push notifications
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pomodoro" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pomodoro Timer Settings</CardTitle>
              <CardDescription>
                Customize your pomodoro timer durations and cycles
              </CardDescription>
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
                    onChange={(e) =>
                      handleSettingChange(
                        "pomodoro_work_duration",
                        Number.parseInt(e.target.value)
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="breakDuration">
                    Break Duration (minutes)
                  </Label>
                  <Input
                    id="breakDuration"
                    type="number"
                    min="1"
                    max="30"
                    value={settings.pomodoro_break_duration}
                    onChange={(e) =>
                      handleSettingChange(
                        "pomodoro_break_duration",
                        Number.parseInt(e.target.value)
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longBreakDuration">
                    Long Break Duration (minutes)
                  </Label>
                  <Input
                    id="longBreakDuration"
                    type="number"
                    min="1"
                    max="60"
                    value={settings.pomodoro_long_break_duration}
                    onChange={(e) =>
                      handleSettingChange(
                        "pomodoro_long_break_duration",
                        Number.parseInt(e.target.value)
                      )
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
                    onChange={(e) =>
                      handleSettingChange(
                        "pomodoro_cycles",
                        Number.parseInt(e.target.value)
                      )
                    }
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
              <CardDescription>
                Backup your data and sync across devices
              </CardDescription>
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
  );
}
