const videos = ["/i10aiwebsite/img/video1.mp4", "/i10aiwebsite/img/video2.mp4"];
let currentVideoIndex = 0;
let activeVideo = document.getElementById("video1");
let nextVideo = document.getElementById("video2");

function swapVideos() {
  currentVideoIndex = (currentVideoIndex + 1) % videos.length;

  nextVideo.src = videos[currentVideoIndex];
  nextVideo.load();

  nextVideo.style.opacity = "1";
  activeVideo.style.opacity = "0";

  let temp = activeVideo;
  activeVideo = nextVideo;
  nextVideo = temp;

  setTimeout(() => {
    nextVideo.pause();
    activeVideo.play();
  }, 2000);
}

activeVideo.addEventListener("ended", swapVideos);
