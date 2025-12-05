import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Ticket } from 'lucide-react';
import { ticketTypes } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';

const ManageTickets = () => {
  const handleDelete = (id: string, name: string) => {
    toast({
      title: "Ticket Type Deleted",
      description: `"${name}" has been removed.`,
    });
  };

  return (
    <AdminLayout title="Manage Ticket Types">
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">All Ticket Types</CardTitle>
          <Button variant="cinema" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Ticket Type
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Description</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Price Modifier</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Example Price</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ticketTypes.map((type) => (
                  <tr key={type.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Ticket className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-medium text-foreground">{type.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">
                      {type.description}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        type.priceModifier < 1 
                          ? 'bg-success/20 text-success' 
                          : 'bg-secondary text-secondary-foreground'
                      }`}>
                        {type.priceModifier < 1 
                          ? `-${((1 - type.priceModifier) * 100).toFixed(0)}%`
                          : 'Standard'
                        }
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm font-medium text-foreground">
                      ${(15 * type.priceModifier).toFixed(2)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(type.id, type.name)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
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

export default ManageTickets;
