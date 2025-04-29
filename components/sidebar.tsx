"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  Dumbbell,
  FileText,
  GraduationCap,
  Home,
  LineChart,
  Menu,
  PenTool,
  Settings,
  Target,
  Timer,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useUser } from "@/hooks/useUser";

type SidebarContextType = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isMobile: boolean;
};

const SidebarContext = React.createContext<SidebarContextType | undefined>(undefined);

function useSidebarContext() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebarContext must be used within a SidebarProvider");
  }
  return context;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  return isMobile;
}

const routes = [
  { label: "Dashboard", icon: Home, href: "/dashboard" },
  { label: "Courses", icon: BookOpen, href: "/courses" },
  { label: "Schedule", icon: Calendar, href: "/schedule" },
  { label: "Goals", icon: Target, href: "/goals" },
  { label: "Journal", icon: PenTool, href: "/journal" },
  { label: "Study", icon: BookOpen, href: "/study" },
  { label: "Pomodoro", icon: Timer, href: "/pomodoro" },
  { label: "Grades", icon: FileText, href: "/grades" },
  { label: "Report Card", icon: ClipboardList, href: "/report-card" },
  { label: "Grade Comparison", icon: LineChart, href: "/grade-comparison" },
  { label: "Grade Prediction", icon: GraduationCap, href: "/grade-prediction" },
  { label: "Fitness", icon: Dumbbell, href: "/fitness" },
  { label: "Analytics", icon: BarChart3, href: "/analytics" },
  { label: "Mentorship", icon: Users, href: "/mentorship" },
  { label: "Progress", icon: LineChart, href: "/progress" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(true);
  const isMobile = useIsMobile();

  React.useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [isMobile]);

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen, isMobile }}>
      {children}
    </SidebarContext.Provider>
  );
}

function Sidebar() {
  const pathname = usePathname();
  const { isOpen, setIsOpen, isMobile } = useSidebarContext();
  const { data: user, isLoading } = useUser();

  const initials = user?.user_metadata?.name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase() || "U";

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Home className="h-5 w-5" />
          {!isMobile && (
            <span className="transition-opacity">
              USAFA Dashboard
            </span>
          )}
        </Link>
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="ml-auto h-8 w-8"
            aria-label={isOpen ? "Close Sidebar" : "Open Sidebar"}
          >
            {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        )}
      </div>
      <ScrollArea className="flex-1">
        <nav className="grid gap-1 px-2 py-4">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname === route.href ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                !isOpen && !isMobile && "justify-center px-2"
              )}
              onClick={() => isMobile && setIsOpen(false)}
            >
              <route.icon className="h-5 w-5" />
              {(isOpen || isMobile) && <span>{route.label}</span>}
            </Link>
          ))}
        </nav>
      </ScrollArea>
      <div className="border-t p-4 flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-sm font-medium">{isLoading ? "..." : initials}</span>
        </div>
        {isOpen && (
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {isLoading ? "Loading..." : user?.user_metadata?.name || "Guest"}
            </span>
            <span className="text-xs text-muted-foreground">
              {isLoading ? "Loading..." : user?.email}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="p-0 w-64">
          {sidebarContent}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r bg-background transition-all duration-300",
      isOpen ? "translate-x-0" : "-translate-x-full md:w-16 md:translate-x-0"
    )}>
      {sidebarContent}
    </aside>
  );
}

export {
  Sidebar,
  SidebarProvider,
  useSidebarContext as useSidebar,
};