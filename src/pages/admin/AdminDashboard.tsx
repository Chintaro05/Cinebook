import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Film, Ticket, Users, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useDashboardData } from '@/hooks/useDashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow, parseISO } from 'date-fns';

const AdminDashboard = () => {
  const { data, isLoading } = useDashboardData();

  const stats = data ? [
    {
      title: "Today's Revenue",
      value: `$${data.stats.todayRevenue.toLocaleString()}`,
      change: `${data.stats.todayRevenueChange >= 0 ? '+' : ''}${data.stats.todayRevenueChange}%`,
      trend: data.stats.todayRevenueChange >= 0 ? "up" : "down",
      icon: DollarSign,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Active Movies",
      value: data.stats.activeMovies.toString(),
      change: `${data.stats.movieChange >= 0 ? '+' : ''}${data.stats.movieChange}`,
      trend: data.stats.movieChange >= 0 ? "up" : "down",
      icon: Film,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Tickets Sold Today",
      value: data.stats.ticketsSoldToday.toLocaleString(),
      change: `${data.stats.ticketsChange >= 0 ? '+' : ''}${data.stats.ticketsChange}%`,
      trend: data.stats.ticketsChange >= 0 ? "up" : "down",
      icon: Ticket,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Total Users",
      value: data.stats.activeUsers.toLocaleString(),
      change: `${data.stats.usersChange >= 0 ? '+' : ''}${data.stats.usersChange}`,
      trend: data.stats.usersChange >= 0 ? "up" : "down",
      icon: Users,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
  ] : [];

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <AdminLayout title="Dashboard">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-card border-border">
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))
        ) : (
          stats.map((stat) => (
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
          ))
        )}
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
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={6} className="py-3 px-4">
                          <Skeleton className="h-6 w-full" />
                        </td>
                      </tr>
                    ))
                  ) : data?.recentBookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">
                        No bookings yet
                      </td>
                    </tr>
                  ) : (
                    data?.recentBookings.map((booking) => (
                      <tr key={booking.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                        <td className="py-3 px-4 text-sm font-mono text-primary">{booking.id}</td>
                        <td className="py-3 px-4 text-sm text-foreground">{booking.movie_title}</td>
                        <td className="py-3 px-4 text-sm text-foreground">{booking.customer_name}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{booking.seats.join(', ')}</td>
                        <td className="py-3 px-4 text-sm font-medium text-foreground">${booking.amount.toFixed(2)}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {formatDistanceToNow(parseISO(booking.created_at), { addSuffix: true })}
                        </td>
                      </tr>
                    ))
                  )}
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
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : data?.todayShowtimes.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No showtimes scheduled for today</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {data?.todayShowtimes.map((showtime) => (
                <div key={showtime.id} className="p-4 rounded-xl bg-secondary/50 border border-border">
                  <p className="text-lg font-bold text-foreground mb-1">{formatTime(showtime.show_time)}</p>
                  <p className="text-sm text-muted-foreground">{showtime.movie_title} - {showtime.screen_name}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {showtime.booked_seats}/{showtime.total_capacity} seats
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-success/20 text-success text-xs">On Sale</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminDashboard;
