-- Create a secure function to process bookings with server-side price calculation
CREATE OR REPLACE FUNCTION public.create_secure_booking(
  p_showtime_id UUID,
  p_seats TEXT[],
  p_payment_method TEXT,
  p_card_last_four TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_showtime RECORD;
  v_movie RECORD;
  v_screen RECORD;
  v_seat_count INTEGER;
  v_subtotal NUMERIC;
  v_service_fee NUMERIC := 2.50;
  v_total NUMERIC;
  v_booking_id UUID;
  v_transaction_id TEXT;
BEGIN
  -- Get the authenticated user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to create a booking';
  END IF;

  -- Validate seats array
  v_seat_count := array_length(p_seats, 1);
  IF v_seat_count IS NULL OR v_seat_count < 1 THEN
    RAISE EXCEPTION 'At least one seat must be selected';
  END IF;

  IF v_seat_count > 10 THEN
    RAISE EXCEPTION 'Maximum 10 seats per booking';
  END IF;

  -- Get showtime details from database (server-side, trusted)
  SELECT * INTO v_showtime FROM showtimes WHERE id = p_showtime_id;
  IF v_showtime IS NULL THEN
    RAISE EXCEPTION 'Showtime not found';
  END IF;

  -- Get movie details
  SELECT * INTO v_movie FROM movies WHERE id = v_showtime.movie_id;
  IF v_movie IS NULL THEN
    RAISE EXCEPTION 'Movie not found';
  END IF;

  -- Get screen details
  SELECT * INTO v_screen FROM screens WHERE id = v_showtime.screen_id;
  IF v_screen IS NULL THEN
    RAISE EXCEPTION 'Screen not found';
  END IF;

  -- Calculate total on server side (TRUSTED calculation)
  v_subtotal := v_showtime.price * v_seat_count;
  v_total := v_subtotal + v_service_fee;

  -- Validate payment method
  IF p_payment_method NOT IN ('Credit Card', 'E-Wallet') THEN
    RAISE EXCEPTION 'Invalid payment method';
  END IF;

  -- Generate transaction ID
  v_transaction_id := 'TXN' || floor(extract(epoch from now()) * 1000)::text;

  -- Create booking with server-calculated amount
  INSERT INTO bookings (
    user_id,
    movie_id,
    movie_title,
    cinema_name,
    screen_name,
    showtime_date,
    showtime_time,
    seats,
    total_price,
    status
  ) VALUES (
    v_user_id,
    v_movie.id::text,
    v_movie.title,
    'CineBook Cinema',
    v_screen.name,
    v_showtime.show_date,
    v_showtime.show_time,
    p_seats,
    v_total,
    'confirmed'
  )
  RETURNING id INTO v_booking_id;

  -- Create payment record with server-calculated amount
  INSERT INTO payments (
    user_id,
    booking_id,
    amount,
    payment_method,
    card_last_four,
    status,
    transaction_id
  ) VALUES (
    v_user_id,
    v_booking_id,
    v_total,
    p_payment_method,
    p_card_last_four,
    'completed',
    v_transaction_id
  );

  -- Return booking details
  RETURN json_build_object(
    'booking_id', v_booking_id,
    'total', v_total,
    'transaction_id', v_transaction_id,
    'movie_title', v_movie.title,
    'movie_poster_url', v_movie.poster_url,
    'movie_rating', v_movie.rating,
    'screen_name', v_screen.name,
    'show_date', v_showtime.show_date,
    'show_time', v_showtime.show_time,
    'seats', p_seats
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_secure_booking TO authenticated;