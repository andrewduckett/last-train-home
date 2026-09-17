/* Event data. Times/venues/tasks all live here so the UI stays generic. */

export const SCHEDULE = [
  { t: "1:45 PM", kind: "arrive", tag: "Be here by", title: "Meetup — Palatine Station", sub: "137 W. Wood St" },
  { t: "2:15 PM", kind: "depart", tag: "Depart",     title: "Depart Palatine",           sub: "Inbound train → Mt. Prospect" },
  { t: "2:25 PM", kind: "stop",   tag: "Be here by", title: "Stop 1 · Mt. Prospect Bar Stop" },
  { t: "3:42 PM", kind: "depart", tag: "Depart",     title: "Depart Mt. Prospect",       sub: "Inbound train → Edison Park" },
  { t: "4:00 PM", kind: "stop",   tag: "Be here by", title: "Stop 2 · Edison Park Bar Stop" },
  { t: "5:15 PM", kind: "depart", tag: "Depart",     title: "Depart Edison Park",        sub: "Outbound train → Arlington Heights" },
  { t: "5:40 PM", kind: "stop",   tag: "Be here by", title: "Stop 3 · Arlington Heights Bar Stop" },
  { t: "6:58 PM", kind: "depart", tag: "Depart",     title: "Depart Arlington Heights",  sub: "Outbound train → Palatine" },
  { t: "7:10 PM", kind: "stop",   tag: "Be here by", title: "Stop 4 · Palatine Final Landing" },
];

export const VENUES = [
  { stop: "Stop 1", town: "Mt. Prospect", places: [
    { n: "Whiskey Hill Brewery", a: "99 W Prospect Ave" },
    { n: "Mrs P & Me",           a: "100 E Prospect Ave" } ] },
  { stop: "Stop 2", town: "Edison Park", places: [
    { n: "Edison Park Inn", a: "6715 N Olmsted Ave" },
    { n: "Emerald Isle",    a: "6686 N Northwest Hwy" } ] },
  { stop: "Stop 3", town: "Arlington Heights", places: [
    { n: "Cortland's Garage", a: "1 N Vail Ave" } ] },
  { stop: "Stop 4", town: "Palatine", places: [
    { n: "Tap House Grill", a: "56 W Wilson St" },
    { n: "Lamplighter Inn", a: "60 N Bothwell St" } ] },
];

export const SCAVENGER = [
  { id: "sh-selfie",    t: "The Platform Selfie",  p: 10, d: "Group selfie under an official Metra station name sign." },
  { id: "sh-toast",     t: "Train Car Toast",      p: 10, d: "Toast together while the train is moving." },
  { id: "sh-tap",       t: "Local Tap Takeover",   p: 10, d: "Order a drink brewed in, from, or named for the town you're in." },
  { id: "sh-stranger",  t: "Cheers to a Stranger", p: 10, d: "Clink glasses with someone outside the crawl group." },
  { id: "sh-wave",      t: "The Conductor Wave",   p: 10, d: "Get a Metra conductor to wave back at you." },
  { id: "sh-landmark",  t: "Historic Landmark",    p: 10, d: "Snap a photo with a landmark or historic sign near a stop." },
  { id: "sh-photobomb", t: "Bonus Photobomb",      p: 25, d: "Have a fellow crawler sneak a photobomb into a stranger's photo." },
];

export const SCAVENGER_RULES = [
  "Every challenge only counts as a photo posted to the shared group album.",
  "Tick each one off here once you've uploaded it to see your tally.",
];

export const LINE = "Palatine → Mt. Prospect → Edison Park → Arlington Heights → Palatine";
