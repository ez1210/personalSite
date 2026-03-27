document.addEventListener("DOMContentLoaded", () => {
    const workItems = document.querySelectorAll('.work-name');
    const rightPreviewImg = document.querySelector('.right-preview-img');
    const aboutMe = document.querySelector('.about-me');
    const filterLinks = document.querySelectorAll('.filter-list a');

    // 1. 프리뷰 이미지 & 소개글 토글 기능
    workItems.forEach(item => {
        const link = item.querySelector('a');

        item.addEventListener('mouseenter', () => {
            // 🚨 핵심 방어막: 모바일 화면(768px 이하)이면 여기서 함수를 즉시 종료함
            if (window.innerWidth <= 768) return; 

            const targetElement = (link && link.hasAttribute('data-image')) ? link : item;
            const newImageSrc = targetElement.getAttribute('data-image'); 
            
            if (newImageSrc && rightPreviewImg) {
                rightPreviewImg.src = newImageSrc;
                rightPreviewImg.style.display = 'block';
                if(aboutMe) aboutMe.style.display = 'none'; 
            }
        });
        
        item.addEventListener('mouseleave', () => {
            // 🚨 마우스가 벗어날 때도 모바일이면 즉시 종료해서 쓸데없는 작동을 막음
            if (window.innerWidth <= 768) return; 

            if (rightPreviewImg) {
                rightPreviewImg.style.display = 'none';
                rightPreviewImg.src = '';
            }
            if (aboutMe) aboutMe.style.display = 'block'; 
        });
    });
    
    // 2. 카테고리 필터 기능 (All, Branding 등)
    filterLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); 
            
            filterLinks.forEach(item => item.classList.remove('active'));
            link.classList.add('active');
            
            const filterValue = link.getAttribute('data-filter');

            workItems.forEach(project => {
                const category = project.getAttribute('data-category');
                if (filterValue === 'all' || filterValue === category) {
                    project.style.display = 'block'; 
                } else {
                    project.style.display = 'none'; 
                }
            });
        });
    });
});