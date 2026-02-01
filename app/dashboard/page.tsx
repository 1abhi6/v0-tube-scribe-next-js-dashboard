import { Sidebar } from "@/components/dashboard/sidebar";
import { Dashboard } from "@/components/dashboard/dashboard";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Dashboard />
    </div>
  );
}
