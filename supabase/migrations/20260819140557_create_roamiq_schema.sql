/*
# RoamIQ — saved items & planned trips (single-tenant, no auth)

1. Purpose
   RoamIQ is a hackathon prototype with no sign-in screen. Users save favourite
   places/hotels/activities and store AI-generated itineraries locally to the
   shared database so they persist across reloads. Data is intentionally public
   within this prototype instance.

2. New Tables
   - `saved_items` — a bookmarked place/hotel/activity/provider/restaurant.
     - `id` uuid PK
     - `item_type` text (place | hotel | activity | provider | restaurant)
     - `item_id` text (references the in-app sample data id)
     - `name` text
     - `image` text (image url)
     - `category` text (display label)
     - `location` text
     - `saved_at` timestamptz default now()
   - `saved_trips` — a generated AI itinerary saved by the user.
     - `id` uuid PK
     - `title` text
     - `preferences` jsonb (TripPreferences object)
     - `days` jsonb (array of ItineraryDay objects)
     - `total_cost` numeric default 0
     - `created_at` timestamptz default now()

3. Security
   - RLS enabled on both tables.
   - No sign-in screen in this prototype, so policies are `TO anon, authenticated`
     with `USING (true)` / `WITH CHECK (true)` because the data is intentionally
     shared/public within the prototype instance.

4. Notes
   - `item_id` is a text reference to in-app sample data (not a FK) because places,
     hotels etc. live as typed sample data in the frontend for this prototype.
   - Idempotent and safe to re-run.
*/

CREATE TABLE IF NOT EXISTS saved_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_type text NOT NULL,
  item_id text NOT NULL,
  name text NOT NULL,
  image text,
  category text,
  location text,
  saved_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_saved_items" ON saved_items;
CREATE POLICY "anon_select_saved_items" ON saved_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_saved_items" ON saved_items;
CREATE POLICY "anon_insert_saved_items" ON saved_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_saved_items" ON saved_items;
CREATE POLICY "anon_update_saved_items" ON saved_items FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_saved_items" ON saved_items;
CREATE POLICY "anon_delete_saved_items" ON saved_items FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS saved_trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  preferences jsonb NOT NULL,
  days jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_cost numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE saved_trips ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_saved_trips" ON saved_trips;
CREATE POLICY "anon_select_saved_trips" ON saved_trips FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_saved_trips" ON saved_trips;
CREATE POLICY "anon_insert_saved_trips" ON saved_trips FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_saved_trips" ON saved_trips;
CREATE POLICY "anon_delete_saved_trips" ON saved_trips FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS saved_items_item_id_idx ON saved_items(item_id);
CREATE INDEX IF NOT EXISTS saved_trips_created_at_idx ON saved_trips(created_at desc);
