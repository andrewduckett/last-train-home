/* Event data. Times/venues/tasks all live here so the UI stays generic. */

export const SCHEDULE = [
  { t: "2:45 PM", kind: "arrive",  tag: "Be here by", title: "Meetup — Palatine Station", sub: "137 W. Wood St" },
  { t: "3:05 PM", kind: "warning", tag: "Wrap up",    title: "Head to Inbound Platform",  sub: "Verify Ventra passes" },
  { t: "3:12 PM", kind: "depart",  tag: "Depart",     title: "Depart Palatine",           sub: "Inbound train → Mt. Prospect" },
  { t: "3:25 PM", kind: "stop",    tag: "Arrive at",  title: "Stop 1 · Mt. Prospect Bar Stop", sub: "Station 34" },
  { t: "4:10 PM", kind: "warning", tag: "Wrap up",    title: "Head to Inbound Platform",  sub: "Close out tabs!" },
  { t: "4:21 PM", kind: "depart",  tag: "Depart",     title: "Depart Mt. Prospect",       sub: "Inbound train → Edison Park" },
  { t: "4:45 PM", kind: "stop",    tag: "Arrive at",  title: "Stop 2 · Edison Park Bar Stop", sub: "Edison Park Inn" },
  { t: "5:40 PM", kind: "warning", tag: "Wrap up",    title: "Cross the tracks",          sub: "Head to OUTBOUND platform" },
  { t: "5:50 PM", kind: "depart",  tag: "Depart",     title: "Depart Edison Park",        sub: "Outbound train → Arlington Heights" },
  { t: "6:15 PM", kind: "stop",    tag: "Arrive at",  title: "Stop 3 · Arlington Heights Bar Stop", sub: "Eddie's" },
  { t: "7:00 PM", kind: "warning", tag: "Wrap up",    title: "Head to Outbound Platform", sub: "Close out tabs!" },
  { t: "7:11 PM", kind: "depart",  tag: "Depart",     title: "Depart Arlington Heights",  sub: "Outbound train → Palatine" },
  { t: "7:25 PM", kind: "stop",    tag: "Final Stop", title: "Stop 4 · Palatine Final Landing", sub: "Tap House Grill" },
];

export const VENUES = [
  { stop: "Stop 1", town: "Mt. Prospect", places: [
    { n: "Station 34", a: "34 S Main St" } ] },
  { stop: "Stop 2", town: "Edison Park", places: [
    { n: "Edison Park Inn", a: "6715 N Olmsted Ave" } ] },
  { stop: "Stop 3", town: "Arlington Heights", places: [
    { n: "Eddie's", a: "10 E Northwest Hwy" } ] },
  { stop: "Stop 4", town: "Palatine", places: [
    { n: "Tap House Grill", a: "56 W Wilson St" } ] },
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
