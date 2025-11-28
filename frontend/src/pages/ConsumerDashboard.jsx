// src/pages/ConsumerDashboard.jsx
import { useEffect, useState } from "react";
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
import { toast } from "sonner";
import { Upload, FileText, CheckCircle, Clock } from "lucide-react";
import { useAuth } from "../context/authContext";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const ConsumerDashboard = () => {
  const { user, getIdToken } = useAuth();

  const [categories, setCategories] = useState([]);
  const [complaints, setComplaints] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const withAuthFetch = async (path, options = {}) => {
    const token = await getIdToken(); // ✅ from context

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

  // load data
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
          withAuthFetch("/api/complaints"),
        ]);

        // 🔁 map Firestore field `title` -> UI field `name`
        setCategories(
          fetchedCategories.map((c) => ({
            id: c.id,
            name: c.title, // ← your Firestore field
            icon: "📌",
          }))
        );

        setComplaints(fetchedComplaints);
      }
       catch (err) {
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

  const totalComplaints = complaints.length;
  const resolvedComplaints = complaints.filter(
    (c) => c.status === "resolved"
  ).length;
  const pendingComplaints = complaints.filter(
    (c) => c.status === "pending"
  ).length;
  const inProgressComplaints = complaints.filter(
    (c) => c.status === "in-progress"
  ).length;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCategory || !title.trim() || !description.trim()) {
      toast.error("Please fill in title, category and description");
      return;
    }

    try {
      const payload = {
        title: title.trim(),
        category_id: selectedCategory,
        description: description.trim(),
        attachment: null,
      };

      const res = await withAuthFetch("/api/complaints", {
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
      toast.success("Complaint submitted successfully!");

      setSelectedCategory("");
      setTitle("");
      setDescription("");
      setAttachment(null);
      setIsDialogOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(`Failed to submit complaint: ${err.message}`);
    }
  };

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




  // the user interface side

  return (
    <DashboardLayout title="Consumer Dashboard">
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
              <div className="text-2xl font-bold text-gray-900">
                {totalComplaints}
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
                {resolvedComplaints}
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
                {pendingComplaints}
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
                {inProgressComplaints}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Log Complaint Button */}
        <div className="flex justify-end">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="hover-lift bg-blue-600 hover:bg-blue-700 text-white rounded-full px-5">
                <Upload className="mr-2 h-4 w-4" />
                Log New Complaint
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Submit a Complaint</DialogTitle>
                <DialogDescription>
                  Provide a title, select a category and describe your issue.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Short summary of your issue"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                {/* Categories */}
                <div className="space-y-4">
                  <Label>Select Category</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setSelectedCategory(category.id)}
                        className={`p-4 border-2 rounded-xl transition-all hover-lift bg-white ${
                          selectedCategory === category.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <div className="text-3xl mb-2">
                          {category.icon || "📌"}
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {category.name}
                        </div>
                      </button>
                    ))}
                    {categories.length === 0 && (
                      <p className="text-xs text-gray-500 col-span-full">
                        No categories found for your company.
                      </p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your issue in detail..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                {/* Attachment */}
                <div className="space-y-2">
                  <Label htmlFor="attachment">Attachment (Optional)</Label>
                  <Input
                    id="attachment"
                    type="file"
                    onChange={(e) =>
                      setAttachment(e.target.files?.[0] || null)
                    }
                    className="cursor-pointer"
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="hover-lift bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={loading}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Submit Complaint
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Complaint History */}
        <Card className="bg-white border border-gray-200 rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Complaint History
            </CardTitle>
            <CardDescription className="text-gray-500">
              View all your submitted complaints
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && (
              <p className="text-sm text-gray-500">Loading complaints...</p>
            )}
            {!loading && loadError && (
              <p className="text-sm text-red-500">
                Failed to load complaints: {loadError}
              </p>
            )}
            {!loading && !loadError && complaints.length === 0 && (
              <p className="text-sm text-gray-500">No complaints yet.</p>
            )}

            <div className="space-y-4">
              {complaints.map((complaint) => (
                <div
                  key={complaint.id}
                  className="p-4 bg-white border border-gray-200 rounded-2xl hover:border-blue-400 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-semibold text-lg text-gray-900">
                        {complaint.title || complaint.id}
                      </div>
                      <div className="text-xs text-gray-400 mb-1">
                        ID: {complaint.id}
                      </div>
                      <div className="text-sm text-gray-500">
                        {getCategoryName(complaint.category_id)}
                      </div>
                    </div>
                    {getStatusBadge(complaint.status)}
                  </div>
                  <p className="text-sm text-gray-800 mb-2">
                    {complaint.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      Submitted:{" "}
                      {toDate(complaint.createdAt)?.toLocaleDateString() ||
                        "-"}
                    </span>
                    {complaint.resolvedAt && (
                      <span>
                        Resolved:{" "}
                        {toDate(complaint.resolvedAt)?.toLocaleDateString() ||
                          "-"}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ConsumerDashboard;
