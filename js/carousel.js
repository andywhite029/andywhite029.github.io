// 主轮播图功能
function initMainCarousel() {
    const container = document.querySelector('.carousel-container');
    const slides = document.querySelectorAll('.carousel-slide');
    const prevButton = document.querySelector('.carousel-button.prev');
    const nextButton = document.querySelector('.carousel-button.next');
    const dotsContainer = document.querySelector('.carousel-dots');
    
    let currentSlide = 0;
    const slideCount = slides.length;

    // 创建导航点
    slides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.classList.add('carousel-dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll('.carousel-dot');

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

    function prevSlide() {
        currentSlide = (currentSlide - 1 + slideCount) % slideCount;
        updateSlides();
    }

    // 事件监听器
    nextButton.addEventListener('click', nextSlide);
    prevButton.addEventListener('click', prevSlide);

    // 自动播放
    setInterval(nextSlide, 5000);
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