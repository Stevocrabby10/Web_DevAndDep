// carousel.js — carousel functionality for browsing leagues
// Shows 3 leagues at a time in an infinite loop with seamless wrapping

document.addEventListener('DOMContentLoaded', () => {
  const carousels = [
    { id: 'dublin-carousel', section: 'dublin-leagues' },
    { id: 'galway-carousel', section: 'galway-leagues' },
    { id: 'cork-carousel', section: 'cork-leagues' },
    { id: 'wexford-carousel', section: 'wexford-leagues' }
  ];

  carousels.forEach(carousel => {
    const container = document.getElementById(carousel.id);
    if (!container) return;

    const section = document.getElementById(carousel.section);
    if (!section) return;

    const prevBtn = section.querySelector('.carousel-nav .prev-btn');
    const nextBtn = section.querySelector('.carousel-nav .next-btn');
    const viewport = container.closest('.carousel-viewport');

    if (!prevBtn || !nextBtn || !viewport) return;

    const totalOriginalItems = 5;
    const duplicateOffset = totalOriginalItems; // Duplicates start at index 5
    let currentIndex = 0;

    function updateButtonStates() {
      prevBtn.disabled = false;
      nextBtn.disabled = false;
    }

    function updateCarouselPosition(isImmediate = false) {
      const itemElement = container.children[0];
      if (!itemElement) return;

      const itemWidth = itemElement.offsetWidth;
      const gap = parseFloat(getComputedStyle(container).gap || 0);
      const itemSize = itemWidth + gap;
      
      const position = currentIndex * itemSize;

      if (isImmediate) {
        container.style.transition = 'none';
      } else {
        container.style.transition = 'transform 0.3s ease';
      }
      
      container.style.transform = `translateX(-${position}px)`;

      // If we've moved to duplicates, instantly reset to original position
      if (currentIndex >= duplicateOffset) {
        setTimeout(() => {
          currentIndex = currentIndex - duplicateOffset;
          updateCarouselPosition(true);
        }, 300);
      } else if (currentIndex < 0) {
        setTimeout(() => {
          currentIndex = totalOriginalItems + currentIndex;
          updateCarouselPosition(true);
        }, 300);
      }
    }

    function scrollCarousel(direction) {
      if (direction === 'next') {
        currentIndex++;
      } else if (direction === 'prev') {
        currentIndex--;
      }

      updateCarouselPosition();
      updateButtonStates();
    }

    prevBtn.addEventListener('click', () => scrollCarousel('prev'));
    nextBtn.addEventListener('click', () => scrollCarousel('next'));

    updateButtonStates();
  });
});


