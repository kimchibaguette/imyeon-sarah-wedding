(() => {
  const photos = Array.isArray(window.WEDDING_PHOTOS) ? window.WEDDING_PHOTOS : [];
  const grid = document.querySelector("#galleryGrid");
  const filters = document.querySelector("#filters");
  const loadMore = document.querySelector("#loadMore");
  const lightbox = document.querySelector("#lightbox");
  const lightboxImage = document.querySelector("#lightboxImage");
  const lightboxCaption = document.querySelector("#lightboxCaption");
  let activeCategory = "All";
  let visibleCount = 9;
  let visiblePhotos = [];
  let currentIndex = 0;

  if (photos.length) {
    document.querySelector("#heroImage").src = photos[0].src;
    document.querySelector("#featuredImage").src = (photos[1] || photos[0]).src;
  }

  const categories = ["All", ...new Set(photos.map(photo => photo.category))];
  categories.forEach(category => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `filter${category === "All" ? " active" : ""}`;
    button.textContent = category;
    button.addEventListener("click", () => {
      activeCategory = category;
      visibleCount = 9;
      document.querySelectorAll(".filter").forEach(item => item.classList.toggle("active", item === button));
      renderGallery();
    });
    filters.appendChild(button);
  });

  function filteredPhotos() {
    return activeCategory === "All" ? photos : photos.filter(photo => photo.category === activeCategory);
  }

  function renderGallery() {
    const chosen = filteredPhotos();
    visiblePhotos = chosen.slice(0, visibleCount);
    grid.replaceChildren(...visiblePhotos.map((photo, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "gallery-item";
      button.dataset.caption = photo.caption;
      button.style.setProperty("--ratio", photo.ratio || "4 / 5");
      button.setAttribute("aria-label", `Open photograph: ${photo.caption}`);
      const image = document.createElement("img");
      image.src = photo.src;
      image.alt = photo.alt || photo.caption;
      image.loading = index < 4 ? "eager" : "lazy";
      image.decoding = "async";
      button.appendChild(image);
      button.addEventListener("click", () => openLightbox(index));
      return button;
    }));
    loadMore.hidden = visibleCount >= chosen.length;
  }

  function openLightbox(index) {
    currentIndex = index;
    updateLightbox();
    lightbox.showModal();
    document.body.classList.add("lightbox-open");
  }

  function updateLightbox() {
    const photo = visiblePhotos[currentIndex];
    lightboxImage.src = photo.src;
    lightboxImage.alt = photo.alt || photo.caption;
    lightboxCaption.textContent = `${String(currentIndex + 1).padStart(2, "0")} / ${String(visiblePhotos.length).padStart(2, "0")} — ${photo.caption}`;
  }

  function move(direction) {
    currentIndex = (currentIndex + direction + visiblePhotos.length) % visiblePhotos.length;
    updateLightbox();
  }

  loadMore.addEventListener("click", () => { visibleCount += 12; renderGallery(); });
  document.querySelector(".lightbox-close").addEventListener("click", () => lightbox.close());
  document.querySelector(".previous").addEventListener("click", () => move(-1));
  document.querySelector(".next").addEventListener("click", () => move(1));
  lightbox.addEventListener("close", () => document.body.classList.remove("lightbox-open"));
  lightbox.addEventListener("click", event => { if (event.target === lightbox) lightbox.close(); });
  document.addEventListener("keydown", event => {
    if (!lightbox.open) return;
    if (event.key === "ArrowLeft") move(-1);
    if (event.key === "ArrowRight") move(1);
  });

  const menuButton = document.querySelector(".menu-button");
  const menu = document.querySelector("#menu");
  menuButton.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(open));
  });
  menu.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    menu.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  }));
  document.querySelector("#backToTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  window.addEventListener("load", () => setTimeout(() => document.querySelector("#loader").classList.add("hidden"), 350));
  setTimeout(() => document.querySelector("#loader").classList.add("hidden"), 2200);
  renderGallery();
})();
