// script.js

// Initialize scrollama
const scroller = scrollama();

// Select all videos and steps
const videos = document.querySelectorAll(".video-container video");
const steps = document.querySelectorAll(".step");

// Initialize video states
videos.forEach((video) => {
  video.load();
  video.loop = true;
  video.muted = true;
  video.playsinline = true;

  // Add loadeddata event listener for first video
  video.addEventListener("loadeddata", () => {
    if (video === videos[0]) {
      video.style.opacity = 1;
      video.play(); // Start playing the first video immediately
      steps[0].classList.add("is-active");
    }
  });
});

// Preload and prepare next video
function prepareVideo(video) {
  console.log("Preparing video:", video.querySelector("source")?.src);
  return video
    .play()
    .then(() => {
      video.pause(); // Pause it but keep it ready
      video.currentTime = 0; // Reset to start
    })
    .catch((error) => {
      console.error(
        "Video preparation error for source:",
        video.querySelector("source")?.src
      );
      console.error("Video readyState:", video.readyState);
      console.error("Video error message:", video.error?.message);
      console.error("Full error:", error);
    });
}

// Add error event listeners to each video
videos.forEach((video, index) => {
  video.addEventListener("error", (e) => {
    console.error(`Error loading video ${index}:`, video.error);
    console.error("Source:", video.querySelector("source")?.src);
  });
});

// Function to handle video transitions
async function handleVideoTransition(newVideo, oldVideo = null) {
  try {
    // Start playing the new video while it's still invisible
    await newVideo.play();

    // Quick crossfade between videos
    newVideo.style.opacity = 1;

    if (oldVideo) {
      // Keep old video visible briefly during transition
      await new Promise((resolve) => setTimeout(resolve, 50));
      oldVideo.style.opacity = 0;

      // Wait for fade out, then pause old video
      setTimeout(() => {
        oldVideo.pause();
      }, 500);
    }
  } catch (error) {
    console.warn("Video transition error:", error);
  }
}

// Preload all videos when page loads
document.addEventListener("DOMContentLoaded", () => {
  videos.forEach((video, index) => {
    if (index !== 0) {
      // Skip first video as it's already playing
      prepareVideo(video);
    }
  });
});

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

    // Handle video transition
    const currentVideo = videos[response.index];
    const previousVideo = Array.from(videos).find(
      (video) => parseFloat(video.style.opacity) > 0 && video !== currentVideo
    );

    await handleVideoTransition(currentVideo, previousVideo);
  });

// Scroll indicator

// Hide scroll indicator after user starts scrolling
let scrollIndicator = document.querySelector(".scroll-indicator");
let hasScrolled = false;

window.addEventListener(
  "scroll",
  () => {
    if (!hasScrolled) {
      hasScrolled = true;
      scrollIndicator.classList.add("hidden");
    }
  },
  { passive: true }
);

// Show indicator again if user returns to top
window.addEventListener(
  "scroll",
  () => {
    if (window.scrollY === 0) {
      setTimeout(() => {
        hasScrolled = false;
        scrollIndicator.classList.remove("hidden");
      }, 1000);
    }
  },
  { passive: true }
);

// Handle browser resize
window.addEventListener("resize", scroller.resize);
