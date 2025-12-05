export interface Movie {
  id: string;
  title: string;
  posterUrl: string;
  genre: string[];
  duration: number;
  rating: string;
  releaseDate: string;
  synopsis: string;
  director: string;
  cast: CastMember[];
  trailerUrl?: string;
}

export interface CastMember {
  name: string;
  role: string;
  imageUrl: string;
}

export interface Cinema {
  id: string;
  name: string;
  address: string;
}

export interface Showtime {
  id: string;
  movieId: string;
  cinemaId: string;
  screenId: string;
  date: string;
  time: string;
  price: number;
}

export interface Screen {
  id: string;
  name: string;
  capacity: number;
  rows: number;
  seatsPerRow: number;
}

export interface Seat {
  id: string;
  row: string;
  number: number;
  status: 'available' | 'selected' | 'booked' | 'reserved';
}

export interface Booking {
  id: string;
  movieId: string;
  movieTitle: string;
  cinemaName: string;
  date: string;
  time: string;
  seats: string[];
  totalPrice: number;
  status: 'confirmed' | 'cancelled' | 'pending';
  createdAt: string;
}

export interface TicketType {
  id: string;
  name: string;
  priceModifier: number;
  description: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin' | 'staff';
}
