import { BRAND } from "@/constants/brand";

/** Site-wide copy — car rental for tourism, hospitality & leisure travel */
export const MESSAGING = {
  meta: {
    title: "Canvas Tours Africa — Car Rental & Rwanda Travel Packages",
    description:
      "Rent vehicles in Rwanda and book curated tour packages — gorilla trekking, Akagera safari, Lake Kivu, and Kigali transfers. Explore. Experience. Remember.",
    keywords:
      "Canvas Tours Africa, Rwanda car rental, rent a car Rwanda, Kigali car hire, Rwanda safari, gorilla trekking, Akagera, Lake Kivu, Rwanda tour packages, airport transfer Rwanda",
  },

  home: {
    heroTitle: ["Your Journey", "Starts Here"],
    heroSubtitle:
      "Rent the right vehicle for road trips, scenic tours, picnics, hotel transfers, and family getaways — with hospitality-grade service from pickup to return.",
    reserveCta: "Plan Your Trip",
    fleetCta: "Car Rental",
    searchCta: "Find a Vehicle",
    standardTitle: ["The", "Canvas Tours", "Standard"] as const,
    standardSubtitle:
      "Tourism-ready rentals with clear pricing, flexible pickup, and a team that treats every trip like a guest experience.",
    features: [
      {
        title: "Easy Trip Booking",
        desc: "Reserve online for weekends away, airport runs, picnic days, or multi-day tours — confirmation in minutes.",
      },
      {
        title: "Guest Peace of Mind",
        desc: "Comprehensive coverage options and 24/7 support so you can focus on the experience, not the paperwork.",
      },
      {
        title: "Comfort-First Vehicles",
        desc: "Sedans, SUVs, and spacious vehicles chosen for passengers, luggage, and long scenic drives — cleaned before every handover.",
      },
    ],
    fleetTitle: ["Vehicles for", "Every Occasion"],
    fleetSubtitle:
      "From city breaks and coastal drives to group outings and hospitality transfers — find the right fit for your plans.",
    fleetLink: "View All Vehicles",
    testimonialsTitle: ["Loved by", "Travelers"],
    testimonialsSubtitle:
      "Stories from guests who rented for holidays, events, picnics, and business hospitality trips.",
    ctaTitle: "Ready for Your Next Getaway?",
    ctaSubtitle:
      "Tell us your dates and destination vibe — we'll match you with a vehicle and a smooth pickup experience.",
    ctaButton: "Start a Reservation",
  },

  fleet: {
    title: ["Car", "Rental"],
    subtitle:
      "Browse vehicles for your trip — family SUVs, comfortable sedans, and options for group travel, tours, and hospitality.",
  },

  booking: {
    title: ["Plan Your", "Reservation"],
    subtitle: "Share your travel dates, pickup location, and guest details — our team will confirm your rental shortly.",
    confirmed:
      "Thank you. We have your request and will contact you to confirm pickup details and vehicle availability.",
    guestSection: "Guest Details",
  },

  services: {
    process: [
      {
        num: "01",
        title: "Choose Your Vehicle",
        desc: "Browse by group size, luggage, or trip type — weekend escape, picnic day, or extended tour.",
      },
      {
        num: "02",
        title: "Set Your Itinerary",
        desc: "Pick dates, pickup branch, and optional add-ons like chauffeur or hotel delivery.",
      },
      {
        num: "03",
        title: "We Prepare & Deliver",
        desc: "Your vehicle is inspected, cleaned, and ready at your branch or agreed meeting point on time.",
      },
      {
        num: "04",
        title: "Enjoy the Journey",
        desc: "Explore, celebrate, or host — we handle returns and support so your trip stays stress-free.",
      },
    ],
    stats: [
      { value: "150+", label: "Tour-Ready Vehicles" },
      { value: "9", label: "Pickup Locations" },
      { value: "24/7", label: "Guest Support" },
      { value: "4.9★", label: "Guest Rating" },
    ],
    gridSubtitleFallback:
      "Rental and hospitality services for tourism, day trips, events, and comfortable group travel.",
  },

  about: {
    heroTitle: ["Travel &", "Hospitality"],
    heroSubtitle:
      "We combine reliable car rental with guest-first service — built for tourists, families, and hosts who need vehicles that feel welcoming, not transactional.",
    genesis: [
      "Most rentals feel like paperwork. We built Canvas Tours for people who travel to connect — with places, with family, with celebrations, and with the outdoors.",
      "Whether you are planning a coastal road trip, a picnic in the hills, a hotel transfer, or transport for visiting guests, every vehicle is chosen for comfort, cleanliness, and the kind of trip you actually want to take.",
    ],
    workshopTitle: ["Guest-Ready", "Every Time"],
    workshop: [
      "Our team prepares each vehicle like a hospitality suite on wheels — safety checks, interior care, and luggage-friendly setups before every pickup.",
      "From family SUVs to executive sedans, nothing leaves until it meets our guest-ready standard. Your trip deserves a car that feels cared for.",
    ],
    timeline: [
      { year: "2018", title: "The Beginning", desc: "Launched with a small fleet focused on weekend getaways and local tour support." },
      { year: "2020", title: "Tourism & Events", desc: "Expanded into airport transfers, picnic packages, and vehicles for hospitality partners." },
      { year: "2022", title: "Guest Experience Hub", desc: "Opened a dedicated preparation center for inspections, cleaning, and trip-ready handovers." },
      { year: "2024", title: "Regional Network", desc: "Added city and resort pickup points so travelers can start journeys closer to where they stay." },
    ],
    teamTitle: ["People Behind", "Your Trip"],
    teamSubtitle:
      "Hospitality specialists, travel coordinators, and fleet experts united by one goal — make every rental feel effortless.",
    values: [
      { title: "Warm Welcome", desc: "Clear communication, flexible pickup, and support that feels like a concierge desk — not a counter." },
      { title: "Trip-Ready Fleet", desc: "Vehicles maintained for comfort on long drives, group seating, and real-world tourism needs." },
      { title: "Trusted Discretion", desc: "Ideal for private celebrations, VIP guests, and hospitality partners who expect professionalism." },
    ],
    ctaTitle: "Start Your Next Journey",
    ctaButton: "Reserve a Vehicle",
  },

  contact: {
    subtitle:
      "Questions about a road trip, picnic rental, group booking, or hospitality transfer? Our team is here to help.",
  },

  auth: {
    loginSubtitle: `Sign in to manage reservations, saved trips, and guest details with ${BRAND.name}.`,
    signupSubtitle: `Create an account to book faster and keep your travel reservations in one place.`,
  },

  chat: {
    greeting: `Welcome to ${BRAND.name}! I'm your travel concierge. Ask about vehicles, picnic trips, airport pickup, or group rentals.`,
    quickReplies: [
      "View vehicles",
      "Trip packages",
      "Airport pickup",
      "Group & events",
    ],
    responses: {
      "view vehicles":
        "We offer sedans, SUVs, and spacious options for families, tours, and group outings. Visit our Fleet page or tell me your trip type and dates.",
      "trip packages":
        "Daily and weekly rentals for road trips, scenic tours, and picnic days — rates include insurance options and guest support. Want a quote for specific dates?",
      "airport pickup":
        "We provide airport and hotel transfers with flight tracking and meet-and-greet options at major hubs. Which airport and arrival time?",
      "group & events":
        "Perfect for weddings, corporate hospitality, and group picnics. We can arrange multiple vehicles or chauffeur support — share your guest count and dates.",
      default:
        "Happy to help plan your trip. Choose a topic below or tell me your dates and destination — I'll point you to the right vehicle and service.",
    },
  },
} as const;
