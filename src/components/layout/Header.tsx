import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Search, User, Menu, X, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { movies } from '@/data/mockData';

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof movies>([]);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Sync search query with URL params
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch) {
      setSearchQuery(urlSearch);
    }
  }, [searchParams]);

  // Search movies as user types
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const results = movies.filter(movie =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.genre.some(g => g.toLowerCase().includes(searchQuery.toLowerCase())) ||
        movie.director?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
      setShowResults(false);
      setIsSearchOpen(false);
    }
  };

  const handleSelectMovie = (movieId: string) => {
    navigate(`/movie/${movieId}`);
    setSearchQuery('');
    setShowResults(false);
    setIsSearchOpen(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    if (location.pathname === '/') {
      navigate('/');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Film className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Cine<span className="text-primary">Book</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              to="/now-showing" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Now Showing
            </Link>
            <Link 
              to="/?tab=coming-soon" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Coming Soon
            </Link>
            <Link 
              to="/profile" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              My Bookings
            </Link>
            <Link 
              to="/contact" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className={cn(
              "hidden md:flex items-center transition-all duration-300 relative",
              isSearchOpen ? "w-72" : "w-auto"
            )}>
              {isSearchOpen ? (
                <div className="relative w-full">
                  <form onSubmit={handleSearch}>
                    <Input
                      type="text"
                      placeholder="Search movies, genres, directors..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pr-10 bg-secondary/50"
                      autoFocus
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0"
                      onClick={() => {
                        setIsSearchOpen(false);
                        clearSearch();
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </form>
                  
                  {/* Search Results Dropdown */}
                  {showResults && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-xl overflow-hidden z-50">
                      {searchResults.slice(0, 5).map((movie) => (
                        <button
                          key={movie.id}
                          onClick={() => handleSelectMovie(movie.id)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors text-left"
                        >
                          <img
                            src={movie.posterUrl}
                            alt={movie.title}
                            className="w-10 h-14 object-cover rounded"
                          />
                          <div>
                            <p className="font-medium text-foreground">{movie.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {movie.genre.join(', ')} • {movie.duration} min
                            </p>
                          </div>
                        </button>
                      ))}
                      {searchResults.length > 5 && (
                        <button
                          onClick={handleSearch}
                          className="w-full p-3 text-center text-sm text-primary hover:bg-secondary/50 transition-colors"
                        >
                          View all {searchResults.length} results
                        </button>
                      )}
                    </div>
                  )}

                  {showResults && searchQuery && searchResults.length === 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-xl p-4 text-center z-50">
                      <p className="text-muted-foreground text-sm">No movies found for "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchOpen(true)}
                >
                  <Search className="w-5 h-5" />
                </Button>
              )}
            </div>

            {/* Notifications */}
            <NotificationBell />

            {/* User */}
            <Link to="/login">
              <Button variant="ghost" size="icon">
                <User className="w-5 h-5" />
              </Button>
            </Link>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <nav className="flex flex-col gap-4">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search movies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-secondary/50"
                />
              </form>
              
              {/* Mobile Search Results */}
              {searchQuery && searchResults.length > 0 && (
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                  {searchResults.slice(0, 3).map((movie) => (
                    <button
                      key={movie.id}
                      onClick={() => {
                        handleSelectMovie(movie.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors text-left"
                    >
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="w-8 h-12 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium text-foreground text-sm">{movie.title}</p>
                        <p className="text-xs text-muted-foreground">{movie.genre.slice(0, 2).join(', ')}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <Link 
                to="/now-showing" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Now Showing
              </Link>
              <Link 
                to="/?tab=coming-soon" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Coming Soon
              </Link>
              <Link 
                to="/profile" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                My Bookings
              </Link>
              <Link 
                to="/contact" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
