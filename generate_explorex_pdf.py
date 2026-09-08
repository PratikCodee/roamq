from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

sections = [
    ("ExploreX — Real Product Blueprint", 'title'),
    ("1. Product Vision", 'heading1'),
    ("ExploreX is a location-aware discovery and booking platform for local experiences in Ratnagiri. It helps travelers find hotels, food, activities, and local providers based on time, budget, group size, distance, and accessibility. The platform also helps local businesses reach relevant travelers and convert demand into bookings.", 'body'),
    ("2. Core User Journeys", 'heading1'),
    ("Traveler flow: Search by destination, activity, food, hotel, or provider; filter by budget, duration, traveler type, and accessibility; compare matches; save trips; complete booking; receive confirmations.", 'body'),
    ("Provider flow: Sign up as hotel, restaurant, guide, or activity operator; add a listing with timings, price, capacity, and media; manage bookings and availability; respond to traveler inquiries.", 'body'),
    ("3. MVP Scope for Ratnagiri", 'heading1'),
    ("- 1 destination: Ratnagiri\n- 3 modules: discovery, booking, itinerary planning\n- 2 user roles: traveler and provider\n- 5 business categories: hotels, restaurants, activities, local guides, events\n- live booking flow for a limited catalog of businesses", 'body'),
    ("4. Recommended Architecture", 'heading1'),
    ("Frontend: React + Vite + TypeScript + Tailwind + maps + booking flow. Backend: Node.js or Next.js API + Supabase/PostgreSQL + Auth + real-time updates. Integrations: Stripe or Razorpay for payments, Cloudinary for media, Mapbox/Leaflet for location, Gmail/WhatsApp notifications.", 'body'),
    ("5. Database Schema", 'heading1'),
    ("Users: id, name, email, role, city, phone. Providers: id, user_id, business_name, type, location, lat/lng, rating, status. Listings: id, provider_id, category, title, description, price, currency, duration, capacity, hours, tags, photos, active. Bookings: id, listing_id, traveler_id, provider_id, start_time, guests, total_amount, payment_status, booking_status. Reviews: id, listing_id, traveler_id, rating, comment. Itineraries: id, traveler_id, title, days, items, total_cost.", 'body'),
    ("6. Real Booking Workflow", 'heading1'),
    ("1. Traveler searches and filters a listing. 2. Traveler sees real availability and pricing. 3. Traveler selects a slot and quantity. 4. System creates a pending booking. 5. Payment is captured. 6. Booking becomes confirmed. 7. Provider gets a booking alert. 8. Traveler gets confirmation and trip details.", 'body'),
    ("7. MVP Features to Build First", 'heading1'),
    ("- Search and category filters\n- Listing detail page\n- Booking calendar and slot selection\n- Payment gateway\n- Provider dashboard\n- Wishlist and save-to-trip\n- Ratings/reviews\n- Map-based discovery\n- AI itinerary planning and smart recommendations", 'body'),
    ("8. Suggested Roadmap", 'heading1'),
    ("Phase 1: MVP (1 city, 10-20 listings, booking basics, provider dashboard, payment, auth)\nPhase 2: Intelligence (recommendations, weather and time logic, live inventory, review analytics)\nPhase 3: Scale (multi-city, local experiences, community partners, premium plans)", 'body'),
    ("9. Suggested Ratnagiri Business Dataset", 'heading1'),
    ("- Beach hotels and homestays around Ganpatipule and Mandavi\n- Restaurants and seafood stalls in Ratnagiri city and Ganpatipule\n- Fort and heritage tours\n- Trekking, kayaking, and boating operators\n- Mango farm visits and local village experiences\n- Local food trail and culture walks\n- Coastal photography and artisan workshops", 'body'),
    ("10. Business Model Ideas", 'heading1'),
    ("- Commission on bookings\n- Featured provider plans\n- Premium traveler subscriptions\n- Bundled local experiences\n- Festival and seasonal packages\n- Business analytics dashboard\n- Sponsored local storytelling campaigns", 'body'),
    ("11. Hackathon Pitch Angle", 'heading1'),
    ("ExploreX is stronger than a travel listing app because it combines discovery, personalization, and transactions in one flow: it helps travelers choose the right experiences while helping local businesses reach highly relevant customers.", 'body'),
    ("12. Next Steps to Turn This Into a Real Product", 'heading1'),
    ("1. Set up Supabase schema and auth. 2. Replace fake data with provider records. 3. Add real booking tables and payment flow. 4. Create provider management dashboard. 5. Validate with 10-20 real local listings. 6. Add AI recommendations and personalized filtering. 7. Launch pilot for Ratnagiri users.", 'body'),
    ("13. Final Recommendation", 'heading1'),
    ("Keep the MVP focused on one city, one booking flow, and a few core provider types. Once validated, expand to more categories, communities, and geographies.", 'body'),
    ("14. Quick Execution Plan", 'heading1'),
    ("Week 1: schema + auth + admin + listing data. Week 2: booking UI + payment flow + provider dashboard. Week 3: AI itinerary recommendation engine + map features. Week 4: pilot testing, feedback, and pitch polish.", 'body'),
    ("15. Suggested Ideas for the Project", 'heading1'),
    ("- Local food trail planner\n- Family-friendly day itinerary generator\n- Hidden gem discovery engine\n- Booking+review ecosystem for small local businesses\n- Festival and seasonal event recommendations\n- AI concierge for traveler preferences\n- Accessibility-first trip matching\n- Micro-communities of local creators and guides", 'body'),
]

styles = getSampleStyleSheet()
custom = {
    'title': ParagraphStyle('Title', parent=styles['Title'], fontName='Helvetica-Bold', fontSize=20, leading=24, textColor='#0F172A', spaceAfter=18),
    'heading1': ParagraphStyle('Heading1', parent=styles['Heading1'], fontName='Helvetica-Bold', fontSize=15, leading=18, textColor='#1E293B', spaceBefore=10, spaceAfter=8),
    'body': ParagraphStyle('BodyText', parent=styles['BodyText'], fontName='Helvetica', fontSize=10.5, leading=15, textColor='#111827', spaceAfter=7),
}

story = []
for text, key in sections:
    story.append(Paragraph(text, custom[key]))
    story.append(Spacer(1, 6))

pdf_path = 'ExploreX_Product_Blueprint.pdf'
doc = SimpleDocTemplate(pdf_path, pagesize=A4, leftMargin=0.7 * inch, rightMargin=0.7 * inch, topMargin=0.7 * inch, bottomMargin=0.7 * inch)
doc.build(story)
print(pdf_path)
