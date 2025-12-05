import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Download, TrendingUp, DollarSign, Ticket, Film } from 'lucide-react';
import { cn } from '@/lib/utils';

const RevenueReports = () => {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

  const stats = [
    { label: 'Total Revenue', value: '$145,678', change: '+12.5%', icon: DollarSign },
    { label: 'Tickets Sold', value: '12,456', change: '+8.2%', icon: Ticket },
    { label: 'Avg. Ticket Price', value: '$11.70', change: '+2.1%', icon: TrendingUp },
    { label: 'Top Movie', value: 'Inception', subtext: '$24,500', icon: Film },
  ];

  const revenueByMovie = [
    { movie: 'Inception', revenue: 24500, tickets: 1890, percentage: 100 },
    { movie: 'The Dark Knight', revenue: 21200, tickets: 1650, percentage: 86 },
    { movie: 'Interstellar', revenue: 18900, tickets: 1420, percentage: 77 },
    { movie: 'Dune', revenue: 15600, tickets: 1180, percentage: 64 },
    { movie: 'Avatar', revenue: 12300, tickets: 920, percentage: 50 },
  ];

  const dailyRevenue = [
    { day: 'Mon', revenue: 4200 },
    { day: 'Tue', revenue: 3800 },
    { day: 'Wed', revenue: 4500 },
    { day: 'Thu', revenue: 5200 },
    { day: 'Fri', revenue: 7800 },
    { day: 'Sat', revenue: 9500 },
    { day: 'Sun', revenue: 8200 },
  ];

  const maxRevenue = Math.max(...dailyRevenue.map(d => d.revenue));

  return (
    <AdminLayout title="Revenue Reports">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <Button
              key={range}
              variant={dateRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDateRange(range)}
            >
              {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
            </Button>
          ))}
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  {stat.change && (
                    <p className="text-sm text-success mt-1">{stat.change}</p>
                  )}
                  {stat.subtext && (
                    <p className="text-sm text-muted-foreground mt-1">{stat.subtext}</p>
                  )}
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Daily Revenue Chart */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Daily Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2 h-48">
              {dailyRevenue.map((day) => (
                <div key={day.day} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-full bg-gradient-to-t from-primary to-primary/60 rounded-t-lg transition-all duration-300 hover:from-primary/90"
                    style={{ height: `${(day.revenue / maxRevenue) * 100}%`, minHeight: '8px' }}
                  />
                  <span className="text-xs text-muted-foreground mt-2">{day.day}</span>
                  <span className="text-xs font-medium text-foreground">${(day.revenue / 1000).toFixed(1)}k</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Revenue by Movie */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Revenue by Movie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueByMovie.map((item, index) => (
                <div key={item.movie}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="font-medium text-foreground">{item.movie}</span>
                    </div>
                    <span className="font-bold text-foreground">${item.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-16">{item.tickets} tickets</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="mt-6 bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Transaction ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Movie</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tickets</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: 'TXN001', movie: 'Inception', customer: 'John Doe', tickets: 2, amount: '$30.00', date: 'Dec 20, 2024' },
                  { id: 'TXN002', movie: 'The Dark Knight', customer: 'Jane Smith', tickets: 3, amount: '$45.00', date: 'Dec 20, 2024' },
                  { id: 'TXN003', movie: 'Interstellar', customer: 'Bob Wilson', tickets: 2, amount: '$32.00', date: 'Dec 19, 2024' },
                  { id: 'TXN004', movie: 'Dune', customer: 'Alice Brown', tickets: 4, amount: '$60.00', date: 'Dec 19, 2024' },
                ].map((txn) => (
                  <tr key={txn.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-4 text-sm font-mono text-primary">{txn.id}</td>
                    <td className="py-3 px-4 text-sm text-foreground">{txn.movie}</td>
                    <td className="py-3 px-4 text-sm text-foreground">{txn.customer}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{txn.tickets}</td>
                    <td className="py-3 px-4 text-sm font-medium text-foreground">{txn.amount}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{txn.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default RevenueReports;
