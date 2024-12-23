document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.querySelector('.navbar');
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const dropdowns = document.querySelectorAll('.dropdown');
    const backToTop = document.querySelector('.back-to-top');

    // 滚动效果
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        if (window.scrollY > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });

    // 汉堡菜单点击事件
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // 点击其他地方关闭菜单
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });

    // 移动端下拉菜单处理
    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('a');
        link.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                dropdown.classList.toggle('active');
            }
        });
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

    // 获取模态框元素
    const imageModal = document.getElementById('imageModal');
    const videoModal = document.getElementById('videoModal');
    const modalImage = document.getElementById('modalImage');
    const videoPlayer = document.getElementById('videoPlayer');
    const closeButtons = document.querySelectorAll('.close-modal');

    // 处理作品点击事件
    document.querySelectorAll('.portfolio-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const type = button.dataset.type;
            const src = button.dataset.src;

            if (type === 'image') {
                // 显示图片模态框
                modalImage.src = src;
                imageModal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            } else if (type === 'video') {
                // 显示视频模态框
                videoPlayer.src = src;
                videoModal.style.display = 'block';
                document.body.style.overflow = 'hidden';
                videoPlayer.play();
            }
        });
    });

    // 关闭模态框
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            imageModal.style.display = 'none';
            videoModal.style.display = 'none';
            videoPlayer.pause();
            videoPlayer.src = '';
            modalImage.src = '';
            document.body.style.overflow = 'auto';
        });
    });

    // 点击模态框外部关闭
    [imageModal, videoModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                if (modal === videoModal) {
                    videoPlayer.pause();
                    videoPlayer.src = '';
                } else {
                    modalImage.src = '';
                }
                document.body.style.overflow = 'auto';
            }
        });
    });

    // ESC键关闭模态框
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            imageModal.style.display = 'none';
            videoModal.style.display = 'none';
            videoPlayer.pause();
            videoPlayer.src = '';
            modalImage.src = '';
            document.body.style.overflow = 'auto';
        }
    });

    backToTop.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // 图片加载错误处理
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.onerror = function() {
            this.src = 'images/placeholder.jpg'; // 添加默认图片
        };
    });

    // 视频加载错误处理
    if (videoPlayer) {
        videoPlayer.onerror = function() {
            alert('视频加载失败，请稍后重试');
        };
    }

    // 添加加载状态指示器
    function showLoader() {
        const loader = document.createElement('div');
        loader.className = 'loader-container';
        loader.innerHTML = '<div class="loader"></div>';
        document.body.appendChild(loader);
    }

    function hideLoader() {
        const loader = document.querySelector('.loader-container');
        if (loader) {
            loader.remove();
        }
    }

    // 显示提示消息
    function showToast(message, duration = 3000) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    // 图片懒加载
    function lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.onload = () => {
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    };
                    img.onerror = () => {
                        img.src = 'images/placeholder.jpg';
                        showToast('图片加载失败');
                        observer.unobserve(img);
                    };
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    // 优化视频加载
    function optimizeVideoLoading() {
        const videoButtons = document.querySelectorAll('[data-type="video"]');
        videoButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                e.preventDefault();
                showLoader();
                
                try {
                    const videoSrc = button.dataset.src;
                    const response = await fetch(videoSrc);
                    if (!response.ok) throw new Error('视频加载失败');

                    const videoPlayer = document.getElementById('videoPlayer');
                    videoPlayer.src = videoSrc;
                    videoModal.style.display = 'block';
                    document.body.style.overflow = 'hidden';
                    
                    videoPlayer.play().catch(error => {
                        showToast('视频播放失败，请重试');
                    });
                } catch (error) {
                    showToast(error.message);
                } finally {
                    hideLoader();
                }
            });
        });
    }

    // 错误处理和用户反馈
    window.addEventListener('error', function(e) {
        if (e.target.tagName === 'IMG') {
            e.target.src = 'images/placeholder.jpg';
            showToast('图片加载失败');
        }
    }, true);

    // 初始化
    lazyLoadImages();
    optimizeVideoLoading();
}); 