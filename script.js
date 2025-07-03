document.addEventListener("DOMContentLoaded", () => {
  const track = document.getElementById("carousel-track");
  const slides = track.querySelectorAll(".carousel-image");
  let index = 0;
  let isHovered = false;

  function showSlide(i) {
    const width = track.clientWidth;
    track.scrollTo({
      left: i * width,
      behavior: "smooth"
    });
  }

  function nextSlide() {
    if (isHovered) return;
    index = (index + 1) % slides.length;
    showSlide(index);
  }

  const interval = setInterval(nextSlide, 3000);

  // Pause on hover
  track.addEventListener("mouseenter", () => isHovered = true);
  track.addEventListener("mouseleave", () => isHovered = false);
});