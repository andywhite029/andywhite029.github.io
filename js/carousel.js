// 主轮播图功能
function initMainCarousel() {
    const container = document.querySelector('.carousel-container');
    const slides = document.querySelectorAll('.carousel-slide');
    const prevButton = document.querySelector('.carousel-button.prev');
    const nextButton = document.querySelector('.carousel-button.next');
    const dotsContainer = document.querySelector('.carousel-dots');
    
    let currentSlide = 0;
    const slideCount = slides.length;

    // 预加载图片
    function preloadImages() {
        slides.forEach(slide => {
            const img = slide.querySelector('img');
            if (img) {
                // 将src改为data-src，实现懒加载
                img.dataset.src = img.src;
                img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // 占位图
                img.classList.add('lazy');
            }
        });
        
        // 立即加载第一张图片
        const firstImg = slides[0].querySelector('img');
        if (firstImg) {
            firstImg.src = firstImg.dataset.src;
            firstImg.classList.remove('lazy');
        }
    }

    // 加载当前和下一张图片
    function loadImages(index) {
        const currentImg = slides[index].querySelector('img.lazy');
        const nextIndex = (index + 1) % slideCount;
        const nextImg = slides[nextIndex].querySelector('img.lazy');
        
        if (currentImg) {
            currentImg.src = currentImg.dataset.src;
            currentImg.classList.remove('lazy');
        }
        
        if (nextImg) {
            nextImg.src = nextImg.dataset.src;
            nextImg.classList.remove('lazy');
        }
    }

    function updateSlides() {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
        
        // 加载当前和下一张图片
        loadImages(currentSlide);
    }

    // 创建导航点
    slides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.classList.add('carousel-dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll('.carousel-dot');

    function goToSlide(index) {
        currentSlide = index;
        updateSlides();
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slideCount;
        updateSlides();
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + slideCount) % slideCount;
        updateSlides();
    }

    // 事件监听器
    nextButton.addEventListener('click', nextSlide);
    prevButton.addEventListener('click', prevSlide);

    // 自动播放
    setInterval(nextSlide, 5000);

    // 初始化
    preloadImages();
    
    // 创建Intersection Observer来监测图片可见性
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });

    // 观察所有懒加载图片
    document.querySelectorAll('img.lazy').forEach(img => {
        imageObserver.observe(img);
    });
}

// 经历部分的轮播图功能
function initExperienceCarousels() {
    const expCarousels = document.querySelectorAll('.experience-carousel');
    
    expCarousels.forEach(carousel => {
        const container = carousel.querySelector('.exp-carousel-container');
        const slides = carousel.querySelectorAll('.exp-slide');
        const dotsContainer = carousel.querySelector('.exp-carousel-dots');
        
        let currentSlide = 0;
        const slideCount = slides.length;

        // 创建导航点
        slides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.classList.add('exp-carousel-dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(index));
            dotsContainer.appendChild(dot);
        });

        const dots = carousel.querySelectorAll('.exp-carousel-dot');

        function updateSlides() {
            slides.forEach(slide => slide.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));
            
            slides[currentSlide].classList.add('active');
            dots[currentSlide].classList.add('active');
        }

        function goToSlide(index) {
            currentSlide = index;
            updateSlides();
        }

        function nextSlide() {
            currentSlide = (currentSlide + 1) % slideCount;
            updateSlides();
        }

        // 自动播放
        setInterval(nextSlide, 4000);
    });
}

// 页面加载完成后初始化所有轮播图
document.addEventListener('DOMContentLoaded', () => {
    initMainCarousel();
    initExperienceCarousels();
}); 