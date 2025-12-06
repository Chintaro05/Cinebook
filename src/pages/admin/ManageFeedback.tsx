import { useState } from 'react';
import { Search, Filter, MessageSquare, AlertCircle, CheckCircle, Clock, Mail, User, XCircle } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface Feedback {
  id: string;
  name: string;
  email: string;
  type: 'general' | 'bug' | 'suggestion' | 'complaint';
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

const mockFeedback: Feedback[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    type: 'bug',
    subject: 'Payment page not loading',
    message: 'When I try to access the payment page after selecting seats, the page shows a blank screen. This happened on Chrome browser.',
    status: 'new',
    priority: 'high',
    createdAt: '2024-12-05 14:30',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    type: 'suggestion',
    subject: 'Add Apple Pay support',
    message: 'It would be great if you could add Apple Pay as a payment option for faster checkout.',
    status: 'in_progress',
    priority: 'medium',
    createdAt: '2024-12-04 10:15',
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    type: 'complaint',
    subject: 'Wrong seats assigned',
    message: 'I booked seats A1 and A2 but was given B1 and B2 at the cinema. Very disappointed.',
    status: 'resolved',
    priority: 'high',
    createdAt: '2024-12-03 18:45',
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    email: 'sarah@example.com',
    type: 'general',
    subject: 'Question about refund policy',
    message: 'What is your refund policy for cancelled bookings? I could not find this information on your website.',
    status: 'closed',
    priority: 'low',
    createdAt: '2024-12-02 09:00',
  },
];

const ManageFeedback = () => {
  const [feedback, setFeedback] = useState<Feedback[]>(mockFeedback);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  const filteredFeedback = feedback.filter(f => {
    const matchesSearch = 
      f.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || f.type === filterType;
    const matchesStatus = filterStatus === 'all' || f.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusIcon = (status: Feedback['status']) => {
    switch (status) {
      case 'new': return <Clock className="w-4 h-4" />;
      case 'in_progress': return <AlertCircle className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <XCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: Feedback['status']) => {
    switch (status) {
      case 'new': return 'bg-primary/20 text-primary';
      case 'in_progress': return 'bg-warning/20 text-warning';
      case 'resolved': return 'bg-success/20 text-success';
      case 'closed': return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeColor = (type: Feedback['type']) => {
    switch (type) {
      case 'bug': return 'bg-destructive/20 text-destructive';
      case 'suggestion': return 'bg-primary/20 text-primary';
      case 'complaint': return 'bg-warning/20 text-warning';
      case 'general': return 'bg-secondary text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: Feedback['priority']) => {
    switch (priority) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-warning';
      case 'low': return 'text-muted-foreground';
    }
  };

  const updateStatus = (id: string, newStatus: Feedback['status']) => {
    setFeedback(feedback.map(f => 
      f.id === id ? { ...f, status: newStatus } : f
    ));
    if (selectedFeedback?.id === id) {
      setSelectedFeedback({ ...selectedFeedback, status: newStatus });
    }
    toast({
      title: "Status Updated",
      description: `Feedback status changed to ${newStatus.replace('_', ' ')}.`,
    });
  };

  return (
    <AdminLayout title="Feedback Management">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Feedback & Error Reports</h1>
            <p className="text-muted-foreground">Manage user feedback and error reports</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by subject, name, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 rounded-lg border border-border bg-input text-foreground"
          >
            <option value="all">All Types</option>
            <option value="general">General</option>
            <option value="bug">Bug Report</option>
            <option value="suggestion">Suggestion</option>
            <option value="complaint">Complaint</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 rounded-lg border border-border bg-input text-foreground"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'New', count: feedback.filter(f => f.status === 'new').length, color: 'text-primary' },
            { label: 'In Progress', count: feedback.filter(f => f.status === 'in_progress').length, color: 'text-warning' },
            { label: 'Resolved', count: feedback.filter(f => f.status === 'resolved').length, color: 'text-success' },
            { label: 'Bug Reports', count: feedback.filter(f => f.type === 'bug').length, color: 'text-destructive' },
          ].map((stat) => (
            <Card key={stat.label} className="p-4 bg-card border-border">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={cn("text-2xl font-bold", stat.color)}>{stat.count}</p>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Feedback List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredFeedback.length === 0 ? (
              <Card className="p-8 bg-card border-border text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No feedback found</p>
              </Card>
            ) : (
              filteredFeedback.map((item) => (
                <Card
                  key={item.id}
                  className={cn(
                    "p-4 bg-card border-border cursor-pointer transition-all hover:border-primary/50",
                    selectedFeedback?.id === item.id && "border-primary"
                  )}
                  onClick={() => setSelectedFeedback(item)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className={cn("px-2 py-0.5 rounded text-xs font-medium", getTypeColor(item.type))}>
                          {item.type.replace('_', ' ')}
                        </span>
                        <span className={cn("px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1", getStatusColor(item.status))}>
                          {getStatusIcon(item.status)}
                          {item.status.replace('_', ' ')}
                        </span>
                        <span className={cn("text-xs font-medium", getPriorityColor(item.priority))}>
                          • {item.priority} priority
                        </span>
                      </div>
                      <h3 className="font-semibold text-foreground truncate">{item.subject}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.message}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {item.name}
                        </span>
                        <span>{item.createdAt}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-1">
            {selectedFeedback ? (
              <Card className="p-6 bg-card border-border sticky top-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className={cn("px-2 py-0.5 rounded text-xs font-medium", getTypeColor(selectedFeedback.type))}>
                      {selectedFeedback.type}
                    </span>
                    <span className={cn("px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1", getStatusColor(selectedFeedback.status))}>
                      {getStatusIcon(selectedFeedback.status)}
                      {selectedFeedback.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-foreground">{selectedFeedback.subject}</h3>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="w-4 h-4" />
                      {selectedFeedback.name}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      {selectedFeedback.email}
                    </div>
                    <p className="text-muted-foreground">{selectedFeedback.createdAt}</p>
                  </div>

                  <div className="border-t border-border pt-4">
                    <p className="text-sm text-foreground">{selectedFeedback.message}</p>
                  </div>

                  <div className="border-t border-border pt-4 space-y-2">
                    <p className="text-sm font-medium text-foreground">Update Status</p>
                    <div className="grid grid-cols-2 gap-2">
                      {['new', 'in_progress', 'resolved', 'closed'].map((status) => (
                        <Button
                          key={status}
                          variant={selectedFeedback.status === status ? 'cinema' : 'outline'}
                          size="sm"
                          onClick={() => updateStatus(selectedFeedback.id, status as Feedback['status'])}
                        >
                          {status.replace('_', ' ')}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button variant="cinema-outline" className="w-full">
                    <Mail className="w-4 h-4 mr-2" />
                    Reply via Email
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-8 bg-card border-border text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Select a feedback item to view details</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ManageFeedback;