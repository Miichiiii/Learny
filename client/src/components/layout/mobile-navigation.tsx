import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

export default function MobileNavigation() {
  const [location, navigate] = useLocation();

  const menuItems = [
    { path: "/", label: "Dashboard", icon: "dashboard" },
    { path: "/courses", label: "Kurse", icon: "menu_book" },
    { path: "/questions", label: "Fragen", icon: "lightbulb" },
    { path: "/leaderboard", label: "Rangliste", icon: "leaderboard" },
    { path: "/profile", label: "Profil", icon: "person" },
  ];

  return (
    <nav className="md:hidden bg-white border-t border-neutral-200 fixed bottom-0 left-0 right-0 z-10">
      <div className="grid grid-cols-5 h-16">
        {menuItems.map((item) => {
          const isActive = location === item.path;
          
          return (
            <a
              key={item.path}
              href={item.path}
              onClick={(e) => {
                e.preventDefault();
                navigate(item.path);
              }}
              className={cn(
                "flex flex-col items-center justify-center",
                isActive ? "text-primary" : "text-neutral-500"
              )}
            >
              <span className="material-icons text-lg">{item.icon}</span>
              <span className="text-xs mt-1">{item.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
