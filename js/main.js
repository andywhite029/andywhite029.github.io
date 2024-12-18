document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.querySelector('.navbar');
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const dropdowns = document.querySelectorAll('.dropdown');

    // 滚动效果
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 汉堡菜单点击事件
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // 移动端下拉菜单
    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('a');
        link.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                dropdown.classList.toggle('active');
            }
        });
    });

    // 点击导航链接时关闭菜单
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    });

    // 点击外部关闭菜单
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });

    // 作品集筛选功能
    const tabs = document.querySelectorAll('.portfolio-tab');
    const items = document.querySelectorAll('.portfolio-item');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 移除所有标签的活动状态
            tabs.forEach(t => t.classList.remove('active'));
            // 添加当前标签的活动状态
            tab.classList.add('active');

            const category = tab.dataset.category;
            
            items.forEach(item => {
                if (category === 'all' || item.dataset.category === category) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // 实习经历轮播图
    function initExperienceCarousel() {
        const slides = document.querySelectorAll('.exp-slide');
        const dotsContainer = document.querySelector('.exp-carousel-dots');
        let currentSlide = 0;

        // 创建导航点
        slides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('exp-dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(index));
            dotsContainer.appendChild(dot);
        });

        function goToSlide(n) {
            slides[currentSlide].classList.remove('active');
            document.querySelectorAll('.exp-dot')[currentSlide].classList.remove('active');
            
            currentSlide = n;
            
            slides[currentSlide].classList.add('active');
            document.querySelectorAll('.exp-dot')[currentSlide].classList.add('active');
        }

        function nextSlide() {
            goToSlide((currentSlide + 1) % slides.length);
        }

        // 自动轮播
        setInterval(nextSlide, 5000);
    }

    // 页面加载完成后初始化轮播图
    initExperienceCarousel();
}); 