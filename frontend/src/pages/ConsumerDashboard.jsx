import { DashboardLayout } from '../components/DashboardLayout';
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { useState } from 'react';
import { toast } from 'sonner';
import { Upload, FileText, CheckCircle, Clock } from 'lucide-react';

const categories = [
  { id: 'technical', name: 'Technical Issue', icon: '⚙️' },
  { id: 'billing', name: 'Billing', icon: '💰' },
  { id: 'service', name: 'Service Quality', icon: '📊' },
  { id: 'account', name: 'Account Access', icon: '🔐' },
];

const mockComplaints = [
  {
    id: 'C001',
    category: 'technical',
    description: 'Unable to login to my account',
    status: 'resolved',
    createdBy: '1',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-16'),
    resolvedBy: 'Agent Smith',
    resolvedAt: new Date('2024-01-16'),
  },
  {
    id: 'C002',
    category: 'billing',
    description: 'Incorrect charge on my statement',
    status: 'in-progress',
    createdBy: '1',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
];

const ConsumerDashboard = () => {
  const [complaints, setComplaints] = useState(mockComplaints);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [description, setDescription] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const totalComplaints = complaints.length;
  const resolvedComplaints = complaints.filter(c => c.status === 'resolved').length;
  const pendingComplaints = complaints.filter(c => c.status === 'pending').length;
  const inProgressComplaints = complaints.filter(c => c.status === 'in-progress').length;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedCategory || !description) {
      toast.error('Please select a category and provide a description');
      return;
    }

    const newComplaint = {
      id: `C${String(complaints.length + 1).padStart(3, '0')}`,
      category: selectedCategory,
      description,
      status: 'pending',
      createdBy: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
      attachmentUrl: attachment ? URL.createObjectURL(attachment) : undefined,
    };

    setComplaints([newComplaint, ...complaints]);
    toast.success('Complaint submitted successfully!');
    setSelectedCategory('');
    setDescription('');
    setAttachment(null);
    setIsDialogOpen(false);
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: {
        classes: 'bg-amber-100 text-amber-900 border border-amber-200',
        icon: Clock,
        label: 'pending',
      },
      'in-progress': {
        classes: 'bg-sky-100 text-sky-900 border border-sky-200',
        icon: FileText,
        label: 'in-progress',
      },
      resolved: {
        classes: 'bg-emerald-100 text-emerald-900 border border-emerald-200',
        icon: CheckCircle,
        label: 'resolved',
      },
    };

    const variant = variants[status] || variants.pending;
    const Icon = variant.icon;

    return (
      <Badge className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${variant.classes}`}>
        <Icon className="h-3 w-3" />
        {variant.label}
      </Badge>
    );
  };

  return (
    <DashboardLayout title="Consumer Dashboard">
      {/* page background + spacing */}
      <div className="bg-gray-50 min-h-screen p-6 md:p-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
              <FileText className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{totalComplaints}</div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{resolvedComplaints}</div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{pendingComplaints}</div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <FileText className="h-4 w-4 text-sky-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-sky-600">{inProgressComplaints}</div>
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
                <DialogDescription>Select a category and describe your issue</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
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
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="text-3xl mb-2">{category.icon}</div>
                        <div className="text-sm font-medium text-gray-900">
                          {category.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

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

                <div className="space-y-2">
                  <Label htmlFor="attachment">Attachment (Optional)</Label>
                  <Input
                    id="attachment"
                    type="file"
                    onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                    className="cursor-pointer"
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="hover-lift bg-blue-600 hover:bg-blue-700 text-white">
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
                      <div className="text-sm text-gray-500">
                        {categories.find(c => c.id === complaint.category)?.name}
                      </div>
                    </div>
                    {getStatusBadge(complaint.status)}
                  </div>
                  <p className="text-sm text-gray-800 mb-2">{complaint.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Submitted: {complaint.createdAt.toLocaleDateString()}</span>
                    {complaint.resolvedAt && (
                      <span>Resolved: {complaint.resolvedAt.toLocaleDateString()}</span>
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
