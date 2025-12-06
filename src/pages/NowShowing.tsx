import { useState, useMemo } from 'react';
import { CustomerLayout } from '@/components/layout/CustomerLayout';
import { MovieCard } from '@/components/movies/MovieCard';
import { movies } from '@/data/mockData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal, Grid3X3, List, Star, Clock, Calendar } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const NowShowing = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('title');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Extract unique genres
  const allGenres = useMemo(() => {
    const genres = new Set<string>();
    movies.forEach(m => m.genre.forEach(g => genres.add(g)));
    return Array.from(genres).sort();
  }, []);

  // Extract unique ratings
  const allRatings = useMemo(() => {
    const ratings = new Set<string>();
    movies.forEach(m => ratings.add(m.rating));
    return Array.from(ratings).sort();
  }, []);

  // Filter and sort movies
  const filteredMovies = useMemo(() => {
    let result = movies.filter(movie => {
      const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.director.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGenre = selectedGenre === 'all' || movie.genre.includes(selectedGenre);
      const matchesRating = selectedRating === 'all' || movie.rating === selectedRating;
      return matchesSearch && matchesGenre && matchesRating;
    });

    // Sort
    switch (sortBy) {
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'duration':
        result.sort((a, b) => a.duration - b.duration);
        break;
      case 'releaseDate':
        result.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
        break;
      case 'rating':
        result.sort((a, b) => a.rating.localeCompare(b.rating));
        break;
    }

    return result;
  }, [searchQuery, selectedGenre, selectedRating, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedGenre('all');
    setSelectedRating('all');
    setSortBy('title');
  };

  return (
    <CustomerLayout>
      <div className="min-h-screen pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Now Showing</h1>
            <p className="text-muted-foreground">Discover the latest movies playing in theaters</p>
          </div>

          {/* Filter Bar */}
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-4 md:p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search by title or director..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 bg-background/50"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                {/* Genre Filter */}
                <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                  <SelectTrigger className="w-[140px] h-11 bg-background/50">
                    <SelectValue placeholder="Genre" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="all">All Genres</SelectItem>
                    {allGenres.map(genre => (
                      <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Rating Filter */}
                <Select value={selectedRating} onValueChange={setSelectedRating}>
                  <SelectTrigger className="w-[130px] h-11 bg-background/50">
                    <Star className="w-4 h-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Rating" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="all">All Ratings</SelectItem>
                    {allRatings.map(rating => (
                      <SelectItem key={rating} value={rating}>{rating}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Sort By */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[150px] h-11 bg-background/50">
                    <SlidersHorizontal className="w-4 h-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="title">
                      <span className="flex items-center gap-2">Title A-Z</span>
                    </SelectItem>
                    <SelectItem value="duration">
                      <span className="flex items-center gap-2"><Clock className="w-3 h-3" /> Duration</span>
                    </SelectItem>
                    <SelectItem value="releaseDate">
                      <span className="flex items-center gap-2"><Calendar className="w-3 h-3" /> Release Date</span>
                    </SelectItem>
                    <SelectItem value="rating">
                      <span className="flex items-center gap-2"><Star className="w-3 h-3" /> Rating</span>
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* View Toggle */}
                <div className="flex rounded-lg border border-border overflow-hidden">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="icon"
                    className="h-11 w-11 rounded-none"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="icon"
                    className="h-11 w-11 rounded-none"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>

                {/* Clear Filters */}
                {(searchQuery || selectedGenre !== 'all' || selectedRating !== 'all') && (
                  <Button variant="outline" onClick={clearFilters} className="h-11">
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Active Filters */}
            {(searchQuery || selectedGenre !== 'all' || selectedRating !== 'all') && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/50">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {searchQuery && (
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                    "{searchQuery}"
                  </span>
                )}
                {selectedGenre !== 'all' && (
                  <span className="px-3 py-1 rounded-full bg-accent/20 text-accent-foreground text-sm">
                    {selectedGenre}
                  </span>
                )}
                {selectedRating !== 'all' && (
                  <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm">
                    {selectedRating}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              Showing <span className="text-foreground font-medium">{filteredMovies.length}</span> of {movies.length} movies
            </p>
          </div>

          {/* Movie Grid */}
          {filteredMovies.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {filteredMovies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMovies.map((movie) => (
                  <div
                    key={movie.id}
                    className="flex gap-4 p-4 bg-card/50 rounded-xl border border-border hover:border-primary/30 transition-colors"
                  >
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-24 h-36 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-foreground mb-1">{movie.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{movie.director}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {movie.genre.map(g => (
                          <span key={g} className="px-2 py-0.5 rounded-full bg-secondary text-xs text-secondary-foreground">
                            {g}
                          </span>
                        ))}
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                          {movie.rating}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{movie.synopsis}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-sm text-muted-foreground">
                          {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
                        </span>
                        <Button variant="cinema" size="sm">Book Tickets</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-full bg-muted/20 flex items-center justify-center mb-4">
                <Search className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No movies found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
              <Button variant="outline" onClick={clearFilters}>Clear all filters</Button>
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
};

export default NowShowing;
