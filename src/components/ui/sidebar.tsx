import { menusByRole } from "@/lib/menus_by_role";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import * as Icons from "lucide-react";

export function Sidebar() {
  const { user } = useAuth();
  const role = user?.role || "technician"; // fallback
  const menus = menusByRole[role] || [];

  return (
    <aside className="bg-gray-900 text-white w-64 h-full flex flex-col">
      <div className="px-4 py-6 text-lg font-bold">ISP-Opus</div>
      <nav className="flex-1 space-y-1 px-3">
        {menus.map((item) => {
          const Icon = Icons[item.icon] || Icons.Circle;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800"
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
