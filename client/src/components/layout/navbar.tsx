import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocation } from "wouter";

export default function Navbar() {
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
    navigate("/auth");
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="material-icons text-primary mr-2">school</span>
              <span className="font-bold text-xl text-neutral-800">FinanzWissen</span>
            </div>
          </div>
          <div className="flex items-center">
            <button
              type="button"
              className="p-2 rounded-md text-neutral-500 hover:text-neutral-700 focus:outline-none"
              onClick={() => {}}
            >
              <span className="material-icons">search</span>
            </button>
            <div className="relative ml-3">
              <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="relative p-2 rounded-md text-neutral-500 hover:text-neutral-700 focus:outline-none"
                  >
                    <span className="material-icons">notifications</span>
                    {/* Notification indicator would go here */}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="p-2 text-sm font-medium text-center text-neutral-700">
                    Benachrichtigungen
                  </div>
                  <DropdownMenuSeparator />
                  <div className="py-2 px-3 text-sm text-neutral-500 text-center">
                    Keine neuen Benachrichtigungen
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="ml-3 relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center max-w-xs rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center overflow-hidden">
                      {user?.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-2 hidden md:block">
                      <div className="text-sm font-medium text-neutral-800">
                        {user?.username}
                      </div>
                      <div className="text-xs text-neutral-500 flex items-center">
                        Level <span className="ml-1 font-semibold">{user?.level}</span>
                        <div className="w-2 h-2 ml-1 rounded-full bg-secondary"></div>
                      </div>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <span className="material-icons mr-2 text-sm">person</span>
                    Profil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/badges")}>
                    <span className="material-icons mr-2 text-sm">emoji_events</span>
                    Abzeichen
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <span className="material-icons mr-2 text-sm">logout</span>
                    Abmelden
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
