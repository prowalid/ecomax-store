import { Search, Bell, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const AdminHeader = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/admin/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 bg-card border-b border-border h-14 flex items-center px-6 gap-4">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="بحث..."
            className="w-full h-9 pr-9 pl-3 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
          <Bell className="w-[18px] h-[18px]" strokeWidth={1.75} />
          <span className="absolute top-1.5 left-1.5 w-2 h-2 bg-critical rounded-full" />
        </button>

        {/* User email */}
        {user && (
          <span className="text-xs text-muted-foreground hidden sm:block max-w-[160px] truncate" dir="ltr">
            {user.email}
          </span>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          title="تسجيل الخروج"
        >
          <LogOut className="w-[18px] h-[18px]" strokeWidth={1.75} />
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
