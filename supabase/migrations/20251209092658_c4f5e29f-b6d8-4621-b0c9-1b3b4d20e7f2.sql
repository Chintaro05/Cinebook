-- Create movies table
CREATE TABLE public.movies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  synopsis TEXT,
  director TEXT,
  cast_members TEXT[],
  genre TEXT[],
  duration INTEGER NOT NULL,
  rating TEXT,
  poster_url TEXT,
  trailer_url TEXT,
  release_date DATE,
  status TEXT NOT NULL DEFAULT 'now_showing',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create screens table
CREATE TABLE public.screens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  rows INTEGER NOT NULL,
  seats_per_row INTEGER NOT NULL,
  vip_rows INTEGER[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create showtimes table
CREATE TABLE public.showtimes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  movie_id UUID NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
  screen_id UUID NOT NULL REFERENCES public.screens(id) ON DELETE CASCADE,
  show_date DATE NOT NULL,
  show_time TIME NOT NULL,
  price NUMERIC NOT NULL DEFAULT 10.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(screen_id, show_date, show_time)
);

-- Enable RLS
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.showtimes ENABLE ROW LEVEL SECURITY;

-- Movies policies (public read, admin write)
CREATE POLICY "Anyone can view movies" ON public.movies FOR SELECT USING (true);
CREATE POLICY "Admins can insert movies" ON public.movies FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update movies" ON public.movies FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete movies" ON public.movies FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Screens policies (public read, admin write)
CREATE POLICY "Anyone can view screens" ON public.screens FOR SELECT USING (true);
CREATE POLICY "Admins can insert screens" ON public.screens FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update screens" ON public.screens FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete screens" ON public.screens FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Showtimes policies (public read, admin write)
CREATE POLICY "Anyone can view showtimes" ON public.showtimes FOR SELECT USING (true);
CREATE POLICY "Admins can insert showtimes" ON public.showtimes FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update showtimes" ON public.showtimes FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete showtimes" ON public.showtimes FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Update triggers
CREATE TRIGGER update_movies_updated_at BEFORE UPDATE ON public.movies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_screens_updated_at BEFORE UPDATE ON public.screens FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_showtimes_updated_at BEFORE UPDATE ON public.showtimes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();