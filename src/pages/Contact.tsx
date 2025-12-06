import { useState } from 'react';
import { Mail, MessageSquare, Send, AlertCircle, CheckCircle, User, Phone } from 'lucide-react';
import { CustomerLayout } from '@/components/layout/CustomerLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type FeedbackType = 'general' | 'bug' | 'suggestion' | 'complaint';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'general' as FeedbackType,
    subject: '',
    message: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const feedbackTypes = [
    { value: 'general', label: 'General Inquiry', icon: MessageSquare },
    { value: 'bug', label: 'Bug Report', icon: AlertCircle },
    { value: 'suggestion', label: 'Suggestion', icon: Send },
    { value: 'complaint', label: 'Complaint', icon: Mail },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitted(true);
    toast({
      title: "Feedback Submitted!",
      description: "Thank you for your feedback. We'll get back to you soon.",
    });
    
    setIsLoading(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      type: 'general',
      subject: '',
      message: '',
    });
    setIsSubmitted(false);
    setErrors({});
  };

  return (
    <CustomerLayout>
      <div className="min-h-screen py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Contact Us</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Have questions, feedback, or need to report an issue? We're here to help.
              Fill out the form below and our team will get back to you as soon as possible.
            </p>
          </div>

          {isSubmitted ? (
            <Card className="p-12 bg-card border-border text-center animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-success" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Thank You!</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Your message has been received. Our team will review it and get back to you within 24-48 hours.
              </p>
              <Button variant="cinema" onClick={resetForm}>
                Send Another Message
              </Button>
            </Card>
          ) : (
            <Card className="p-8 bg-card border-border animate-fade-in">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Feedback Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    What can we help you with?
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {feedbackTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: type.value as FeedbackType })}
                        className={cn(
                          "p-4 rounded-lg border transition-all text-left",
                          formData.type === type.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-secondary/50 text-muted-foreground hover:border-muted-foreground"
                        )}
                      >
                        <type.icon className="w-5 h-5 mb-2" />
                        <span className="text-sm font-medium block">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`pl-10 ${errors.name ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="tel"
                      placeholder="+1 234 567 8900"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Subject *
                  </label>
                  <Input
                    placeholder="Brief description of your inquiry"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className={errors.subject ? 'border-destructive' : ''}
                  />
                  {errors.subject && <p className="mt-1 text-sm text-destructive">{errors.subject}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Message *
                  </label>
                  <textarea
                    placeholder="Please provide details about your inquiry..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={5}
                    className={cn(
                      "w-full px-4 py-3 rounded-lg border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none",
                      errors.message ? 'border-destructive' : 'border-border'
                    )}
                  />
                  {errors.message && <p className="mt-1 text-sm text-destructive">{errors.message}</p>}
                </div>

                <Button
                  type="submit"
                  variant="cinema"
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Feedback
                    </>
                  )}
                </Button>
              </form>
            </Card>
          )}

          {/* Contact Info Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <Card className="p-6 bg-card border-border text-center">
              <Mail className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Email Us</h3>
              <p className="text-sm text-muted-foreground">support@cinebook.com</p>
            </Card>
            <Card className="p-6 bg-card border-border text-center">
              <Phone className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Call Us</h3>
              <p className="text-sm text-muted-foreground">+1 (800) 123-4567</p>
            </Card>
            <Card className="p-6 bg-card border-border text-center">
              <MessageSquare className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Live Chat</h3>
              <p className="text-sm text-muted-foreground">Available 24/7</p>
            </Card>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default Contact;