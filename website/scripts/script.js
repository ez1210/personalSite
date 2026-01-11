const header = document.getElementById('info-header');
const intro = document.getElementById('intro');

if (window.location.hash) {
    window.history.replaceState(null, null, ' ');
}

document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('a[data-filter]');
    const workItems = document.querySelectorAll('.work');

    filterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const filterValue = button.getAttribute('data-filter').toLowerCase().trim();
            filterButtons.forEach(btn => btn.classList.remove('active'));
            if(button.classList.contains('main-link') || button.parentElement.parentElement.classList.contains('sub-menu')){
                 button.classList.add('active');
            }
            workItems.forEach(item => {
                const itemCategory = item.getAttribute('data-category');
                const itemYear = item.getAttribute('data-year');
                const categoryMatch = itemCategory && itemCategory.toLowerCase().trim() === filterValue;
                const yearMatch = itemYear && itemYear.trim() === filterValue;
                if (filterValue === 'all' || categoryMatch || yearMatch) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
});


window.addEventListener('scroll', () => {
    if (!intro || intro.style.display === 'none') return;

    const introHeight = intro.offsetHeight;
    const currentScroll = window.scrollY;

    if (currentScroll > introHeight -100) {
        
        intro.style.display = 'none';
        
        window.scrollTo(0, 0);
        
        console.log("Intro removed! You can't go back.");
    }
});


const enterBtn = document.querySelector('.scroll-down-btn');

if (enterBtn) {
    enterBtn.addEventListener('click', (e) => {
        e.preventDefault();

        const headerTop = header.offsetTop;

        window.scrollTo({
            top: headerTop,
            behavior: 'smooth'
        });
        setTimeout(() => {
            intro.style.display = 'none';
            window.scrollTo(0, 0);
        }, 1000);
    });
}


document.addEventListener('DOMContentLoaded', () => {
    const worksBtn = document.querySelector('.side-nav .main-link');
    const subMenu = document.querySelector('.sub-menu');

    if (worksBtn && subMenu) {
        worksBtn.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault(); 
                e.stopPropagation();

                subMenu.classList.toggle('open');
            }
        });
    }
});