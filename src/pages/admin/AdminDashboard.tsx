import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Film, Ticket, Users, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const stats = [
  {
    title: "Today's Revenue",
    value: "$12,456",
    change: "+12%",
    trend: "up",
    icon: DollarSign,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    title: "Active Movies",
    value: "24",
    change: "+3",
    trend: "up",
    icon: Film,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "Tickets Sold Today",
    value: "1,234",
    change: "+8%",
    trend: "up",
    icon: Ticket,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    title: "Active Users",
    value: "8,456",
    change: "-2%",
    trend: "down",
    icon: Users,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
];

const recentBookings = [
  { id: 'CB001', movie: 'Inception', user: 'John Doe', seats: 'A1, A2', amount: '$30.00', time: '2 min ago' },
  { id: 'CB002', movie: 'The Dark Knight', user: 'Jane Smith', seats: 'C5-C7', amount: '$45.00', time: '5 min ago' },
  { id: 'CB003', movie: 'Interstellar', user: 'Bob Wilson', seats: 'D3, D4', amount: '$32.00', time: '12 min ago' },
  { id: 'CB004', movie: 'Dune', user: 'Alice Brown', seats: 'B1-B4', amount: '$60.00', time: '18 min ago' },
];

const AdminDashboard = () => {
  return (
    <AdminLayout title="Dashboard">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-card border-border hover:border-primary/30 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  <div className={`flex items-center gap-1 mt-2 text-sm ${stat.trend === 'up' ? 'text-success' : 'text-destructive'}`}>
                    {stat.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span>{stat.change} from yesterday</span>
                  </div>
                </div>
                <div className={`w-14 h-14 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-7 h-7 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Bookings */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Bookings</CardTitle>
            <Link to="/admin/reports">
              <Button variant="ghost" size="sm" className="text-primary">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Booking ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Movie</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Customer</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Seats</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 px-4 text-sm font-mono text-primary">{booking.id}</td>
                      <td className="py-3 px-4 text-sm text-foreground">{booking.movie}</td>
                      <td className="py-3 px-4 text-sm text-foreground">{booking.user}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{booking.seats}</td>
                      <td className="py-3 px-4 text-sm font-medium text-foreground">{booking.amount}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{booking.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/admin/movies">
              <Button variant="outline" className="w-full justify-start gap-3 h-12">
                <Film className="w-5 h-5 text-primary" />
                Add New Movie
              </Button>
            </Link>
            <Link to="/admin/showtimes">
              <Button variant="outline" className="w-full justify-start gap-3 h-12">
                <Ticket className="w-5 h-5 text-accent" />
                Schedule Showtime
              </Button>
            </Link>
            <Link to="/admin/reports">
              <Button variant="outline" className="w-full justify-start gap-3 h-12">
                <TrendingUp className="w-5 h-5 text-success" />
                View Reports
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Today's Showtimes */}
      <Card className="mt-6 bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Today's Upcoming Showtimes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {['10:00 AM', '1:30 PM', '4:45 PM', '7:15 PM'].map((time) => (
              <div key={time} className="p-4 rounded-xl bg-secondary/50 border border-border">
                <p className="text-lg font-bold text-foreground mb-1">{time}</p>
                <p className="text-sm text-muted-foreground">Inception - Screen 1</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">72/100 seats</span>
                  <span className="px-2 py-0.5 rounded-full bg-success/20 text-success text-xs">On Sale</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminDashboard;
