const carousel = document.getElementById("carousel");
let currentIndex = 0;
const totalImages = carousel.children.length;

// Auto-scroll every 4 seconds
setInterval(() => {
  currentIndex = (currentIndex + 1) % totalImages;
  carousel.scrollTo({
    left: carousel.clientWidth * currentIndex,
    behavior: "smooth"
  });
}, 4000);