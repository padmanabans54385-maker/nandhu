// ==========================================
// ⚙️ SITE CONFIGURATION
// Easily change these values to customize the website!
// ==========================================
const SITE_CONFIG = {
    // 📸 Photo Gallery Images
    // You can add as many images as you want. 
    // They will appear from top to bottom in the stack.
    gallery: [
        { src: 'https://picsum.photos/id/1011/600/800'},
        { src: 'https://picsum.photos/id/1062/600/800'},
        { src: 'https://picsum.photos/id/1025/600/800'},
        { src: 'https://picsum.photos/id/177/600/800'},
        { src: 'https://picsum.photos/id/668/600/800'},
        { src: 'https://picsum.photos/id/856/600/800'}
    ],

    // 💌 Special Note Message
    message: {
        heading: 'My Dearest,',
        body: 'Happy birthday to the person who makes my world brighter! I am so incredibly lucky to have you in my life. You bring so much joy, love, and laughter to my heart. May this year bring you all the happiness and success you deserve. I love you more than words can say. ❤️',
        signature: '- With all my love'
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // 1. Particle Background System
    const particlesContainer = document.getElementById('particles');
    const particleCount = 40;

    for (let i = 0; i < particleCount; i++) {
        createParticle();
    }

    function createParticle() {
        const particle = document.createElement('div');
        particle.classList.add('particle');

        // Randomize starting properties
        const startPosX = Math.random() * 100; // vw
        const delay = Math.random() * 15; // seconds
        const duration = 10 + Math.random() * 10; // 10 to 20 seconds
        const size = Math.random() * 4 + 1; // 1 to 5 px

        particle.style.left = `${startPosX}vw`;
        particle.style.animationDelay = `${delay}s`;
        particle.style.animationDuration = `${duration}s`;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;

        particlesContainer.appendChild(particle);

        // Remove and recreate particle when animation finishes
        particle.addEventListener('animationend', () => {
            particle.remove();
            createParticle();
        });
    }

    // 2. Populate Card Stack from Config
    const cardStack = document.getElementById('card-stack');

    if (cardStack) {
        // Generate cards from config mapping
        SITE_CONFIG.gallery.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'swipe-card';

            card.innerHTML = `
                <img src="${item.src}" alt="Memory ${index + 1}" style="opacity: 0; transition: opacity 0.5s ease;">
                <div class="gallery-overlay">
                    <span>${item.caption}</span>
                </div>
            `;

            // Add loading effect
            const img = card.querySelector('img');
            img.onload = () => img.style.opacity = '1';

            cardStack.appendChild(card);
        });
    }

    // 3. Populate Message from Config
    const messageHeading = document.getElementById('message-heading');
    const messageBody = document.getElementById('message-body');
    const messageSignature = document.getElementById('message-signature');

    if (messageHeading && messageBody && messageSignature) {
        messageHeading.textContent = SITE_CONFIG.message.heading;
        messageBody.textContent = SITE_CONFIG.message.body;
        messageSignature.textContent = SITE_CONFIG.message.signature;
    }

    // 3. Card Flip Logic
    const card = document.getElementById('birthday-card');
    if (card) {
        card.addEventListener('click', () => {
            card.classList.toggle('is-flipped');
        });
    }

    // 4. Card Swipe Logic
    const swipeHint = document.querySelector('.swipe-hint');

    if (cardStack) {
        let cards = Array.from(cardStack.querySelectorAll('.swipe-card'));

        // Show hint delayed
        setTimeout(() => { if (swipeHint) swipeHint.style.display = 'block'; }, 1500);

        function initCards() {
            cards.forEach((card, index) => {
                // Stack cards: top card has highest z-index
                card.style.zIndex = cards.length - index;
                // Add a slight scale and Y offset for cards behind the top one
                const scale = 1 - (index * 0.05);
                const translateY = index * 15;
                // Only show top 3 cards to improve performance and look better
                const opacity = index < 3 ? 1 : 0;
                card.style.transform = `scale(${scale}) translateY(${translateY}px)`;
                card.style.opacity = opacity;
            });
        }

        initCards();

        let isDragging = false;
        let startX = 0;
        let startY = 0;
        let currentX = 0;
        let currentY = 0;

        function handleDragStart(e) {
            // Only drag the top card
            if (e.target.closest('.swipe-card') !== cards[0]) return;

            isDragging = true;
            startX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
            startY = e.type.includes('mouse') ? e.pageY : e.touches[0].pageY;

            // Remove transition for smooth dragging
            cards[0].style.transition = 'none';
            if (swipeHint && swipeHint.style.display !== 'none') {
                swipeHint.style.display = 'none';
            }
        }

        function handleDragMove(e) {
            if (!isDragging) return;
            // Prevent scrolling while dragging on touch devices
            e.preventDefault();

            const x = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
            const y = e.type.includes('mouse') ? e.pageY : e.touches[0].pageY;
            currentX = x - startX;
            currentY = y - startY;

            // Rotate based on X drag distance
            const rotate = currentX * 0.05;
            cards[0].style.transform = `translate(${currentX}px, ${currentY}px) rotate(${rotate}deg)`;
        }

        function handleDragEnd(e) {
            if (!isDragging) return;
            isDragging = false;

            // Restore transition for smooth snapping back or swiping away
            cards[0].style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease';

            const threshold = 100; // Drag threshold to swipe card away
            if (Math.abs(currentX) > threshold) {
                // Swipe out
                const direction = currentX > 0 ? 1 : -1;
                cards[0].style.transform = `translate(${direction * window.innerWidth}px, ${currentY}px) rotate(${direction * 45}deg)`;
                cards[0].style.opacity = '0';

                // Wait for animation to finish then move to back of stack
                setTimeout(() => {
                    const swappedCard = cards.shift();
                    cards.push(swappedCard);
                    cardStack.appendChild(swappedCard); // Move DOM element to back

                    // Reset swapped card inline transition state
                    swappedCard.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
                    initCards();
                }, 400);

            } else {
                // Snap back to top
                currentX = 0;
                currentY = 0;
                initCards();
            }
        }

        // Add event listeners
        cardStack.addEventListener('mousedown', handleDragStart);
        document.addEventListener('mousemove', handleDragMove);
        document.addEventListener('mouseup', handleDragEnd);

        cardStack.addEventListener('touchstart', handleDragStart, { passive: false });
        document.addEventListener('touchmove', handleDragMove, { passive: false });
        document.addEventListener('touchend', handleDragEnd);
    }
});
