import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();

  const menuItems = [
    { path: "/", label: "Dashboard", icon: "dashboard" },
    { path: "/courses", label: "Kurse", icon: "menu_book" },
    { path: "/questions", label: "Fragen & Antworten", icon: "lightbulb" },
    { path: "/leaderboard", label: "Rangliste", icon: "leaderboard" },
    { path: "/badges", label: "Abzeichen", icon: "emoji_events" },
    { path: "/profile", label: "Profil", icon: "person" },
  ];

  return (
    <aside className={cn("hidden md:block bg-white border-r border-neutral-200", className)}>
      <nav className="mt-5 px-2 space-y-1">
        {menuItems.map((item) => {
          const isActive = location === item.path;
          
          return (
            <a
              key={item.path}
              href={item.path}
              className={cn(
                "flex items-center px-4 py-2 text-sm font-medium rounded-md",
                isActive
                  ? "text-primary bg-neutral-100"
                  : "text-neutral-700 hover:bg-neutral-100 hover:text-primary"
              )}
            >
              <span className={cn("material-icons mr-3", isActive ? "text-primary" : "text-neutral-400")}>
                {item.icon}
              </span>
              {item.label}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
