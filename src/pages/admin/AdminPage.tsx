import { useAuth } from "../../hooks/useAuth";
import { Spinner } from "../../components/ui";
import { AdminLogin } from "./AdminLogin";
import { AdminDashboard } from "./AdminDashboard";

export function AdminPage() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="h-7 w-7 text-white/60" />
      </div>
    );
  }

  return session ? <AdminDashboard /> : <AdminLogin />;
}
