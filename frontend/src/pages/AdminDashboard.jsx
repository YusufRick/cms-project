import { useState } from "react";
import { DashboardLayout } from "../components/DashboardLayout";

import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";

import { toast } from "sonner";
import { UserPlus, Users, Settings2, Edit, Trash2, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/authContext";

const AdminDashboard = () => {
  const { user } = useAuth();

  // BUGFIX: this was "" before – should be an array
  const [users, setUsers] = useState([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [newUser, setNewUser] = useState({
    email: "",
    name: "",
    role: "consumer",
    organization: user?.organization || "Bank",
  });

  const handleAddUser = () => {
    if (!newUser.email || !newUser.name) {
      toast.error("Please fill in all fields");
      return;
    }

    const userToAdd = {
      id: Date.now().toString(),
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      organization: user?.organization || "Bank",
      createdAt: new Date(),
    };

    setUsers((prev) => [...prev, userToAdd]);
    toast.success("User added successfully");

    setIsAddDialogOpen(false);
    setNewUser({
      email: "",
      name: "",
      role: "consumer",
      organization: user?.organization || "Bank",
    });
  };

  const handleUpdateUser = () => {
    if (!selectedUser) return;

    setUsers((prev) =>
      prev.map((u) => (u.id === selectedUser.id ? selectedUser : u))
    );
    toast.success("User updated successfully");

    setIsEditDialogOpen(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = (id) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    toast.success("User deleted successfully");
  };

  const getRoleBadge = (role) => {
    const styles = {
      consumer: "bg-[#e5ecff] text-[#2563eb]",
      helpdesk: "bg-emerald-50 text-emerald-700",
      support: "bg-amber-50 text-amber-700",
      admin: "bg-rose-50 text-rose-700",
    };

    return (
      <Badge
        className={`rounded-full px-3 py-1 text-xs font-medium border-0 ${
          styles[role] || "bg-slate-100 text-slate-700"
        }`}
      >
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  return (
    <DashboardLayout title="Administration">
      {/* Top hero card – visually similar to Login header */}
      <Card
        className="
          mb-8
          rounded-[28px]
          border border-slate-100
          bg-white
          shadow-[0_24px_80px_rgba(15,23,42,0.10)]
          transition-transform duration-300
          hover:scale-[1.01] hover:shadow-[0_28px_90px_rgba(15,23,42,0.12)]
        "
      >
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e5ecff]">
            <ShieldCheck className="h-8 w-8 text-[#2563eb]" />
          </div>
          <div>
            <CardTitle className="text-2xl font-semibold text-slate-900">
              Administration Console
            </CardTitle>
            <CardDescription className="text-[15px] text-slate-500">
              Manage users, roles and permissions across your organization.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-8 lg:grid-cols-[2fr,1.6fr]">
        {/* LEFT: Manage Users */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e5ecff]">
                <Users className="h-5 w-5 text-[#2563eb]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Manage Users
                </h2>
                <p className="text-sm text-slate-500">
                  Add, edit or remove accounts in your organization.
                </p>
              </div>
            </div>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="
                    h-10 rounded-xl
                    bg-[#2563eb]
                    text-sm font-medium text-white
                    hover:bg-[#1d4ed8]
                    transition-colors hover-lift
                  "
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-lg">
                    Add New User
                  </DialogTitle>
                  <DialogDescription className="text-sm">
                    Create a new user account and assign a role.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="new-name">Full Name</Label>
                    <Input
                      id="new-name"
                      placeholder="Enter full name"
                      value={newUser.name}
                      onChange={(e) =>
                        setNewUser({ ...newUser, name: e.target.value })
                      }
                      className="h-10 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="new-email">Email</Label>
                    <Input
                      id="new-email"
                      type="email"
                      placeholder="user@example.com"
                      value={newUser.email}
                      onChange={(e) =>
                        setNewUser({ ...newUser, email: e.target.value })
                      }
                      className="h-10 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="new-role">Role</Label>
                    <Select
                      value={newUser.role}
                      onValueChange={(value) =>
                        setNewUser({ ...newUser, role: value })
                      }
                    >
                      <SelectTrigger className="h-10 rounded-xl">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consumer">
                          Consumer
                        </SelectItem>
                        <SelectItem value="helpdesk">
                          Help Desk Agent
                        </SelectItem>
                        <SelectItem value="support">
                          Support Engineer
                        </SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddUser}
                    className="
                      rounded-xl
                      bg-[#2563eb]
                      text-sm font-medium text-white
                      hover:bg-[#1d4ed8]
                    "
                  >
                    Add User
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* User list */}
          {users.length === 0 ? (
            <Card className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 py-10 text-center text-sm text-slate-500">
              No users added yet. Click{" "}
              <span className="font-medium text-[#2563eb]">“Add User”</span> to
              create the first account.
            </Card>
          ) : (
            <div className="grid gap-4">
              {users.map((u) => (
                <Card
                  key={u.id}
                  className="
                    rounded-2xl border border-slate-100 bg-white
                    shadow-[0_12px_40px_rgba(15,23,42,0.08)]
                    transition-transform duration-200
                    hover:scale-[1.01] hover:shadow-[0_18px_60px_rgba(15,23,42,0.12)]
                  "
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <CardTitle className="text-base font-semibold text-slate-900">
                          {u.name}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {u.email}
                        </CardDescription>
                        <p className="text-xs text-slate-400">
                          {u.organization}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getRoleBadge(u.role)}
                        <Button
                          variant="outline"
                          size="icon"
                          className="hover-grow h-8 w-8 rounded-full border-slate-200"
                          onClick={() => {
                            setSelectedUser(u);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="hover-grow h-8 w-8 rounded-full border-slate-200 text-rose-500"
                          onClick={() => handleDeleteUser(u.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <span className="text-xs text-slate-400">
                      Joined: {u.createdAt.toLocaleDateString()}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Edit user dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-lg">Edit User</DialogTitle>
                <DialogDescription className="text-sm">
                  Update user details and role.
                </DialogDescription>
              </DialogHeader>
              {selectedUser && (
                <div className="space-y-4 py-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-name">Full Name</Label>
                    <Input
                      id="edit-name"
                      className="h-10 rounded-xl"
                      value={selectedUser.name}
                      onChange={(e) =>
                        setSelectedUser({
                          ...selectedUser,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      className="h-10 rounded-xl"
                      value={selectedUser.email}
                      onChange={(e) =>
                        setSelectedUser({
                          ...selectedUser,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-role">Role</Label>
                    <Select
                      value={selectedUser.role}
                      onValueChange={(value) =>
                        setSelectedUser({ ...selectedUser, role: value })
                      }
                    >
                      <SelectTrigger className="h-10 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consumer">
                          Consumer
                        </SelectItem>
                        <SelectItem value="helpdesk">
                          Help Desk Agent
                        </SelectItem>
                        <SelectItem value="support">
                          Support Engineer
                        </SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateUser}
                  className="
                    rounded-xl
                    bg-[#2563eb]
                    text-sm font-medium text-white
                    hover:bg-[#1d4ed8]
                  "
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </section>

        {/* RIGHT: Manage Permissions */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e5ecff]">
              <Settings2 className="h-5 w-5 text-[#2563eb]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Manage Permissions
              </h2>
              <p className="text-sm text-slate-500">
                Configure which actions each role is allowed to perform.
              </p>
            </div>
          </div>

          <ManagePermissionsContent />
        </section>
      </div>
    </DashboardLayout>
  );
};

/* ---------- Permissions content stays mostly the same, just tiny visual tweaks ---------- */

const ManagePermissionsContent = () => {
  const permissions = [
    {
      id: "log_complaint",
      label: "Log Complaint",
      description: "Submit new complaints to the system.",
    },
    {
      id: "view_complaints",
      label: "View Complaints",
      description: "Access complaint records and history.",
    },
    {
      id: "change_status",
      label: "Change Status",
      description: "Update complaint status (resolved, pending, etc.).",
    },
    {
      id: "manage_users",
      label: "Manage Users",
      description: "Add, edit, or remove user accounts.",
    },
    {
      id: "manage_permissions",
      label: "Manage Permissions",
      description: "Configure role-based access controls.",
    },
    {
      id: "view_analytics",
      label: "View Analytics",
      description: "Access reports and analytics dashboards.",
    },
  ];

  const roles = [
    {
      role: "consumer",
      label: "Consumer",
      defaultPermissions: {
        log_complaint: true,
        view_complaints: true,
        change_status: false,
        manage_users: false,
        manage_permissions: false,
        view_analytics: false,
      },
    },
    {
      role: "helpdesk",
      label: "Help Desk Agent",
      defaultPermissions: {
        log_complaint: true,
        view_complaints: true,
        change_status: true,
        manage_users: false,
        manage_permissions: false,
        view_analytics: true,
      },
    },
    {
      role: "support",
      label: "Support Engineer",
      defaultPermissions: {
        log_complaint: true,
        view_complaints: true,
        change_status: true,
        manage_users: false,
        manage_permissions: false,
        view_analytics: true,
      },
    },
    {
      role: "admin",
      label: "Administrator",
      defaultPermissions: {
        log_complaint: true,
        view_complaints: true,
        change_status: true,
        manage_users: true,
        manage_permissions: true,
        view_analytics: true,
      },
    },
  ];

  const [rolePermissions, setRolePermissions] = useState(
    roles.reduce((acc, role) => {
      acc[role.role] = role.defaultPermissions;
      return acc;
    }, {})
  );

  const handlePermissionChange = (role, permissionId, checked) => {
    setRolePermissions((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [permissionId]: checked,
      },
    }));
  };

  const handleSavePermissions = () => {
    toast.success("Permissions updated successfully!");
  };

  return (
    <div className="space-y-4">
      {roles.map((role) => (
        <Card
          key={role.role}
          className="
            rounded-2xl border border-slate-100 bg-white
            shadow-[0_12px_40px_rgba(15,23,42,0.06)]
          "
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-900">
              {role.label}
            </CardTitle>
            <CardDescription className="text-sm text-slate-500">
              Configure permissions for the {role.label.toLowerCase()} role.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid gap-3 md:grid-cols-2">
              {permissions.map((permission) => (
                <div
                  key={permission.id}
                  className="flex items-start space-x-3 rounded-xl bg-slate-50/60 p-3"
                >
                  <input
                    type="checkbox"
                    id={`${role.role}-${permission.id}`}
                    checked={
                      rolePermissions[role.role]?.[permission.id] || false
                    }
                    onChange={(e) =>
                      handlePermissionChange(
                        role.role,
                        permission.id,
                        e.target.checked
                      )
                    }
                    className="mt-1 h-4 w-4 rounded border-slate-300"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={`${role.role}-${permission.id}`}
                      className="text-sm font-medium leading-none cursor-pointer text-slate-900"
                    >
                      {permission.label}
                    </label>
                    <p className="mt-1 text-xs text-slate-500">
                      {permission.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end">
        <Button
          onClick={handleSavePermissions}
          className="
            rounded-xl
            bg-[#2563eb]
            text-sm font-medium text-white
            hover:bg-[#1d4ed8]
            hover-lift
          "
        >
          Save Permissions
        </Button>
      </div>
    </div>
  );
};

export default AdminDashboard;
