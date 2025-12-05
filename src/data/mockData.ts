import { Movie, Cinema, Showtime, Screen, Booking, TicketType } from '@/types/movie';

export const movies: Movie[] = [
  {
    id: '1',
    title: 'Inception',
    posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop',
    genre: ['Sci-Fi', 'Action', 'Thriller'],
    duration: 148,
    rating: 'PG-13',
    releaseDate: '2010-07-16',
    synopsis: 'A skilled thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    director: 'Christopher Nolan',
    cast: [
      { name: 'Leonardo DiCaprio', role: 'Dom Cobb', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
      { name: 'Marion Cotillard', role: 'Mal', imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face' },
      { name: 'Tom Hardy', role: 'Eames', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face' },
    ],
    trailerUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
  },
  {
    id: '2',
    title: 'The Dark Knight',
    posterUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=600&fit=crop',
    genre: ['Action', 'Crime', 'Drama'],
    duration: 152,
    rating: 'PG-13',
    releaseDate: '2008-07-18',
    synopsis: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    director: 'Christopher Nolan',
    cast: [
      { name: 'Christian Bale', role: 'Bruce Wayne', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face' },
      { name: 'Heath Ledger', role: 'Joker', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face' },
    ],
  },
  {
    id: '3',
    title: 'Interstellar',
    posterUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&h=600&fit=crop',
    genre: ['Sci-Fi', 'Adventure', 'Drama'],
    duration: 169,
    rating: 'PG-13',
    releaseDate: '2014-11-07',
    synopsis: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
    director: 'Christopher Nolan',
    cast: [
      { name: 'Matthew McConaughey', role: 'Cooper', imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=face' },
      { name: 'Anne Hathaway', role: 'Brand', imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face' },
    ],
  },
  {
    id: '4',
    title: 'Dune',
    posterUrl: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&h=600&fit=crop',
    genre: ['Sci-Fi', 'Adventure'],
    duration: 155,
    rating: 'PG-13',
    releaseDate: '2021-10-22',
    synopsis: 'A noble family becomes embroiled in a war for control over the galaxy\'s most valuable asset while its heir becomes troubled by visions of a dark future.',
    director: 'Denis Villeneuve',
    cast: [
      { name: 'Timothée Chalamet', role: 'Paul Atreides', imageUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=100&h=100&fit=crop&crop=face' },
    ],
  },
  {
    id: '5',
    title: 'Avatar: The Way of Water',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=600&fit=crop',
    genre: ['Sci-Fi', 'Action', 'Adventure'],
    duration: 192,
    rating: 'PG-13',
    releaseDate: '2022-12-16',
    synopsis: 'Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns to finish what was previously started, Jake must work with Neytiri and the army of the Na\'vi race to protect their home.',
    director: 'James Cameron',
    cast: [],
  },
  {
    id: '6',
    title: 'Oppenheimer',
    posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop',
    genre: ['Biography', 'Drama', 'History'],
    duration: 180,
    rating: 'R',
    releaseDate: '2023-07-21',
    synopsis: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
    director: 'Christopher Nolan',
    cast: [
      { name: 'Cillian Murphy', role: 'J. Robert Oppenheimer', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
    ],
  },
];

export const cinemas: Cinema[] = [
  { id: '1', name: 'CineMax Downtown', address: '123 Main St, Downtown' },
  { id: '2', name: 'Cinema Plaza', address: '456 Oak Ave, Midtown' },
  { id: '3', name: 'Luxury Screens', address: '789 Pine Blvd, Uptown' },
];

export const screens: Screen[] = [
  { id: '1', name: 'Screen 1', capacity: 100, rows: 10, seatsPerRow: 10 },
  { id: '2', name: 'Screen 2', capacity: 150, rows: 10, seatsPerRow: 15 },
  { id: '3', name: 'VIP Screen', capacity: 50, rows: 5, seatsPerRow: 10 },
];

export const showtimes: Showtime[] = [
  { id: '1', movieId: '1', cinemaId: '1', screenId: '1', date: '2024-12-20', time: '10:00 AM', price: 12.50 },
  { id: '2', movieId: '1', cinemaId: '1', screenId: '1', date: '2024-12-20', time: '1:30 PM', price: 12.50 },
  { id: '3', movieId: '1', cinemaId: '1', screenId: '2', date: '2024-12-20', time: '4:45 PM', price: 14.00 },
  { id: '4', movieId: '1', cinemaId: '1', screenId: '1', date: '2024-12-20', time: '7:15 PM', price: 15.00 },
  { id: '5', movieId: '1', cinemaId: '1', screenId: '2', date: '2024-12-20', time: '10:00 PM', price: 15.00 },
  { id: '6', movieId: '1', cinemaId: '2', screenId: '1', date: '2024-12-21', time: '2:00 PM', price: 13.00 },
];

export const ticketTypes: TicketType[] = [
  { id: '1', name: 'Adult', priceModifier: 1.0, description: 'Standard adult ticket' },
  { id: '2', name: 'Child', priceModifier: 0.7, description: 'Children under 12' },
  { id: '3', name: 'Student', priceModifier: 0.85, description: 'Valid student ID required' },
  { id: '4', name: 'Senior', priceModifier: 0.8, description: 'Seniors 65+' },
];

export const bookings: Booking[] = [
  {
    id: '1',
    movieId: '1',
    movieTitle: 'Inception',
    cinemaName: 'CineMax Downtown',
    date: '2024-12-15',
    time: '7:15 PM',
    seats: ['A1', 'A2'],
    totalPrice: 30.00,
    status: 'confirmed',
    createdAt: '2024-12-10',
  },
  {
    id: '2',
    movieId: '2',
    movieTitle: 'The Dark Knight',
    cinemaName: 'Cinema Plaza',
    date: '2024-12-18',
    time: '4:30 PM',
    seats: ['C5', 'C6', 'C7'],
    totalPrice: 45.00,
    status: 'confirmed',
    createdAt: '2024-12-12',
  },
];

export const generateSeats = (rows: number, seatsPerRow: number): { row: string; number: number; status: 'available' | 'booked' | 'reserved' }[] => {
  const seats: { row: string; number: number; status: 'available' | 'booked' | 'reserved' }[] = [];
  const rowLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  for (let r = 0; r < rows; r++) {
    for (let s = 1; s <= seatsPerRow; s++) {
      const random = Math.random();
      let status: 'available' | 'booked' | 'reserved' = 'available';
      if (random < 0.2) status = 'booked';
      else if (random < 0.25) status = 'reserved';
      
      seats.push({
        row: rowLabels[r],
        number: s,
        status,
      });
    }
  }
  return seats;
};
