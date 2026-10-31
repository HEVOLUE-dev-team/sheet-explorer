"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarMenuButton } from "@/components/ui/sidebar";

const LABELS = { light: "Clair", dark: "Sombre", system: "Système" } as const;

export function ThemeToggle() {
  const { theme = "system", setTheme, resolvedTheme } = useTheme();
  // Le thème n'est connu qu'après hydratation.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const Icon = !mounted ? Monitor : theme === "system" ? Monitor : resolvedTheme === "dark" ? Moon : Sun;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<SidebarMenuButton />}>
        <Icon />
        <span>Thème : {mounted ? LABELS[theme as keyof typeof LABELS] ?? "Système" : "Système"}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-44">
        <DropdownMenuRadioGroup value={theme} onValueChange={(v) => setTheme(v as string)}>
          <DropdownMenuRadioItem value="light">
            <Sun /> Clair
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">
            <Moon /> Sombre
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">
            <Monitor /> Système
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
