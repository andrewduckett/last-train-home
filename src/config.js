/* ===============================================================
   CONFIG — the only file you need to edit to point at your stuff.
   ---------------------------------------------------------------
   1) GOOGLE MY MAPS:
      Open your map → Share → "Embed on my site" gives an <iframe>.
      Copy the `mid=...` value out of that iframe's src and paste it
      in place of PASTE_YOUR_MY_MAPS_ID_HERE below (BOTH lines).
      (embed = the in-app map; viewer = the "Open in Maps App" button.)
   2) VENTRA / METRA: swap for whatever links you prefer.
   3) GROUP ALBUM: paste the shared photo-album link (e.g. Google Photos
      shared album). Leave the PASTE_… text to hide the album button.
   After editing, run `npm run build` again to regenerate dist/.
   =============================================================== */
export const CONFIG = {
  myMapsEmbedUrl: "https://www.google.com/maps/d/embed?mid=1j-yfShXEfBlLNnzdcv4-btB5G6SLdOI&ehbc=2E312F&noprof=1",
  myMapsAppUrl:   "https://www.google.com/maps/d/viewer?mid=1j-yfShXEfBlLNnzdcv4-btB5G6SLdOI",
  ventraUrl:      "https://www.ventrachicago.com/app/",
  metraUrl:       "https://www.metra.com/schedules?line=UP-NW&allstops=0",
  albumUrl:       "PASTE_YOUR_GROUP_ALBUM_LINK_HERE",
};
