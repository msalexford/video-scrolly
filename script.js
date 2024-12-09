// Initialize scrollama
const scroller = scrollama();

// Select all videos and steps
const videos = document.querySelectorAll(".video-container video");
const steps = document.querySelectorAll(".step");

// Create a map to track video states
const videoStates = new Map();

// Initialize video states and add event listeners
videos.forEach((video) => {
  video.load();
  video.loop = true;
  video.muted = true;
  videoStates.set(video, { isPlaying: false });

  // Add loadeddata event listener
  video.addEventListener("loadeddata", () => {
    if (video === videos[0]) {
      fadeInVideo(video);
      // Activate first step
      steps[0].classList.add("is-active");
    }
  });
});

// Function to handle video transitions
async function handleVideoTransition(newVideo, oldVideo = null) {
  try {
    if (oldVideo) {
      oldVideo.style.opacity = 0;
      await new Promise((resolve) => setTimeout(resolve, 500));
      oldVideo.pause();
    }

    await newVideo.play();
    fadeInVideo(newVideo);
  } catch (error) {
    console.warn("Video transition error:", error);
    try {
      await new Promise((resolve) => setTimeout(resolve, 100));
      await newVideo.play();
      fadeInVideo(newVideo);
    } catch (retryError) {
      console.error("Video playback failed after retry:", retryError);
    }
  }
}

// Function to fade in a video
function fadeInVideo(video) {
  video.style.opacity = 1;
  videoStates.set(video, { isPlaying: true });
}

// Setup the scrollama instance
scroller
  .setup({
    step: ".step",
    offset: 0.5,
    debug: false,
  })
  .onStepEnter(async (response) => {
    // Remove active class from all steps
    steps.forEach((step) => step.classList.remove("is-active"));
    // Add active class to current step
    steps[response.index].classList.add("is-active");

    const currentVideo = videos[response.index];
    const previousVideo = Array.from(videos).find(
      (video) => videoStates.get(video)?.isPlaying && video !== currentVideo
    );

    await handleVideoTransition(currentVideo, previousVideo);
  })
  .onStepExit((response) => {
    // Optional: Handle step exit animations
  });

// Handle browser resize
window.addEventListener("resize", scroller.resize);

// Preload all videos
document.addEventListener("DOMContentLoaded", () => {
  videos.forEach((video) => video.load());
});
