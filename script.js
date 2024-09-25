window.addEventListener('resize', () => {
    const containers = document.querySelectorAll('.timeline-photos');
    containers.forEach(applyWaterfallLayout);
});

let fileSystem = {};
let currentBaby = 'first-baby';
let slideshowInterval;

// 默认数据
const defaultFileSystem = {
    "files": {
        "first-baby": {
            "2022-07": [
                "y1_CNM_5680.jpg", "y1_CNM_6148.jpg", "y1_CNM_6188.jpg", "y1_CNM_6176.jpg",
                "y1_CNM_6007.jpg", "y1_CNM_6005.jpg", "y1_CNM_5726.jpg", "y1_CNM_5569.jpg",
                "y1_CNM_5810.jpg", "y1_CNM_6303.jpg", "y1_CNM_5742.jpg", "y1_CNM_5781.jpg",
                "y1_CNM_5751.jpg", "y1_CNM_6106.jpg", "y1_CNM_5577.jpg", "y1_CNM_6308.jpg",
                "y1_CNM_6078.jpg", "y1_CNM_5798.jpg", "y1_CNM_6326.jpg", "y1_CNM_6051.jpg",
                "y1_CNM_6133.jpg", "y1_CNM_5931.jpg", "y1_CNM_6236.jpg", "y1_CNM_6152.jpg",
                "y1_CNM_6193.jpg", "y1_CNM_5909.jpg"
            ],
            "2023-07": [
                "y1_JFJ_6374.jpg", "y1_JFJ_6216.jpg", "y1_JFJ_6377.jpg", "y1_JFJ_6402.jpg",
                "y1_JFJ_6239.jpg", "y1_JFJ_6289.jpg", "y1_JFJ_6315.jpg", "y1_JFJ_6270.jpg",
                "y1_JFJ_6306.jpg", "y1_JFJ_6384.jpg", "y1_JFJ_6351.jpg", "y1_JFJ_6345.jpg"
            ]
        },
        "second-baby": {
            "2024-08": [
                "888001a12464607ffd2a1cd8625c36d6.JPG", "3501023eb6d99e8a7974878b2f812580.JPG",
                "ef6cda51b8df35f12571ae87f13ec835.JPG", "742a877aa7044b45b3afcb6156cb1466.JPG",
                "0660b24822876ba36f3dc815738d482e.JPG"
            ]
        }
    }
};

