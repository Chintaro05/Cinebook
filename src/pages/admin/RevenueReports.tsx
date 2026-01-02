import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, DollarSign, Ticket, Film, Loader2 } from 'lucide-react';
import { useRevenueData } from '@/hooks/useRevenue';

const RevenueReports = () => {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  
  const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
  const { data, isLoading } = useRevenueData(days);

  const stats = data ? [
    { 
      label: 'Total Revenue', 
      value: `$${data.stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      icon: DollarSign 
    },
    { 
      label: 'Tickets Sold', 
      value: data.stats.ticketsSold.toLocaleString(), 
      icon: Ticket 
    },
    { 
      label: 'Avg. Ticket Price', 
      value: `$${data.stats.avgTicketPrice.toFixed(2)}`, 
      icon: TrendingUp 
    },
    { 
      label: 'Top Movie', 
      value: data.stats.topMovie?.title || 'N/A', 
      subtext: data.stats.topMovie ? `$${data.stats.topMovie.revenue.toLocaleString()}` : undefined, 
      icon: Film 
    },
  ] : [];

  const maxRevenue = data ? Math.max(...data.dailyRevenue.map(d => d.revenue), 1) : 1;

  const handleExportCSV = () => {
    if (!data) return;

    const csvContent = [
      ['Metric', 'Value'],
      ['Total Revenue', `$${data.stats.totalRevenue.toFixed(2)}`],
      ['Tickets Sold', data.stats.ticketsSold.toString()],
      ['Avg Ticket Price', `$${data.stats.avgTicketPrice.toFixed(2)}`],
      ['Top Movie', data.stats.topMovie?.title || 'N/A'],
      [],
      ['Movie', 'Revenue', 'Tickets'],
      ...data.revenueByMovie.map(m => [m.movie, `$${m.revenue}`, m.tickets.toString()]),
      [],
      ['Date', 'Revenue'],
      ...data.dailyRevenue.map(d => [d.date, `$${d.revenue}`]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-report-${dateRange}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <AdminLayout title="Revenue Reports">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

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
        <Button variant="outline" className="gap-2" onClick={handleExportCSV}>
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

      {data && data.stats.totalRevenue === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="p-12 text-center">
            <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Revenue Data</h3>
            <p className="text-muted-foreground">
              No completed payments found for the selected period.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Daily Revenue Chart */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Daily Revenue (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between gap-2 h-48">
                  {data?.dailyRevenue.map((day) => (
                    <div key={day.date} className="flex flex-col items-center flex-1">
                      <div 
                        className="w-full bg-gradient-to-t from-primary to-primary/60 rounded-t-lg transition-all duration-300 hover:from-primary/90"
                        style={{ height: `${(day.revenue / maxRevenue) * 100}%`, minHeight: day.revenue > 0 ? '8px' : '2px' }}
                      />
                      <span className="text-xs text-muted-foreground mt-2">{day.day}</span>
                      <span className="text-xs font-medium text-foreground">
                        ${day.revenue >= 1000 ? `${(day.revenue / 1000).toFixed(1)}k` : day.revenue.toFixed(0)}
                      </span>
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
                {data?.revenueByMovie.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No movie revenue data available
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data?.revenueByMovie.map((item, index) => (
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
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card className="mt-6 bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {data?.transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No transactions found
                </div>
              ) : (
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
                      {data?.transactions.map((txn) => (
                        <tr key={txn.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                          <td className="py-3 px-4 text-sm font-mono text-primary">{txn.transaction_id || txn.id.slice(0, 8)}</td>
                          <td className="py-3 px-4 text-sm text-foreground">{txn.movie_title}</td>
                          <td className="py-3 px-4 text-sm text-foreground">{txn.customer_name || 'Unknown'}</td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">{txn.tickets}</td>
                          <td className="py-3 px-4 text-sm font-medium text-foreground">${txn.amount.toFixed(2)}</td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">{txn.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </AdminLayout>
  );
};

export default RevenueReports;
