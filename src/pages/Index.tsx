import { useSearchParams, Link } from 'react-router-dom';
import { CustomerLayout } from '@/components/layout/CustomerLayout';
import { HeroBanner } from '@/components/movies/HeroBanner';
import { MovieCarousel } from '@/components/movies/MovieCarousel';
import { MovieCard } from '@/components/movies/MovieCard';
import { movies } from '@/data/mockData';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  // Filter movies based on search query
  const filteredMovies = searchQuery ? movies.filter(movie => movie.title.toLowerCase().includes(searchQuery.toLowerCase()) || movie.genre.some(g => g.toLowerCase().includes(searchQuery.toLowerCase())) || movie.director?.toLowerCase().includes(searchQuery.toLowerCase())) : null;
  const clearSearch = () => {
    setSearchParams({});
  };
  return <CustomerLayout>
      {/* Show search results or normal content */}
      {searchQuery ? <div className="pt-24 pb-12 min-h-screen">
          <div className="container mx-auto px-4">
            {/* Search Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Search className="w-4 h-4" />
                  <span>Search results for</span>
                </div>
                <h1 className="text-3xl font-bold text-foreground">"{searchQuery}"</h1>
                <p className="text-muted-foreground mt-1">
                  {filteredMovies?.length || 0} {filteredMovies?.length === 1 ? 'movie' : 'movies'} found
                </p>
              </div>
              <Button variant="outline" onClick={clearSearch} className="gap-2">
                <X className="w-4 h-4" />
                Clear Search
              </Button>
            </div>

            {/* Search Results */}
            {filteredMovies && filteredMovies.length > 0 ? <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredMovies.map(movie => <MovieCard key={movie.id} movie={movie} />)}
              </div> : <div className="text-center py-20">
                <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">No movies found</h2>
                <p className="text-muted-foreground mb-6">
                  We couldn't find any movies matching "{searchQuery}". Try a different search term.
                </p>
                <Button variant="cinema" onClick={clearSearch}>
                  Browse All Movies
                </Button>
              </div>}
          </div>
        </div> : <>
          {/* Hero Section */}
          <HeroBanner />

          {/* Now Showing */}
          <MovieCarousel title="Now Showing" movies={movies} />

          {/* Coming Soon */}
          <MovieCarousel title="Coming Soon" movies={[...movies].reverse()} />

          {/* Popular This Week */}
          <MovieCarousel title="Popular This Week" movies={movies.slice(0, 4)} />

          {/* Footer */}
          <footer className="py-12 border-t border-border bg-cinema-dark">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                  <h4 className="font-semibold text-foreground mb-4">CineBook</h4>
                  <p className="text-sm text-muted-foreground">
                    Your premium destination for movie ticket booking.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><Link to="/" className="hover:text-foreground transition-colors">Now Showing</Link></li>
                    <li><Link to="/?tab=coming-soon" className="hover:text-foreground transition-colors">Coming Soon</Link></li>
                    <li><Link to="/profile" className="hover:text-foreground transition-colors">My Bookings</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-4">Support</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact Us</Link></li>
                    <li><Link to="/contact" className="hover:text-foreground transition-colors">Report an Issue</Link></li>
                    <li><a href="#" className="hover:text-foreground transition-colors">FAQs</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-4">Legal</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                    <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                  </ul>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">© 2024 CineBook. All rights reserved by Group 10.</div>
            </div>
          </footer>
        </>}
    </CustomerLayout>;
};
export default Index;