import { useState } from 'react';
import { User, Mail, Phone, Lock, Calendar, MapPin, Ticket, X } from 'lucide-react';
import { CustomerLayout } from '@/components/layout/CustomerLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { bookings } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const Profile = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'bookings'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
  });

  const handleSave = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
    setIsEditing(false);
  };

  const handleCancelBooking = (bookingId: string) => {
    toast({
      title: "Booking Cancelled",
      description: "Your booking has been cancelled. A refund will be processed within 3-5 business days.",
    });
  };

  return (
    <CustomerLayout>
      <div className="min-h-screen py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold text-foreground mb-8">My Account</h1>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-border">
            <button
              onClick={() => setActiveTab('profile')}
              className={cn(
                "pb-4 px-2 font-medium transition-all relative",
                activeTab === 'profile'
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Profile Details
              {activeTab === 'profile' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={cn(
                "pb-4 px-2 font-medium transition-all relative",
                activeTab === 'bookings'
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Booking History
              {activeTab === 'bookings' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-fade-in">
              <Card className="p-6 bg-card border-border">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-foreground">Personal Information</h2>
                  <Button
                    variant={isEditing ? "outline" : "cinema-outline"}
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <Button variant="cinema" onClick={handleSave} className="mt-4">
                      Save Changes
                    </Button>
                  )}
                </div>
              </Card>

              <Card className="p-6 bg-card border-border">
                <h2 className="text-xl font-semibold text-foreground mb-6">Change Password</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input type="password" placeholder="••••••••" className="pl-10" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input type="password" placeholder="••••••••" className="pl-10" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input type="password" placeholder="••••••••" className="pl-10" />
                    </div>
                  </div>
                  <Button variant="cinema">Update Password</Button>
                </div>
              </Card>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="space-y-4 animate-fade-in">
              {bookings.length === 0 ? (
                <Card className="p-12 bg-card border-border text-center">
                  <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Bookings Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start your cinema journey by booking your first movie!
                  </p>
                  <Button variant="cinema">Browse Movies</Button>
                </Card>
              ) : (
                bookings.map((booking) => (
                  <Card key={booking.id} className="p-6 bg-card border-border">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex gap-4">
                        <div className="w-20 h-28 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                          <img
                            src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=100&h=150&fit=crop"
                            alt={booking.movieTitle}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground text-lg">{booking.movieTitle}</h3>
                          <div className="space-y-1 text-sm text-muted-foreground mt-2">
                            <p className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {booking.cinemaName}
                            </p>
                            <p className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {booking.date} • {booking.time}
                            </p>
                            <p className="flex items-center gap-2">
                              <Ticket className="w-4 h-4" />
                              Seats: {booking.seats.join(', ')}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium",
                          booking.status === 'confirmed' && "bg-success/20 text-success",
                          booking.status === 'cancelled' && "bg-destructive/20 text-destructive",
                          booking.status === 'pending' && "bg-warning/20 text-warning"
                        )}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                        <span className="text-lg font-bold text-foreground">
                          ${booking.totalPrice.toFixed(2)}
                        </span>
                        <div className="flex gap-2">
                          <Button variant="cinema-outline" size="sm">
                            View E-Ticket
                          </Button>
                          {booking.status === 'confirmed' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleCancelBooking(booking.id)}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
};

export default Profile;
