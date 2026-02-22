// Scroll Animation Observer
document.addEventListener('DOMContentLoaded', function() {
    // Create Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all elements with animation classes
    const animatedElements = document.querySelectorAll('.animate-on-scroll, .animate-fade-in-up, .animate-fade-in, .animate-scale-in, .animate-slide-left, .animate-slide-right');
    animatedElements.forEach(el => observer.observe(el));
});

// Lightbox functionality for route images
document.addEventListener('DOMContentLoaded', function() {
    // Create lightbox element
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <button class="lightbox__close" aria-label="Cerrar">&times;</button>
        <div class="lightbox__content">
            <div class="lightbox__image-container">
                <img src="" alt="Imagen ampliada">
            </div>
            <div class="lightbox__controls">
                <button class="lightbox__zoom-in" aria-label="Acercar">
                    <i class="fas fa-search-plus"></i>
                </button>
                <button class="lightbox__zoom-out" aria-label="Alejar">
                    <i class="fas fa-search-minus"></i>
                </button>
                <button class="lightbox__zoom-reset" aria-label="Restablecer">
                    <i class="fas fa-compress-arrows-alt"></i>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(lightbox);

    const lightboxImage = lightbox.querySelector('.lightbox__image-container img');
    const lightboxContainer = lightbox.querySelector('.lightbox__image-container');
    const closeBtn = lightbox.querySelector('.lightbox__close');
    const zoomInBtn = lightbox.querySelector('.lightbox__zoom-in');
    const zoomOutBtn = lightbox.querySelector('.lightbox__zoom-out');
    const zoomResetBtn = lightbox.querySelector('.lightbox__zoom-reset');
    
    // Zoom state
    let currentZoom = 1;
    const zoomLevels = [1, 1.5, 2, 2.5, 3];
    let currentZoomIndex = 0;
    
    // Drag/Pan state
    let isDragging = false;
    let startX, startY;
    let translateX = 0, translateY = 0;
    let currentX = 0, currentY = 0;

    // Reset image state
    function resetImageState() {
        currentZoom = 1;
        currentZoomIndex = 0;
        translateX = 0;
        translateY = 0;
        currentX = 0;
        currentY = 0;
        updateImageTransform();
    }

    // Update image transform based on zoom and position
    function updateImageTransform() {
        lightboxImage.style.transform = `translate(${currentX}px, ${currentY}px) scale(${currentZoom})`;
        
        // Update controls visibility based on zoom level
        if (currentZoom === 1) {
            zoomOutBtn.classList.add('disabled');
            zoomResetBtn.classList.add('disabled');
        } else {
            zoomOutBtn.classList.remove('disabled');
            zoomResetBtn.classList.remove('disabled');
        }
        
        if (currentZoom >= 3) {
            zoomInBtn.classList.add('disabled');
        } else {
            zoomInBtn.classList.remove('disabled');
        }
    }

    // Zoom in function
    function zoomIn() {
        if (currentZoomIndex < zoomLevels.length - 1) {
            currentZoomIndex++;
            currentZoom = zoomLevels[currentZoomIndex];
            updateImageTransform();
        }
    }

    // Zoom out function
    function zoomOut() {
        if (currentZoomIndex > 0) {
            currentZoomIndex--;
            currentZoom = zoomLevels[currentZoomIndex];
            // Reset position when zooming out to level 1
            if (currentZoom === 1) {
                currentX = 0;
                currentY = 0;
            }
            updateImageTransform();
        }
    }

    // Reset zoom
    function resetZoom() {
        currentZoom = 1;
        currentZoomIndex = 0;
        currentX = 0;
        currentY = 0;
        updateImageTransform();
    }

    // Add click event to route images (old gallery images)
    const routeImages = document.querySelectorAll('.gallery-img');
    routeImages.forEach(img => {
        img.addEventListener('click', function() {
            const src = this.getAttribute('src');
            lightboxImage.src = src;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
            resetImageState();
        });
    });

    // Add click event to route card images (new design) - entire container
    const routeCardImageContainers = document.querySelectorAll('.route-card__image');
    routeCardImageContainers.forEach(container => {
        container.addEventListener('click', function(e) {
            // Find the image inside
            const img = this.querySelector('img');
            if (img) {
                const src = img.getAttribute('src');
                lightboxImage.src = src;
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
                resetImageState();
            }
        });
    });

    // Mouse wheel zoom
    lightboxContainer.addEventListener('wheel', function(e) {
        e.preventDefault();
        if (e.deltaY < 0) {
            zoomIn();
        } else {
            zoomOut();
        }
    });

    // Drag functionality - Mouse events
    lightboxContainer.addEventListener('mousedown', function(e) {
        if (currentZoom > 1) {
            isDragging = true;
            startX = e.clientX - currentX;
            startY = e.clientY - currentY;
            lightboxContainer.style.cursor = 'grabbing';
        }
    });

    document.addEventListener('mousemove', function(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - startX;
            currentY = e.clientY - startY;
            updateImageTransform();
        }
    });

    document.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            lightboxContainer.style.cursor = currentZoom > 1 ? 'grab' : 'default';
        }
    });

    // Touch events for mobile drag
    lightboxContainer.addEventListener('touchstart', function(e) {
        if (currentZoom > 1 && e.touches.length === 1) {
            isDragging = true;
            const touch = e.touches[0];
            startX = touch.clientX - currentX;
            startY = touch.clientY - currentY;
        }
    });

    lightboxContainer.addEventListener('touchmove', function(e) {
        if (isDragging && e.touches.length === 1) {
            e.preventDefault();
            const touch = e.touches[0];
            currentX = touch.clientX - startX;
            currentY = touch.clientY - startY;
            updateImageTransform();
        }
    });

    lightboxContainer.addEventListener('touchend', function() {
        isDragging = false;
    });

    // Double click to zoom in/out at specific point
    lightboxContainer.addEventListener('dblclick', function(e) {
        if (currentZoom === 1) {
            zoomIn();
        } else {
            resetZoom();
        }
    });

    // Control buttons
    zoomInBtn.addEventListener('click', zoomIn);
    zoomOutBtn.addEventListener('click', zoomOut);
    zoomResetBtn.addEventListener('click', resetZoom);

    // Close lightbox
    closeBtn.addEventListener('click', closeLightbox);
    
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        resetImageState();
    }
});
