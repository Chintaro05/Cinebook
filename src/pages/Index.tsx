import { CustomerLayout } from '@/components/layout/CustomerLayout';
import { HeroBanner } from '@/components/movies/HeroBanner';
import { MovieCarousel } from '@/components/movies/MovieCarousel';
import { movies } from '@/data/mockData';

const Index = () => {
  return (
    <CustomerLayout>
      {/* Hero Section */}
      <HeroBanner />

      {/* Now Showing */}
      <MovieCarousel 
        title="Now Showing" 
        movies={movies} 
      />

      {/* Coming Soon */}
      <MovieCarousel 
        title="Coming Soon" 
        movies={[...movies].reverse()} 
      />

      {/* Popular This Week */}
      <MovieCarousel 
        title="Popular This Week" 
        movies={movies.slice(0, 4)} 
      />

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
                <li><a href="#" className="hover:text-foreground transition-colors">Now Showing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Coming Soon</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Cinemas</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact Us</a></li>
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
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © 2024 CineBook. All rights reserved.
          </div>
        </div>
      </footer>
    </CustomerLayout>
  );
};

export default Index;