// 从接口获取文件数据
async function fetchFileData() {
    try {
        const response = await fetch('http://127.0.0.1:5000/files', {
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.files;
    } catch (error) {
        console.error('Error fetching file data:', error);
        return defaultFileSystem.files;
    }
}

// 初始化函数
async function initialize() {
    try {
        const galleryContainer = document.getElementById('monthly-gallery');
        galleryContainer.innerHTML = '<p>正在加载照片，请稍候...</p>';

        fileSystem = await fetchFileData();
        if (!fileSystem || Object.keys(fileSystem).length === 0) {
            throw new Error('No file data available');
        }
        createSlideshow();
        createTimelineGallery();
    } catch (error) {
        console.error('Failed to initialize:', error);
        alert(error);
        document.getElementById('monthly-gallery').innerHTML = '<p>无法加载照片，请稍后再试。</p>';
        fileSystem = defaultFileSystem.files;
    }
}

// 照片轮播功能
function createSlideshow() {
    const slideshowContainer = document.getElementById('slideshow');
    const images = getRandomImages(currentBaby, 4);
    let currentIndex = 0;

    // 清除之前的定时器
    if (slideshowInterval) {
        clearInterval(slideshowInterval);
    }

    function showImage(index) {
        const img = new Image();
        img.onload = function() {
            slideshowContainer.style.backgroundImage = `url(${img.src})`;
        };
        img.onerror = function() {
            console.error('图片加载失败:', images[index]);
            slideshowContainer.style.backgroundImage = 'none';
            slideshowContainer.textContent = '图片加载失败';
        };
        img.src = images[index];
    }

    function nextImage() {
        currentIndex = (currentIndex + 1) % images.length;
        showImage(currentIndex);
    }

    showImage(currentIndex);
    slideshowInterval = setInterval(nextImage, 5000); // 每5秒切换一次图片
}

function getRandomImages(baby, count) {
    if (!fileSystem[baby]) {
        console.error('No data for baby:', baby);
        return [];
    }
    const allImages = [];
    Object.keys(fileSystem[baby]).forEach(month => {
        fileSystem[baby][month].forEach(photo => {
            allImages.push(`https://cdn.jsdelivr.net/gh/zhaohdev/imgs@10/${baby}/${month}/${photo}`);
        });
    });
    return shuffleArray(allImages).slice(0, count);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 将 createMonthlyGallery 函数替换为 createTimelineGallery 函数
function createTimelineGallery() {
    const galleryContainer = document.getElementById('monthly-gallery');
    if (!fileSystem[currentBaby]) {
        console.error('No data for current baby:', currentBaby);
        galleryContainer.innerHTML = '<p>没有找到照片</p>';
        return;
    }
    const months = Object.keys(fileSystem[currentBaby]).sort().reverse();

    console.log('Creating timeline gallery for', currentBaby);
    console.log('Months:', months);

    galleryContainer.innerHTML = '';

    if (months.length === 0) {
        console.log('No months found for', currentBaby);
        galleryContainer.innerHTML = '<p>没有找到照片</p>';
        return;
    }

    months.forEach(month => {
        const monthElement = document.createElement('div');
        monthElement.className = 'timeline-month';

        const monthHeader = document.createElement('h2');
        monthHeader.className = 'timeline-month-header';
        monthHeader.textContent = formatMonth(month);
        monthElement.appendChild(monthHeader);

        const photosContainer = document.createElement('div');
        photosContainer.className = 'timeline-photos';

        const photoList = fileSystem[currentBaby][month];

        console.log(`Adding ${photoList.length} photos for ${month}`);

        photoList.forEach(photo => {
            const imgContainer = document.createElement('div');
            imgContainer.className = 'photo-item';

            const img = document.createElement('img');
            img.dataset.src = `https://cdn.jsdelivr.net/gh/zhaohdev/imgs@10/${currentBaby}/${month}/${photo}`;
            img.alt = `${formatMonth(month)}的照片`;
            img.className = 'timeline-photo lazy';
            img.onclick = function() {
                openModal(this.src || this.dataset.src, this.alt);
            };

            imgContainer.appendChild(img);
            photosContainer.appendChild(imgContainer);
        });

        monthElement.appendChild(photosContainer);
        galleryContainer.appendChild(monthElement);
    });

    console.log('Timeline gallery created');
    lazyLoadImages();
}

// 添加查看大图功能
function openModal(src, alt) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const captionText = document.getElementById('caption');
    modal.style.display = "block";
    modalImg.src = src;
    captionText.innerHTML = alt;
}

// 关闭模态框
const modal = document.getElementById('imageModal');
const span = document.getElementsByClassName("close")[0];

span.onclick = function() {
    modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// 移除 showPhotos 函数，因为我们不再需要单独的月份页面

function switchBaby(baby) {
    currentBaby = baby;
    document.getElementById('first-baby').classList.toggle('active', baby === 'first-baby');
    document.getElementById('second-baby').classList.toggle('active', baby === 'second-baby');
    
    // 切换页面主题
    document.body.classList.toggle('second-baby-theme', baby === 'second-baby');
    
    // 重新创建轮播图和时间轴瀑布流
    createSlideshow();
    createTimelineGallery();
}

// 当页面加载完成时初始化功能
window.addEventListener('load', () => {
    console.log('Page loaded');
    initialize();

    document.getElementById('first-baby').addEventListener('click', () => switchBaby('first-baby'));
    document.getElementById('second-baby').addEventListener('click', () => switchBaby('second-baby'));

    window.addEventListener('resize', () => {
        const containers = document.querySelectorAll('.timeline-photos');
        containers.forEach(applyWaterfallLayout);
    });
});

// 确保 formatMonth 函数存在
function formatMonth(monthStr) {
    const [year, month] = monthStr.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleString('zh-CN', { year: 'numeric', month: 'long' });
}

function lazyLoadImages() {
    const lazyImages = document.querySelectorAll('img.lazy');
    console.log(`Found ${lazyImages.length} lazy images`);

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting || entry.intersectionRatio > 0) {
                const image = entry.target;
                console.log(`Loading image: ${image.dataset.src}`);
                
                const img = new Image();
                img.onload = function() {
                    image.src = this.src;
                    image.classList.remove('lazy');
                    image.classList.add('loaded');
                    image.setAttribute('data-width', this.width);
                    image.setAttribute('data-height', this.height);
                    applyWaterfallLayout(image.closest('.timeline-photos'));
                };
                img.src = image.dataset.src;
                
                observer.unobserve(image);
            }
        });
    }, {
        root: null,
        rootMargin: '200px',
        threshold: 0.01
    });

    lazyImages.forEach(img => {
        imageObserver.observe(img);
        console.log(`Observing image: ${img.dataset.src}`);
    });
}

function applyWaterfallLayout(container) {
    const items = container.querySelectorAll('.photo-item');
    const containerWidth = container.offsetWidth;
    const gapSize = 10; // 减小间隙大小
    let columnCount = 3; // 默认为3列
    
    // 根据容器宽度动态调整列数
    if (containerWidth <= 480) {
        columnCount = 1; // 小屏幕使用1列
    } else if (containerWidth <= 768) {
        columnCount = 2; // 中等屏幕使用2列
    }

    const columnWidth = (containerWidth / columnCount) - (gapSize * (columnCount - 1) / columnCount);
    const columnHeights = new Array(columnCount).fill(0);

    items.forEach(item => {
        const img = item.querySelector('img');
        if (img.complete && img.naturalHeight !== 0) {
            const columnIndex = columnHeights.indexOf(Math.min(...columnHeights));
            const x = columnIndex * (columnWidth + gapSize);
            const y = columnHeights[columnIndex];
            
            item.style.transform = `translate3d(${x}px, ${y}px, 0)`;
            item.style.width = `${columnWidth}px`;
            
            const aspectRatio = img.getAttribute('data-width') / img.getAttribute('data-height');
            const height = columnWidth / aspectRatio;
            columnHeights[columnIndex] += height + gapSize;
        }
    });

    container.style.height = `${Math.max(...columnHeights)}px`;
}