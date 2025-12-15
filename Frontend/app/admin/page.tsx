import { AdminStats } from "@/components/admin/admin-stats";
import { UserManagementTable } from "@/components/admin/user-management-table";

export default function AdminPage() {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">
                    Overview of your platform statistics and user management
                </p>
            </div>

            <AdminStats />

            <div className="space-y-4">
                <div>
                    <h3 className="text-2xl font-semibold tracking-tight">User Management</h3>
                    <p className="text-muted-foreground">
                        Manage user roles and permissions
                    </p>
                </div>
                <UserManagementTable />
            </div>
        </div>
    );
}
