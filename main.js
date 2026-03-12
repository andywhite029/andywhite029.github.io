document.addEventListener('DOMContentLoaded', function() {
    /* =========================================
       1. 导航栏与基础交互
       ========================================= */
    const navbar = document.querySelector('.navbar');
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const dropdowns = document.querySelectorAll('.dropdown');
    
    // 注意：确保 HTML 中有 class="back-to-top" 的元素，如果没有，下面代码可能会报错
    // 为了防止报错，我们加一个判断
    const backToTop = document.querySelector('.back-to-top');

    // 滚动效果（简单节流）
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const now = Date.now();
        if (now - lastScroll < 100) return; // 100ms 节流
        lastScroll = now;

        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        if (backToTop) {
            if (window.scrollY > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }
    });

    // 汉堡菜单点击事件
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // 点击其他地方关闭菜单
    document.addEventListener('click', (e) => {
        if (navMenu && navToggle && !navMenu.contains(e.target) && !navToggle.contains(e.target)) {
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

    /* =========================================
       2. 作品集筛选功能
       ========================================= */
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
                    // 使用 setTimeout 让 display:block 生效后再改变透明度，产生动画
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

    /* =========================================
       3. 作品集展示控制（最多显示前6个，点击按钮可查看全部）
       ========================================= */
    const showMoreBtn = document.getElementById('showMoreBtn');
    // 如果想要取消限制，设置 maxVisibleItems 为 items.length
    const maxVisibleItems = items.length; // 默认显示全部作品
    
    function updatePortfolioVisibility() {
        items.forEach((item, index) => {
            if (index >= maxVisibleItems) {
                item.classList.add('hidden');
            } else {
                item.classList.remove('hidden');
            }
        });
        if (showMoreBtn) {
            const hasHidden = items.length > maxVisibleItems;
            showMoreBtn.style.display = hasHidden ? 'inline-block' : 'none';
        }
    }
    
    if (showMoreBtn) {
        showMoreBtn.addEventListener('click', () => {
            items.forEach(item => item.classList.remove('hidden'));
            showMoreBtn.style.display = 'none';
        });
    }
    
    // 初始状态下更新隐藏逻辑
    updatePortfolioVisibility();

    /* =========================================
       3. 实习经历轮播图 (核心修改部分)
       ========================================= */
    function initExperienceCarousels() {
        const carousels = document.querySelectorAll('.experience-carousel');

        carousels.forEach(carousel => {
            const slides = carousel.querySelectorAll('.exp-slide');
            const prevBtn = carousel.querySelector('.exp-prev');
            const nextBtn = carousel.querySelector('.exp-next');
            let dotsContainer = carousel.querySelector('.exp-carousel-dots');

            if (slides.length === 0) return;

            if (slides.length <= 1) {
                carousel.classList.add('single-slide'); // CSS 隐藏按钮
                if(prevBtn) prevBtn.style.display = 'none';
                if(nextBtn) nextBtn.style.display = 'none';
                if(dotsContainer) dotsContainer.style.display = 'none';
                slides[0].classList.add('active');
                return;
            }

            let currentIndex = 0;

            // 确保存在圆点容器
            if (!dotsContainer) {
                dotsContainer = document.createElement('div');
                dotsContainer.className = 'exp-carousel-dots';
                carousel.appendChild(dotsContainer);
            } else {
                dotsContainer.innerHTML = '';
            }

            slides.forEach((_, idx) => {
                const dot = document.createElement('div');
                dot.classList.add('exp-dot');
                if (idx === 0) dot.classList.add('active');
                dot.addEventListener('click', () => showSlide(idx));
                dotsContainer.appendChild(dot);
            });

            function showSlide(index) {
                if (index >= slides.length) index = 0;
                if (index < 0) index = slides.length - 1;

                slides[currentIndex].classList.remove('active');
                if (dotsContainer.children[currentIndex]) {
                    dotsContainer.children[currentIndex].classList.remove('active');
                }

                currentIndex = index;

                slides[currentIndex].classList.add('active');
                if (dotsContainer.children[currentIndex]) {
                    dotsContainer.children[currentIndex].classList.add('active');
                }
            }

            if (prevBtn) {
                prevBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    showSlide(currentIndex - 1);
                });
            }

            if (nextBtn) {
                nextBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    showSlide(currentIndex + 1);
                });
            }

            // 自动播放
            setInterval(() => showSlide(currentIndex + 1), 4000);
        });
    }

    // 执行轮播图初始化
    initExperienceCarousels();

    /* =========================================
       4. fade-in sections on scroll
       ========================================= */
    const sections = document.querySelectorAll('.section');
    const observerOptions = { threshold: 0.15 };
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                sectionObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);
    sections.forEach(sec => sectionObserver.observe(sec));

    /* =========================================
       4. 模态框 (图片/视频查看器)
       ========================================= */
    const imageModal = document.getElementById('imageModal');
    const videoModal = document.getElementById('videoModal');
    const modalImage = document.getElementById('modalImage');
    const videoPlayer = document.getElementById('videoPlayer');
    const closeButtons = document.querySelectorAll('.close-modal');

    // 处理作品中的图片按钮（视频单独由 optimizeVideoLoading 处理）
    document.querySelectorAll('.portfolio-btn[data-type="image"]').forEach(button => {
        button.addEventListener('click', (e) => {
            // 如果是普通的跳转链接（target="_blank"），则不阻止默认行为
            if (button.getAttribute('target') === '_blank' || button.hasAttribute('onclick')) {
                return;
            }
            e.preventDefault();
            const src = button.dataset.src;
            modalImage.src = src;
            if (imageModal) imageModal.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // 禁止背景滚动
        });
    });

    // 关闭模态框通用函数
    function closeModal() {
        if(imageModal) imageModal.style.display = 'none';
        if(videoModal) videoModal.style.display = 'none';
        
        if (videoPlayer) {
            videoPlayer.pause();
            videoPlayer.src = '';
        }
        if (modalImage) {
            modalImage.src = '';
        }
        document.body.style.overflow = 'auto'; // 恢复滚动
    }

    // 绑定关闭按钮
    closeButtons.forEach(button => {
        button.addEventListener('click', closeModal);
    });

    // 点击模态框外部背景关闭
    [imageModal, videoModal].forEach(modal => {
        if(modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal();
                }
            });
        }
    });

    // ESC键关闭
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    if (backToTop) {
        backToTop.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    /* =========================================
       5. 工具函数：加载提示与错误处理
       ========================================= */

    // 显示 Toast 提示
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

    // 加载动画
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

    // 图片懒加载 (配合 data-src 使用，如果用了 loading="lazy" 则此为补充)
    function lazyLoadImages() {
        // 只选择有 data-src 的图片
        const images = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
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
                            // 失败时不替换为占位图，以免破坏布局，或者可以设置为一个透明像素
                            console.log('Image failed to load:', img.dataset.src);
                            observer.unobserve(img);
                        };
                    }
                });
            });
            images.forEach(img => imageObserver.observe(img));
        } else {
            // 降级处理：直接加载
            images.forEach(img => {
                img.src = img.dataset.src;
            });
        }
    }

    // 优化视频加载 (直接触发弹出与播放，规避本地跨域报错)
    function optimizeVideoLoading() {
        const videoButtons = document.querySelectorAll('[data-type="video"]');
        videoButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // 如果按钮本身是外链形式，不执行JS加载逻辑
                if (button.tagName === 'A' && button.getAttribute('href') !== '#') return;

                e.preventDefault();
                const videoSrc = button.dataset.src;
                
                if(!videoSrc) {
                    showToast('视频地址为空');
                    return;
                }

                // 1. 直接设置视频源
                if (videoPlayer) {
                    videoPlayer.src = videoSrc;
                }

                // 2. 显示模态框 (推荐用 flex 以便配合 CSS 实现完美垂直居中)
                if (videoModal) {
                    videoModal.style.display = 'flex'; 
                }
                
                // 3. 阻止底层原始网页的滚动
                document.body.style.overflow = 'hidden'; 
                
                // 4. 尝试自动播放
                if (videoPlayer) {
                    // 现在的浏览器策略严格，如果被拦截，只需在控制台打个提示，用户手动点即可
                    videoPlayer.play().catch(error => {
                        console.warn('浏览器拦截了自动播放，需用户手动点击播放:', error);
                    });
                }
            });
        });
    }

    // 初始化工具
    lazyLoadImages();
    optimizeVideoLoading();

    /* =========================================
       6. 主轮播图功能（原本在 carousel.js）
       ========================================= */
    function initMainCarousel() {
        const container = document.querySelector('.carousel-container');
        if (!container) return; // 没有主轮播则直接退出

        const slides = container.querySelectorAll('.carousel-slide');
        if (slides.length === 0) return;

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
                    img.dataset.src = img.src;
                    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                    img.classList.add('lazy');
                }
            });
            const firstImg = slides[0].querySelector('img');
            if (firstImg) {
                firstImg.src = firstImg.dataset.src;
                firstImg.classList.remove('lazy');
            }
        }

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
            if (dots.length) {
                dots.forEach(dot => dot.classList.remove('active'));
            }
            slides[currentSlide].classList.add('active');
            if (dots.length) {
                dots[currentSlide].classList.add('active');
            }
            loadImages(currentSlide);
        }

        if (dotsContainer) {
            slides.forEach((_, index) => {
                const dot = document.createElement('button');
                dot.classList.add('carousel-dot');
                if (index === 0) dot.classList.add('active');
                dot.addEventListener('click', () => goToSlide(index));
                dotsContainer.appendChild(dot);
            });
        }
        const dots = dotsContainer ? dotsContainer.querySelectorAll('.carousel-dot') : [];

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
        if (nextButton) nextButton.addEventListener('click', nextSlide);
        if (prevButton) prevButton.addEventListener('click', prevSlide);
        setInterval(nextSlide, 5000);
        preloadImages();
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
        document.querySelectorAll('img.lazy').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // 立即初始化主轮播
    initMainCarousel();

    /* =========================================
       7. 平滑滚动至页内锚点
       ========================================= */
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', e => {
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});