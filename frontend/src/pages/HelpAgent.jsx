// src/pages/AgentDashboard.jsx
import { useMemo, useState } from "react";

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
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { toast } from "sonner";
import {
  Search,
  CheckCircle,
  Clock,
  FileText,
  Upload,
  PhoneCall,
} from "lucide-react";

// ----- mock data (for now) -----
const categories = [
  { id: "technical", name: "Technical Issue", icon: "⚙️" },
  { id: "billing", name: "Billing", icon: "💰" },
  { id: "service", name: "Service Quality", icon: "📊" },
  { id: "account", name: "Account Access", icon: "🔐" },
];

const initialComplaints = [
  {
    id: "C001",
    category: "technical",
    description: "Unable to login to my account",
    status: "pending",
    createdBy: "User 1",
    channel: "online",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "C002",
    category: "billing",
    description: "Incorrect charge on my statement",
    status: "in-progress",
    createdBy: "User 2",
    channel: "phone",
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20"),
  },
  {
    id: "C003",
    category: "service",
    description: "Poor network coverage in my area",
    status: "resolved",
    createdBy: "User 3",
    channel: "online",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-12"),
    resolvedBy: "Agent Smith",
    resolvedAt: new Date("2024-01-12"),
  },
];

const AgentDashboard = () => {
  // ---------- state ----------
  const [complaints, setComplaints] = useState(initialComplaints);
  const [searchId, setSearchId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [consumerEmail, setConsumerEmail] = useState("");
  const [description, setDescription] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);

  // ---------- helpers ----------
  const statusCounts = useMemo(
    () => ({
      pending: complaints.filter((c) => c.status === "pending").length,
      "in-progress": complaints.filter((c) => c.status === "in-progress").length,
      resolved: complaints.filter((c) => c.status === "resolved").length,
    }),
    [complaints]
  );

  const handleStatusChange = (id, newStatus) => {
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: newStatus,
              updatedAt: new Date(),
              ...(newStatus === "resolved" && {
                resolvedBy: "Current Agent",
                resolvedAt: new Date(),
              }),
            }
          : c
      )
    );
    toast.success(`Complaint ${id} status updated to ${newStatus}`);
  };

  const handleSearch = () => {
    if (!searchId.trim()) {
      toast.error("Please enter a complaint ID");
      return;
    }
    const found = complaints.find((c) =>
      c.id.toLowerCase().includes(searchId.toLowerCase())
    );
    if (found) {
      toast.success(`Found complaint: ${found.id}`);
    } else {
      toast.error("Complaint not found");
    }
  };

  const handleSubmitComplaint = (e) => {
    e.preventDefault();

    if (!consumerEmail.trim() || !selectedCategory || !description.trim()) {
      toast.error("Please fill in customer email, category and description");
      return;
    }

    const newComplaint = {
      id: `C${String(complaints.length + 1).padStart(3, "0")}`,
      category: selectedCategory,
      description: description.trim(),
      status: "pending",
      createdBy: consumerEmail.trim(),
      channel: "phone",
      createdAt: new Date(),
      updatedAt: new Date(),
      attachmentUrl: attachment ? URL.createObjectURL(attachment) : undefined,
    };

    setComplaints((prev) => [newComplaint, ...prev]);
    toast.success("Complaint logged successfully!");

    setConsumerEmail("");
    setSelectedCategory("");
    setDescription("");
    setAttachment(null);
    setIsLogDialogOpen(false);
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: {
        classes:
          "bg-amber-100 text-amber-900 border border-amber-200 rounded-full",
        icon: Clock,
        label: "pending",
      },
      "in-progress": {
        classes:
          "bg-sky-100 text-sky-900 border border-sky-200 rounded-full",
        icon: FileText,
        label: "in progress",
      },
      resolved: {
        classes:
          "bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-full",
        icon: CheckCircle,
        label: "resolved",
      },
    };
    const variant = variants[status] || variants.pending;
    const Icon = variant.icon;

    return (
      <Badge className={`flex items-center gap-1 px-3 py-1 text-xs ${variant.classes}`}>
        <Icon className="h-3 w-3" />
        {variant.label}
      </Badge>
    );
  };

  // ---------- UI ----------
  return (
    <DashboardLayout title="Helpdesk Agent Dashboard">
      <div className="bg-gray-50 min-h-screen p-6 md:p-8 space-y-6">
        {/* Stats row, matching ConsumerDashboard style */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Complaints
              </CardTitle>
              <FileText className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {complaints.length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Pending
              </CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {statusCounts.pending}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                In Progress
              </CardTitle>
              <FileText className="h-4 w-4 text-sky-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-sky-600">
                {statusCounts["in-progress"]}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Resolved
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {statusCounts.resolved}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for manage / stats */}
        <Tabs defaultValue="manage" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <TabsList>
              <TabsTrigger value="manage">Manage Complaints</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>

            {/* Log phone complaint dialog – styled similar to consumer modal */}
            <Dialog open={isLogDialogOpen} onOpenChange={setIsLogDialogOpen}>
              <DialogTrigger asChild>
                <Button className="hover-lift bg-blue-600 hover:bg-blue-700 text-white rounded-full px-5">
                  <PhoneCall className="mr-2 h-4 w-4" />
                  Log Phone Complaint
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-xl sm:max-w-2xl p-0 border-none bg-transparent">
                <div className="bg-white rounded-3xl shadow-2xl max-h-[80vh] flex flex-col overflow-hidden">
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-600/10 via-blue-500/5 to-transparent">
                    <DialogHeader className="space-y-1">
                      <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
                          <PhoneCall className="h-4 w-4" />
                        </span>
                        Log Complaint from Call
                      </DialogTitle>
                      <DialogDescription className="text-sm text-gray-500">
                        Capture the customer’s details and issue while you are
                        on the call.
                      </DialogDescription>
                    </DialogHeader>
                  </div>

                  {/* Body */}
                  <form
                    onSubmit={handleSubmitComplaint}
                    className="flex-1 overflow-y-auto px-6 pb-4 pt-4 space-y-5"
                  >
                    {/* Customer email */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="consumerEmail"
                        className="text-sm font-medium text-gray-800"
                      >
                        Customer Email
                      </Label>
                      <Input
                        id="consumerEmail"
                        type="email"
                        placeholder="customer@example.com"
                        value={consumerEmail}
                        onChange={(e) => setConsumerEmail(e.target.value)}
                        className="bg-gray-50 border-gray-200 focus:bg-white"
                      />
                    </div>

                    {/* Category */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-800">
                        Category
                      </Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {categories.map((category) => {
                          const isSelected = selectedCategory === category.id;
                          return (
                            <button
                              key={category.id}
                              type="button"
                              onClick={() =>
                                setSelectedCategory(category.id)
                              }
                              className={[
                                "group flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 text-center transition-all hover-lift bg-white",
                                isSelected
                                  ? "border-blue-500/80 bg-blue-50/80 shadow-sm"
                                  : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/40",
                              ].join(" ")}
                            >
                              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-xl">
                                {category.icon}
                              </span>
                              <span className="font-medium text-sm text-gray-900">
                                {category.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="description"
                        className="text-sm font-medium text-gray-800"
                      >
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Describe the customer’s issue in detail..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="bg-gray-50 border-gray-200 focus:bg-white"
                      />
                    </div>

                    {/* Attachment */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="attachment"
                        className="text-sm font-medium text-gray-800"
                      >
                        Attachment{" "}
                        <span className="text-gray-400 text-xs">
                          (optional)
                        </span>
                      </Label>
                      <label
                        htmlFor="attachment"
                        className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600 hover:border-blue-400 hover:bg-blue-50/40 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white border border-gray-200">
                            <Upload className="h-4 w-4 text-blue-600" />
                          </span>
                          <span className="font-medium">
                            {attachment ? attachment.name : "Choose a file"}
                          </span>
                        </div>
                      </label>
                      <Input
                        id="attachment"
                        type="file"
                        onChange={(e) =>
                          setAttachment(e.target.files?.[0] || null)
                        }
                        className="hidden"
                      />
                    </div>

                    {/* Footer */}
                    <DialogFooter className="pt-2 border-t border-gray-100 flex-shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full border-gray-300"
                        onClick={() => setIsLogDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="hover-lift rounded-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Log Complaint
                      </Button>
                    </DialogFooter>
                  </form>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Manage tab */}
          <TabsContent value="manage" className="space-y-6">
            {/* Search */}
            <Card className="bg-white border border-gray-200 rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-gray-900">
                  Search Complaint
                </CardTitle>
                <CardDescription className="text-gray-500">
                  Search by complaint ID (e.g. C001)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-2">
                  <Input
                    placeholder="Enter Complaint ID"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                  />
                  <Button
                    onClick={handleSearch}
                    className="hover-lift bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Complaints list */}
            <Card className="bg-white border border-gray-200 rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  All Complaints
                </CardTitle>
                <CardDescription className="text-gray-500">
                  Manage and update complaint statuses
                </CardDescription>
              </CardHeader>
              <CardContent>
                {complaints.length === 0 ? (
                  <p className="text-sm text-gray-500">No complaints yet.</p>
                ) : (
                  <div className="space-y-4">
                    {complaints.map((complaint) => (
                      <div
                        key={complaint.id}
                        className="p-4 bg-white border border-gray-200 rounded-2xl hover:border-blue-400 transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-semibold text-lg text-gray-900">
                              {complaint.id}
                            </div>
                            <div className="text-xs text-gray-400 mb-1">
                              By: {complaint.createdBy} · Channel:{" "}
                              {complaint.channel}
                            </div>
                            <div className="text-sm text-gray-700">
                              {complaint.description}
                            </div>
                          </div>
                          {getStatusBadge(complaint.status)}
                        </div>

                        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                          <span>
                            Created:{" "}
                            {complaint.createdAt.toLocaleDateString()}
                          </span>
                          <div className="flex gap-2">
                            {complaint.status !== "in-progress" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleStatusChange(
                                    complaint.id,
                                    "in-progress"
                                  )
                                }
                                className="hover-lift"
                              >
                                Mark In Progress
                              </Button>
                            )}
                            {complaint.status !== "resolved" && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleStatusChange(
                                    complaint.id,
                                    "resolved"
                                  )
                                }
                                className="hover-lift bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                Mark Resolved
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stats tab */}
          <TabsContent value="stats" className="space-y-6">
            <Card className="bg-white border border-gray-200 rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Status Overview
                </CardTitle>
                <CardDescription className="text-gray-500">
                  Quick view of complaint distribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                    <div className="text-xs font-medium text-amber-700">
                      Pending
                    </div>
                    <div className="text-2xl font-bold text-amber-700">
                      {statusCounts.pending}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-sky-50 border border-sky-100">
                    <div className="text-xs font-medium text-sky-700">
                      In Progress
                    </div>
                    <div className="text-2xl font-bold text-sky-700">
                      {statusCounts["in-progress"]}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                    <div className="text-xs font-medium text-emerald-700">
                      Resolved
                    </div>
                    <div className="text-2xl font-bold text-emerald-700">
                      {statusCounts.resolved}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AgentDashboard;
