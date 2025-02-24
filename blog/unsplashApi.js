Access_key = "7_w_WAS9PvbJy9JyG2lfVHdEXTOqqupZvRxpNbbAMvE";
Secret_key = "KQFjtIMIwm_zwSGUAdHB3x_JFFNmAs9lootGAD76wlA";
application_id = "709881";
const addBlogmodal = document.getElementById("addBlogModal");
const blogImg = async function fetchBlogImg() {
  const response = await fetch(
    "https://api.unsplash.com/search/photos?query=artificial_intelligence & client_id=7_w_WAS9PvbJy9JyG2lfVHdEXTOqqupZvRxpNbbAMvE"
  );
  const data = await response.json();
  return data.url.regular;
};
