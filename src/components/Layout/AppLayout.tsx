"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ClientOnly } from "@/components/ClientOnly";
import { DailyLoginBonus } from "@/components/Gamification/DailyLoginBonus";
import { MobileLayoutFixes } from "@/components/Layout/MobileLayoutFixes";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useTheme } from "@/hooks/use-theme";
import { authClient } from "@/lib/auth-client";
import { useNotificationStore } from "@/stores/useNotificationStore";
import PageTransition from "../Transition/PageTransition";
import { BottomNavigation } from "./BottomNavigation";
import { AppSidebar } from "./DesktopSidebar";
import { MobileMenuSheet } from "./MobileMenuSheet";
import { ResponsiveHeader } from "./ResponsiveHeader";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const { unreadCount } = useNotificationStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const hideNavigation = ["/test", "/onboarding", "/sign-in", "/sign-up", "/interactive-quiz"];
  const hideBottomNavigation = [
    "/sign-in",
    "/sign-up",
    "/test",
    "/interactive-quiz",
    "/onboarding",
  ];

  const shouldHideNav = hideNavigation.some((path) =>
    pathname.startsWith(path),
  );
  const shouldHideBottomNav = hideBottomNavigation.some((path) =>
    pathname.startsWith(path),
  );

  const isFullScreen =
    pathname.startsWith("/past-paper") && searchParams.get("id");

  // Monochrome & Minimal App Shell
  const appShellClasses = "flex min-h-screen bg-background overflow-x-hidden selection:bg-electric-blue selection:text-white transition-colors duration-500";

  if (!user || shouldHideNav) {
    return (
      <div className={appShellClasses}>
        <ClientOnly>{user && <DailyLoginBonus />}</ClientOnly>
        <ClientOnly>
          <MobileLayoutFixes />
        </ClientOnly>
        <div className="flex-1 flex flex-col min-h-screen relative max-w-full">
          <div className="flex-1 flex flex-col w-full mx-auto max-w-full">
            {!shouldHideNav && (
              <ResponsiveHeader
                user={user ?? null}
                unreadCount={unreadCount}
                onNotificationClick={() => {
                  if (!user) {
                    toast.info("Login Required", {
                      description: "Please sign in to view your notifications.",
                    });
                    router.push("/sign-in");
                    return;
                  }
                  router.push("/notifications");
                }}
                onSignIn={() => router.push("/sign-in")}
                onSignUp={() => router.push("/sign-up")}
              />
            )}
            <main
              id="main-content"
              className={`flex-1 relative flex flex-col ${!shouldHideNav ? "pt-10" : ""} ${!shouldHideBottomNav ? "pb-32" : ""}`}
            >
              <PageTransition>{children}</PageTransition>
            </main>
          </div>
          {!shouldHideBottomNav && (user || pathname === "/") && (
            <BottomNavigation pathname={pathname} />
          )}
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={sidebarOpen} onOpenChange={setSidebarOpen}>
      <ClientOnly>
        <DailyLoginBonus />
        <MobileLayoutFixes />
      </ClientOnly>
      <AppSidebar
        user={user}
        pathname={pathname}
        theme={theme}
        onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
      />
      <SidebarInset className="bg-background">
        <div className="flex-1 flex flex-col min-h-screen relative max-w-full">
          <div className="flex-1 flex flex-col w-full mx-auto transition-all duration-300 max-w-5xl lg:px-8">
            {!isFullScreen && (
              <ResponsiveHeader
                user={user ?? null}
                unreadCount={unreadCount}
                onNotificationClick={() => {
                  if (!user) {
                    toast.info("Login Required", {
                      description: "Please sign in to view your notifications.",
                    });
                    router.push("/sign-in");
                    return;
                  }
                  router.push("/notifications");
                }}
                onSignIn={() => router.push("/sign-in")}
                onSignUp={() => router.push("/sign-up")}
                mobileMenuTrigger={<MobileMenuSheet />}
              />
            )}
            <main
              id="main-content"
              className={"flex-1 relative flex flex-col pt-10 pb-32 lg:pb-10"}
            >
              <PageTransition>{children}</PageTransition>
            </main>
          </div>
          {!shouldHideBottomNav &&
            !isFullScreen &&
            (user || pathname === "/") && (
              <BottomNavigation pathname={pathname} />
            )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
