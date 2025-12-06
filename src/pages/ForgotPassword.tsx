import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Film, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import heroCinema from '@/assets/hero-cinema.jpg';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = () => {
    if (!email) {
      setError('Email is required');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail()) return;
    
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitted(true);
    toast({
      title: "Email Sent!",
      description: "Check your inbox for password reset instructions.",
    });
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src={heroCinema}
          alt="Cinema"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
        <div className="absolute bottom-12 left-12 max-w-md">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Reset Your <span className="text-primary">Password</span>
          </h2>
          <p className="text-muted-foreground">
            Don't worry, it happens to the best of us. We'll help you get back to your movies in no time.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <Film className="w-8 h-8 text-primary" />
              </div>
              <span className="text-2xl font-bold text-foreground">
                Cine<span className="text-primary">Book</span>
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Forgot Password</h1>
            <p className="text-muted-foreground mt-2">
              Enter your email and we'll send you a reset link
            </p>
          </div>

          {/* Form */}
          <Card className="p-8 bg-card border-border">
            {isSubmitted ? (
              <div className="text-center space-y-4 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Check Your Email</h3>
                <p className="text-muted-foreground text-sm">
                  We've sent a password reset link to <span className="text-foreground font-medium">{email}</span>
                </p>
                <p className="text-muted-foreground text-xs">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
                <Button
                  variant="cinema-outline"
                  onClick={() => setIsSubmitted(false)}
                  className="mt-4"
                >
                  Send Again
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`pl-10 ${error ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {error && (
                    <p className="mt-1 text-sm text-destructive">{error}</p>
                  )}
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
                      Sending...
                    </span>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </form>
            )}
          </Card>

          {/* Back to Login */}
          <Link 
            to="/login" 
            className="flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;