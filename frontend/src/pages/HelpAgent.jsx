// src/pages/AgentDashboard.jsx
import { useEffect, useMemo, useRef, useState } from "react";
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
import { Tabs, TabsContent } from "../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

import { toast } from "sonner";
import {
  Upload,
  FileText,
  CheckCircle,
  Clock,
  Search,
  PhoneCall,
  Wrench,
  UserPlus,
} from "lucide-react";
import { useAuth } from "../context/authContext";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const AgentDashboard = () => {
  const { user, getIdToken } = useAuth();

  const [categories, setCategories] = useState([]);
  const [complaints, setComplaints] = useState([]);

  // agent-specific
  const [searchId, setSearchId] = useState("");
  const [highlightId, setHighlightId] = useState(null);
  const complaintRefs = useRef({});

  // log complaint modal fields
  const [consumerEmail, setConsumerEmail] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [title, setTitle] = useState(""); // optional
  const [description, setDescription] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);

  // click complaint -> manage modal
  const [activeComplaint, setActiveComplaint] = useState(null);
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);

  // manage modal fields
  const [solutionText, setSolutionText] = useState("");
  const [supportEmail, setSupportEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingSolution, setIsSavingSolution] = useState(false);
  const [isAssigningSupport, setIsAssigningSupport] = useState(false);

  const withAuthFetch = async (path, options = {}) => {
    const token = await getIdToken();

    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Request failed: ${res.status}`);
    }

    return res.json();
  };

  const toDate = (value) => {
    if (!value) return null;
    if (typeof value.toDate === "function") return value.toDate();
    if (value._seconds) return new Date(value._seconds * 1000);
    return new Date(value);
  };

  const getCategoryName = (categoryId) =>
    categories.find((c) => c.id === categoryId)?.name || "Unknown";

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setLoadError("User not logged in");
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        setLoadError(null);

        const [fetchedCategories, fetchedComplaints] = await Promise.all([
          withAuthFetch("/api/categories"),
          withAuthFetch("/api/complaints/all"),
        ]);

        setCategories(
          fetchedCategories.map((c) => ({
            id: c.id,
            name: c.title,
            icon: "📌",
          }))
        );

        setComplaints(fetchedComplaints);
      } catch (err) {
        console.error(err);
        setLoadError(err.message);
        toast.error(`Failed to load data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // stats
  const totalComplaints = complaints.length;
  const resolvedComplaints = complaints.filter((c) => c.status === "resolved").length;
  const pendingComplaints = complaints.filter((c) => c.status === "pending").length;
  const inProgressComplaints = complaints.filter((c) => c.status === "in-progress").length;

  const sortedComplaints = useMemo(() => {
    const copy = [...complaints];
    copy.sort((a, b) => {
      const da = toDate(a.createdAt)?.getTime() || 0;
      const db = toDate(b.createdAt)?.getTime() || 0;
      return db - da;
    });
    return copy;
  }, [complaints]);

  const getStatusBadge = (status) => {
    const variants = {
      pending: {
        classes: "bg-amber-100 text-amber-900 border border-amber-200",
        icon: Clock,
        label: "pending",
      },
      "in-progress": {
        classes: "bg-sky-100 text-sky-900 border border-sky-200",
        icon: FileText,
        label: "in-progress",
      },
      resolved: {
        classes: "bg-emerald-100 text-emerald-900 border border-emerald-200",
        icon: CheckCircle,
        label: "resolved",
      },
    };

    const variant = variants[status] || variants.pending;
    const Icon = variant.icon;

    return (
      <Badge
        className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${variant.classes}`}
      >
        <Icon className="h-3 w-3" />
        {variant.label}
      </Badge>
    );
  };

  // Log complaint (agent)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!consumerEmail.trim() || !selectedCategory || !description.trim()) {
      toast.error("Please fill in customer email, category and description");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        consumer_email: consumerEmail.trim(),
        title: title.trim(),
        category_id: selectedCategory,
        description: description.trim(),
        attachment: null,
      };

      const res = await withAuthFetch("/api/complaints/agent", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const newComplaint = {
        id: res.id,
        status: "pending",
        createdAt: new Date(),
        ...payload,
      };

      setComplaints((prev) => [newComplaint, ...prev]);
      toast.success("Complaint logged successfully!");

      setConsumerEmail("");
      setSelectedCategory("");
      setTitle("");
      setDescription("");
      setAttachment(null);
      setIsLogDialogOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(`Failed to log complaint: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      await withAuthFetch(`/api/complaints/${complaintId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });

      setComplaints((prev) =>
        prev.map((c) =>
          c.id === complaintId
            ? { ...c, status: newStatus, updatedAt: new Date() }
            : c
        )
      );

      toast.success(`Complaint ${complaintId} updated to ${newStatus}`);
    } catch (err) {
      console.error(err);
      toast.error(`Failed to update status: ${err.message}`);
    }
  };

  const handleSearch = () => {
    const q = searchId.trim();
    if (!q) {
      toast.error("Please enter a complaint ID");
      return;
    }

    const found = sortedComplaints.find(
      (c) => String(c.id).toLowerCase() === q.toLowerCase()
    );

    if (!found) {
      toast.error("Complaint not found");
      return;
    }

    toast.success(`Found complaint: ${found.id}`);
    setHighlightId(found.id);

    setTimeout(() => {
      const el = complaintRefs.current[found.id];
      if (el?.scrollIntoView) el.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => setHighlightId(null), 1600);
    }, 50);
  };

  // ✅ open manage modal when clicking a complaint
  const openManageComplaint = (complaint) => {
    setActiveComplaint(complaint);
    setSolutionText(complaint?.solution?.text || "");
    setSupportEmail(complaint?.support?.email || "");
    setIsManageDialogOpen(true);
  };

  // ✅ save solution
  const handleSaveSolution = async () => {
    if (!activeComplaint?.id) return;
    if (!solutionText.trim()) {
      toast.error("Please enter a solution");
      return;
    }

    try {
      setIsSavingSolution(true);

      const payload = {
        solution_text: solutionText.trim(),
        // helpful display info for consumer dashboard
        agent: {
          uid: user?.uid || "",
          email: (user?.email || "").toLowerCase(),
          name: user?.displayName || user?.email || "Agent",
        },
      };

      await withAuthFetch(`/api/complaints/${activeComplaint.id}/solution`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      // optimistic update
      setComplaints((prev) =>
        prev.map((c) =>
          c.id === activeComplaint.id
            ? {
                ...c,
                solution: {
                  text: payload.solution_text,
                  agent: payload.agent,
                  addedAt: new Date(),
                },
                status: "resolved", // optional: auto resolve when solution added
                resolvedAt: new Date(),
                updatedAt: new Date(),
              }
            : c
        )
      );

      toast.success("Solution added");
      setIsManageDialogOpen(false);
      setActiveComplaint(null);
    } catch (err) {
      console.error(err);
      toast.error(`Failed to add solution: ${err.message}`);
    } finally {
      setIsSavingSolution(false);
    }
  };

  // ✅ assign support
  const handleAssignSupport = async () => {
    if (!activeComplaint?.id) return;
    if (!supportEmail.trim()) {
      toast.error("Please enter support email");
      return;
    }

    try {
      setIsAssigningSupport(true);

      const payload = { support_email: supportEmail.trim() };

      await withAuthFetch(`/api/complaints/${activeComplaint.id}/assign`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      // optimistic update
      setComplaints((prev) =>
        prev.map((c) =>
          c.id === activeComplaint.id
            ? {
                ...c,
                support: {
                  ...(c.support || {}),
                  email: payload.support_email.toLowerCase(),
                  assignedAt: new Date(),
                  assignedBy_uid: user?.uid || "",
                },
                status: "in-progress",
                updatedAt: new Date(),
              }
            : c
        )
      );

      toast.success("Support assigned");
      setIsManageDialogOpen(false);
      setActiveComplaint(null);
    } catch (err) {
      console.error(err);
      toast.error(`Failed to assign support: ${err.message}`);
    } finally {
      setIsAssigningSupport(false);
    }
  };

  return (
    <DashboardLayout title="Helpdesk Agent Dashboard">
      <div className="bg-gray-50 min-h-screen p-6 md:p-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Complaints
              </CardTitle>
              <FileText className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{totalComplaints}</div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{resolvedComplaints}</div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Pending</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{pendingComplaints}</div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">In Progress</CardTitle>
              <FileText className="h-4 w-4 text-sky-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-sky-600">{inProgressComplaints}</div>
            </CardContent>
          </Card>
        </div>

        {/* Top row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Log Complaint Button + Modal */}
          <Dialog open={isLogDialogOpen} onOpenChange={setIsLogDialogOpen}>
            <DialogTrigger asChild>
              <Button className="hover-lift bg-blue-600 hover:bg-blue-700 text-white rounded-full px-5">
                Log Complaint
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-xl sm:max-w-2xl p-0 border-none bg-transparent">
              <div className="bg-white rounded-3xl shadow-2xl max-h-[80vh] flex flex-col overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-600/10 via-blue-500/5 to-transparent">
                  <DialogHeader className="space-y-1">
                    <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
                        <PhoneCall className="h-4 w-4" />
                      </span>
                      Log a Complaint (Call)
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-500">
                      Enter the customer email, choose category and describe the issue.
                    </DialogDescription>
                  </DialogHeader>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="flex-1 overflow-y-auto px-6 pb-4 pt-4 space-y-5"
                >
                  <div className="space-y-2">
                    <Label htmlFor="consumerEmail" className="text-sm font-medium text-gray-800">
                      Customer Email
                    </Label>
                    <Input
                      id="consumerEmail"
                      type="email"
                      placeholder="customer@example.com"
                      value={consumerEmail}
                      onChange={(e) => setConsumerEmail(e.target.value)}
                      className="bg-gray-50 border-gray-200 focus:bg-white text-gray-900"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium text-gray-800">
                      Title <span className="text-gray-400 text-xs">(optional)</span>
                    </Label>
                    <Textarea
                      id="title"
                      placeholder="Short summary of the customer’s issue"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      rows={2}
                      className="bg-gray-50 border-gray-200 focus:bg-white text-gray-900"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-800">Select Category</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {categories.map((category) => {
                        const isSelected = selectedCategory === category.id;
                        return (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => setSelectedCategory(category.id)}
                            className={[
                              "group flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 text-center transition-all hover-lift bg-white",
                              isSelected
                                ? "border-blue-500/80 bg-blue-50/80 shadow-sm"
                                : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/40",
                            ].join(" ")}
                          >
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-xl">
                              {category.icon || "📌"}
                            </span>
                            <span className="font-medium text-sm text-gray-900">
                              {category.name}
                            </span>
                          </button>
                        );
                      })}

                      {categories.length === 0 && (
                        <p className="text-xs text-gray-500 col-span-full">
                          No categories found for your company.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium text-gray-800">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the customer’s issue in detail..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="bg-gray-50 border-gray-200 focus:bg-white text-gray-900"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="attachment" className="text-sm font-medium text-gray-800">
                      Attachment <span className="text-gray-400 text-xs">(optional)</span>
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
                      onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </div>

                  <DialogFooter className="pt-2 border-t border-gray-100 flex-shrink-0">
                    <Button
                      type="submit"
                      className="hover-lift rounded-full bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={isSubmitting}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {isSubmitting ? "Logging..." : "Log Complaint"}
                    </Button>
                  </DialogFooter>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="manage" className="space-y-6">
          <TabsContent value="manage" className="space-y-6">
            {/* Search */}
            <Card className="bg-white border border-gray-200 rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-gray-900">
                  Search Complaint
                </CardTitle>
                <CardDescription className="text-gray-500">
                  Search by complaint ID (exact)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-2">
                  <Input
                    placeholder="Enter Complaint ID"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
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

            {/* List */}
            <Card className="bg-white border border-gray-200 rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  All Complaints
                </CardTitle>
                <CardDescription className="text-gray-500">
                  Click a complaint to add solution / assign support
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading && <p className="text-sm text-gray-500">Loading complaints...</p>}
                {!loading && loadError && (
                  <p className="text-sm text-red-500">Failed to load complaints: {loadError}</p>
                )}
                {!loading && !loadError && complaints.length === 0 && (
                  <p className="text-sm text-gray-500">No complaints yet.</p>
                )}

                <div className="space-y-4">
                  {sortedComplaints.map((complaint) => (
                    <button
                      key={complaint.id}
                      type="button"
                      onClick={() => openManageComplaint(complaint)}
                      ref={(el) => (complaintRefs.current[complaint.id] = el)}
                      className={[
                        "w-full text-left p-4 bg-white border rounded-2xl transition-all",
                        "hover:border-blue-400 hover:shadow-sm",
                        highlightId === complaint.id
                          ? "border-blue-500 ring-2 ring-blue-200"
                          : "border-gray-200",
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-semibold text-lg text-gray-900">
                            {complaint.title || complaint.id}
                          </div>
                          <div className="text-xs text-gray-400 mb-1">ID: {complaint.id}</div>
                          <div className="text-sm text-gray-500">
                            {getCategoryName(complaint.category_id)}
                          </div>

                          {complaint.consumer_email && (
                            <div className="text-xs text-gray-400 mt-1">
                              Customer: {complaint.consumer_email}
                            </div>
                          )}
                        </div>

                        {getStatusBadge(complaint.status)}
                      </div>

                      <p className="text-sm text-gray-800 mb-3">{complaint.description}</p>

                      {/* quick preview if solution/support already exists */}
                      <div className="flex flex-col gap-1 text-xs text-gray-500">
                        {complaint.solution?.text && (
                          <div className="flex items-center gap-2">
                            <Wrench className="h-3 w-3" />
                            <span className="truncate">
                              Solution: {complaint.solution.text}
                            </span>
                          </div>
                        )}
                        {complaint.support?.email && (
                          <div className="flex items-center gap-2">
                            <UserPlus className="h-3 w-3" />
                            <span className="truncate">
                              Support: {complaint.support.email}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-gray-500">
                        <span>
                          Submitted: {toDate(complaint.createdAt)?.toLocaleDateString() || "-"}
                        </span>

                        {/* keep your status dropdown */}
                        <div onClick={(e) => e.stopPropagation()}>
                          <Select
                            value={complaint.status}
                            onValueChange={(value) =>
                              handleStatusChange(complaint.id, value)
                            }
                          >
                            <SelectTrigger className="w-[160px] bg-white text-gray-900 border border-gray-300">
                              <SelectValue placeholder="Change status" />
                            </SelectTrigger>

                            <SelectContent className="bg-white text-gray-900 border border-gray-200 shadow-lg z-50">
                              <SelectItem
                                value="pending"
                                className="cursor-pointer focus:bg-gray-100 focus:text-gray-900"
                              >
                                Pending
                              </SelectItem>
                              <SelectItem
                                value="in-progress"
                                className="cursor-pointer focus:bg-gray-100 focus:text-gray-900"
                              >
                                In Progress
                              </SelectItem>
                              <SelectItem
                                value="resolved"
                                className="cursor-pointer focus:bg-gray-100 focus:text-gray-900"
                              >
                                Resolved
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {complaint.resolvedAt && (
                        <div className="mt-2 text-xs text-gray-500">
                          Resolved: {toDate(complaint.resolvedAt)?.toLocaleDateString() || "-"}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Manage Complaint Modal */}
        <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
          <DialogContent className="max-w-xl sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Manage Complaint
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                {activeComplaint?.id ? `ID: ${activeComplaint.id}` : ""}
              </DialogDescription>
            </DialogHeader>

            {/* Add solution */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-800">Solution</Label>
              <Textarea
                value={solutionText}
                onChange={(e) => setSolutionText(e.target.value)}
                placeholder="Write the solution / resolution steps..."
                rows={4}
                className="bg-gray-50 border-gray-200 focus:bg-white text-gray-900"
              />
              <div className="text-xs text-gray-500">
                This will be shown to the customer with your name.
              </div>
            </div>

            {/* Assign support */}
            <div className="space-y-2 mt-4">
              <Label className="text-sm font-medium text-gray-800">
                Assign Support Person (email)
              </Label>
              <Input
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                placeholder="support.person@company.com"
                className="bg-gray-50 border-gray-200 focus:bg-white text-gray-900"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => {
                  setIsManageDialogOpen(false);
                  setActiveComplaint(null);
                }}
              >
                Close
              </Button>

              <Button
                type="button"
                className="rounded-full bg-sky-600 hover:bg-sky-700 text-white"
                onClick={handleAssignSupport}
                disabled={isAssigningSupport}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {isAssigningSupport ? "Assigning..." : "Assign Support"}
              </Button>

              <Button
                type="button"
                className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleSaveSolution}
                disabled={isSavingSolution}
              >
                <Wrench className="mr-2 h-4 w-4" />
                {isSavingSolution ? "Saving..." : "Save Solution"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AgentDashboard;
