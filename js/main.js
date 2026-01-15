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

    // 滚动效果
    window.addEventListener('scroll', () => {
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
       3. 实习经历轮播图 (核心修改部分)
       ========================================= */
    function initExperienceCarousels() {
        // 获取页面上所有的轮播图容器
        const carousels = document.querySelectorAll('.experience-carousel');

        carousels.forEach(carousel => {
            const slides = carousel.querySelectorAll('.exp-slide');
            const prevBtn = carousel.querySelector('.exp-prev');
            const nextBtn = carousel.querySelector('.exp-next');
            const dotsContainer = carousel.querySelector('.exp-carousel-dots');

            // 安全检查：如果没有图片，直接跳过
            if (slides.length === 0) return;

            // 如果只有一张图 (比如 Momenta)，隐藏按钮和圆点
            if (slides.length <= 1) {
                if(prevBtn) prevBtn.style.display = 'none';
                if(nextBtn) nextBtn.style.display = 'none';
                if(dotsContainer) dotsContainer.style.display = 'none';
                // 确保唯一的一张图是显示的
                slides[0].classList.add('active');
                return;
            }

            let currentIndex = 0;

            // 初始化圆点 (如果 HTML 中写了 .exp-carousel-dots 容器)
            if (dotsContainer) {
                dotsContainer.innerHTML = ''; 
                slides.forEach((_, idx) => {
                    const dot = document.createElement('div'); // 改为div或span
                    dot.classList.add('exp-dot'); // 需要在CSS中确保有 .exp-dot 样式
                    if (idx === 0) dot.classList.add('active');
                    dot.addEventListener('click', () => showSlide(idx));
                    dotsContainer.appendChild(dot);
                });
            }

            // 切换图片的核心函数
            function showSlide(index) {
                // 边界处理：循环播放
                if (index >= slides.length) index = 0;
                if (index < 0) index = slides.length - 1;

                // 移除旧的 active
                slides[currentIndex].classList.remove('active');
                if(dotsContainer && dotsContainer.children[currentIndex]) {
                    dotsContainer.children[currentIndex].classList.remove('active');
                }

                // 更新索引
                currentIndex = index;

                // 添加新的 active
                slides[currentIndex].classList.add('active');
                if(dotsContainer && dotsContainer.children[currentIndex]) {
                    dotsContainer.children[currentIndex].classList.add('active');
                }
            }

            // 绑定按钮事件
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
        });
    }

    // 执行轮播图初始化
    initExperienceCarousels();

    /* =========================================
       4. 模态框 (图片/视频查看器)
       ========================================= */
    const imageModal = document.getElementById('imageModal');
    const videoModal = document.getElementById('videoModal');
    const modalImage = document.getElementById('modalImage');
    const videoPlayer = document.getElementById('videoPlayer');
    const closeButtons = document.querySelectorAll('.close-modal');

    // 处理作品点击事件
    document.querySelectorAll('.portfolio-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            // 如果是普通的跳转链接（target="_blank"），则不阻止默认行为
            if (button.getAttribute('target') === '_blank' || button.hasAttribute('onclick')) {
                return;
            }
            
            e.preventDefault();
            const type = button.dataset.type;
            const src = button.dataset.src;

            if (type === 'image') {
                modalImage.src = src;
                if(imageModal) imageModal.style.display = 'block';
                document.body.style.overflow = 'hidden'; // 禁止背景滚动
            } else if (type === 'video') {
                videoPlayer.src = src;
                if(videoModal) videoModal.style.display = 'block';
                document.body.style.overflow = 'hidden';
                if(videoPlayer) videoPlayer.play();
            }
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

    // 优化视频加载 (点击观看时才加载)
    function optimizeVideoLoading() {
        const videoButtons = document.querySelectorAll('[data-type="video"]');
        videoButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                // 如果按钮本身是链接形式，不执行JS加载逻辑
                if (button.tagName === 'A' && button.getAttribute('href') !== '#') return;

                e.preventDefault();
                showLoader();
                
                try {
                    const videoSrc = button.dataset.src;
                    if(!videoSrc) throw new Error('视频地址为空');

                    const response = await fetch(videoSrc, { method: 'HEAD' }); // 仅检查文件是否存在
                    if (!response.ok) throw new Error('视频文件无法访问');

                    videoPlayer.src = videoSrc;
                    if(videoModal) videoModal.style.display = 'block';
                    document.body.style.overflow = 'hidden';
                    
                    videoPlayer.play().catch(error => {
                        console.error(error);
                        showToast('视频自动播放被拦截，请手动点击播放');
                    });
                } catch (error) {
                    showToast('视频加载失败: ' + error.message);
                } finally {
                    hideLoader();
                }
            });
        });
    }

    // 初始化工具
    lazyLoadImages();
    optimizeVideoLoading();
});