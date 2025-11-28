import { DashboardLayout } from '../components/DashboardLayout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { useState } from 'react';
import { toast } from 'sonner';
import { UserPlus, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../context/authContext';
import {db,} from "../firebase";

const mockUsers = [
  {
    id: '1',
    email: 'john@bank.com',
    name: 'John Doe',
    role: 'consumer',
    organization: 'bank',
    createdAt: new Date('2024-01-01')
  },
  {
    id: '2',
    email: 'agent@bank.com',
    name: 'Jane Smith',
    role: 'helpdesk',
    organization: 'bank',
    createdAt: new Date('2024-01-05')
  },
  {
    id: '3',
    email: 'support@airline.com',
    name: 'Bob Johnson',
    role: 'support',
    organization: 'airline',
    createdAt: new Date('2024-01-10')
  },
  {
    id: '4',
    email: 'admin@telecom.com',
    name: 'Alice Williams',
    role: 'admin',
    organization: 'telecom',
    createdAt: new Date('2024-01-15')
  }
];

const AdminDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState(mockUsers);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    role: 'consumer',
    organization: user?.organization || 'bank'
  });

  const handleAddUser = () => {
    if (!newUser.email || !newUser.name) {
      toast.error('Please fill in all fields');
      return;
    }

    const userToAdd = {
      id: Date.now().toString(),
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      organization: user?.organization || 'bank',
      createdAt: new Date()
    };

    setUsers([...users, userToAdd]);
    toast.success('User added successfully!');
    setIsAddDialogOpen(false);
    setNewUser({
      email: '',
      name: '',
      role: 'consumer',
      organization: user?.organization || 'bank'
    });
  };

  const handleUpdateUser = () => {
    if (!selectedUser) return;

    setUsers(users.map((u) => (u.id === selectedUser.id ? selectedUser : u)));
    toast.success('User updated successfully!');
    setIsEditDialogOpen(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = (id) => {
    setUsers(users.filter((u) => u.id !== id));
    toast.success('User deleted successfully!');
  };

  const getRoleBadge = (role) => {
    const colors = {
      consumer: 'bg-[#e5ecff] text-[#2563eb]',
      helpdesk: 'bg-emerald-50 text-emerald-700',
      support: 'bg-amber-50 text-amber-700',
      admin: 'bg-rose-50 text-rose-700'
    };

    return (
      <Badge
        className={`rounded-full px-3 py-1 text-xs font-medium border-0 ${
          colors[role] || 'bg-slate-100 text-slate-700'
        }`}
      >
        {role}
      </Badge>
    );
  };

  return (
    <DashboardLayout title="Administration">
      <div className="space-y-8 min-h-screen bg-[#f5f7fb] p-6 md:p-8">
        {/* Manage Users Section */}
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Manage Users</h2>
              <p className="text-sm text-slate-500">
                Add, edit, or remove users from your organization
              </p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                <Button className="hover-lift bg-[#2563eb] text-white hover:bg-[#1d4ed8] rounded-xl">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent
                className="
                  rounded-2xl
                  shadow-[0_24px_80px_rgba(15,23,42,0.12)]
                  transition-transform duration-300
                  hover:scale-[1.01] hover:shadow-[0_28px_90px_rgba(15,23,42,0.14)]
                "
              >
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                  <DialogDescription>
                    Create a new user account with specific role permissions
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-name">Full Name</Label>
                    <Input
                      id="new-name"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-email">Email</Label>
                    <Input
                      id="new-email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-role">Role</Label>

                    {/* SELECT – styled like login input */}
                    <Select
                      value={newUser.role}
                      onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                    >
                      <SelectTrigger
                        className="
                          h-11 rounded-xl border border-slate-200
                          bg-slate-50 text-sm text-slate-700
                          focus:bg-white
                        "
                      >
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent
                        className="
                          rounded-xl border border-slate-200
                          bg-white text-slate-700
                          shadow-lg
                        "
                      >
                        <SelectItem
                          value="consumer"
                          className="cursor-pointer text-sm hover:bg-[#e5ecff]"
                        >
                          Consumer
                        </SelectItem>
                        <SelectItem
                          value="helpdesk"
                          className="cursor-pointer text-sm hover:bg-[#e5ecff]"
                        >
                          Help Desk Agent
                        </SelectItem>
                        <SelectItem
                          value="support"
                          className="cursor-pointer text-sm hover:bg-[#e5ecff]"
                        >
                          Support Engineer
                        </SelectItem>
                        <SelectItem
                          value="admin"
                          className="cursor-pointer text-sm hover:bg-[#e5ecff]"
                        >
                          Admin
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="rounded-md">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddUser}
                    className="bg-[#2563eb] text-white hover:bg-[#1d4ed8] rounded-xl"
                  >
                    Add User
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {users.map((user) => (
              <Card
                key={user.id}
                className="
                  bg-white border border-slate-100 rounded-[28px]
                  shadow-[0_24px_80px_rgba(15,23,42,0.12)]
                  transition-transform duration-300
                  hover:scale-[1.02] hover:shadow-[0_28px_90px_rgba(15,23,42,0.14)]
                "
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-slate-900">
                        {user.name}
                      </CardTitle>
                      <CardDescription className="text-slate-500">
                        {user.email}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getRoleBadge(user.role)}
                      <Button
                        variant="outline"
                        size="icon"
                        className="hover-grow rounded-full"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="hover-grow text-rose-500 rounded-full"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <span className="text-xs text-slate-400">
                    Joined: {user.createdAt.toLocaleDateString()}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent
              className="
                rounded-2xl
                shadow-[0_24px_80px_rgba(15,23,42,0.12)]
                transition-transform duration-300
                hover:scale-[1.01] hover:shadow-[0_28px_90px_rgba(15,23,42,0.14)]
              "
            >
              <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
                <DialogDescription>
                  Update user details and permissions
                </DialogDescription>
              </DialogHeader>
              {selectedUser && (
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Full Name</Label>
                    <Input
                      id="edit-name"
                      value={selectedUser.name}
                      onChange={(e) =>
                        setSelectedUser({ ...selectedUser, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={selectedUser.email}
                      onChange={(e) =>
                        setSelectedUser({ ...selectedUser, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-role">Role</Label>

                    {/* EDIT SELECT – same styling */}
                    <Select
                      value={selectedUser.role}
                      onValueChange={(value) =>
                        setSelectedUser({ ...selectedUser, role: value })
                      }
                    >
                      <SelectTrigger
                        className="
                          h-11 rounded-xl border border-slate-200
                          bg-slate-50 text-sm text-slate-700
                          focus:bg-white
                        "
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent
                        className="
                          rounded-xl border border-slate-200
                          bg-white text-slate-700
                          shadow-lg
                        "
                      >
                        <SelectItem
                          value="consumer"
                          className="cursor-pointer text-sm hover:bg-[#e5ecff]"
                        >
                          Consumer
                        </SelectItem>
                        <SelectItem
                          value="helpdesk"
                          className="cursor-pointer text-sm hover:bg-[#e5ecff]"
                        >
                          Help Desk Agent
                        </SelectItem>
                        <SelectItem
                          value="support"
                          className="cursor-pointer text-sm hover:bg-[#e5ecff]"
                        >
                          Support Engineer
                        </SelectItem>
                        <SelectItem
                          value="admin"
                          className="cursor-pointer text-sm hover:bg-[#e5ecff]"
                        >
                          Admin
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="rounded-md">
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateUser}
                  className="bg-[#2563eb] text-white hover:bg-[#1d4ed8] rounded-xl"
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </section>

        {/* Manage Permissions Section */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Manage Permissions</h2>
            <p className="text-sm text-slate-500">
              Configure role-based permissions and access controls
            </p>
          </div>

          <ManagePermissionsContent />
        </section>
      </div>
    </DashboardLayout>
  );
};

const ManagePermissionsContent = () => {
  const permissions = [
    { id: 'log_complaint', label: 'Log Complaint', description: 'Submit new complaints to the system' },
    { id: 'view_complaints', label: 'View Complaints', description: 'Access complaint records and history' },
    { id: 'change_status', label: 'Change Status', description: 'Update complaint status (resolved, pending, etc.)' },
    { id: 'manage_users', label: 'Manage Users', description: 'Add, edit, or remove user accounts' },
    { id: 'manage_permissions', label: 'Manage Permissions', description: 'Configure role-based access controls' },
    { id: 'view_analytics', label: 'View Analytics', description: 'Access reports and analytics dashboards' }
  ];

  const roles = [
    {
      role: 'consumer',
      label: 'Consumer',
      defaultPermissions: {
        log_complaint: true,
        view_complaints: true,
        change_status: false,
        manage_users: false,
        manage_permissions: false,
        view_analytics: false
      }
    },
    {
      role: 'helpdesk',
      label: 'Help Desk Agent',
      defaultPermissions: {
        log_complaint: true,
        view_complaints: true,
        change_status: true,
        manage_users: false,
        manage_permissions: false,
        view_analytics: true
      }
    },
    {
      role: 'support',
      label: 'Support Engineer',
      defaultPermissions: {
        log_complaint: true,
        view_complaints: true,
        change_status: true,
        manage_users: false,
        manage_permissions: false,
        view_analytics: true
      }
    },
    {
      role: 'admin',
      label: 'Administrator',
      defaultPermissions: {
        log_complaint: true,
        view_complaints: true,
        change_status: true,
        manage_users: true,
        manage_permissions: true,
        view_analytics: true
      }
    }
  ];

  const [rolePermissions, setRolePermissions] = useState(
    roles.reduce((acc, role) => {
      acc[role.role] = role.defaultPermissions;
      return acc;
    }, {})
  );

  const handlePermissionChange = (role, permissionId, checked) => {
    setRolePermissions({
      ...rolePermissions,
      [role]: {
        ...rolePermissions[role],
        [permissionId]: checked
      }
    });
  };

  const handleSavePermissions = () => {
    toast.success('Permissions updated successfully!');
  };

  return (
    <div className="space-y-4">
      {roles.map((role) => (
        <Card
          key={role.role}
          className="
            bg-white border border-slate-100 rounded-[28px]
            shadow-[0_24px_80px_rgba(15,23,42,0.12)]
            transition-transform duration-300
            hover:scale-[1.02] hover:shadow-[0_28px_90px_rgba(15,23,42,0.14)]
          "
        >
          <CardHeader>
            <CardTitle className="text-slate-900">{role.label}</CardTitle>
            <CardDescription className="text-slate-500">
              Configure permissions for {role.label.toLowerCase()} role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {permissions.map((permission) => (
                <div
                  key={permission.id}
                  className="flex items-start space-x-3 rounded-xl bg-[#f5f7fb] p-3"
                >
                  <input
                    type="checkbox"
                    id={`${role.role}-${permission.id}`}
                    checked={rolePermissions[role.role]?.[permission.id] || false}
                    onChange={(e) =>
                      handlePermissionChange(role.role, permission.id, e.target.checked)
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
                    <p className="text-xs text-slate-500 mt-1">
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
          className="hover-lift bg-[#2563eb] text-white hover:bg-[#1d4ed8] rounded-xl"
        >
          Save Permissions
        </Button>
      </div>
    </div>
  );
};

export default AdminDashboard;
