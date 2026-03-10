"use client";

import { AnimatePresence, m } from "framer-motion";
import Link from "next/link";
import {
  Home01Icon,
  AiCloudIcon,
  Notebook01Icon,
  UserCircleIcon,
  QuillWrite01Icon
} from "hugeicons-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: Home01Icon },
  {
    href: "/interactive-quiz",
    label: "Quiz",
    icon: QuillWrite01Icon,
  },
  {
    href: "/ai-tutor",
    label: "AI Tutor",
    icon: AiCloudIcon,
  },
  {
    href: "/past-papers",
    label: "Papers",
    icon: Notebook01Icon,
  },
  {
    href: "/profile",
    label: "Profile",
    icon: UserCircleIcon,
  },
];

type BottomNavigationProps = {
  pathname: string;
};

export function BottomNavigation({ pathname }: BottomNavigationProps) {
  return (
    <nav
      id="bottom-navigation"
      aria-label="Bottom navigation"
      className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-40 ios-dock rounded-[2.5rem] grid grid-cols-5 p-2"
    >
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href === "/dashboard" && pathname === "/");
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className="relative flex flex-col items-center justify-center py-2 min-h-[64px] transition-all duration-300 group rounded-2xl touch-manipulation"
          >
            <AnimatePresence>
              {isActive && (
                <m.div
                  layoutId="active-pill"
                  className="absolute inset-x-2 inset-y-1 bg-electric-blue/10 rounded-2xl z-0"
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}
            </AnimatePresence>

            <div className="relative z-10 flex flex-col items-center justify-center gap-1">
              <Icon
                size={24}
                variant={isActive ? "solid" : "linear"}
                className={`transition-all duration-300 ${
                  isActive
                    ? "text-electric-blue scale-110"
                    : "text-muted-foreground group-hover:text-foreground"
                }`}
              />
              <span
                className={`text-[10px] font-bold uppercase tracking-widest ${
                  isActive ? "text-electric-blue" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
