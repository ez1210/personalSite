
const projectMenuBtn = document.querySelector('.filter-btn[data-filter="all"]');
const projectLi = projectMenuBtn.parentElement;

projectMenuBtn.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) {
        e.preventDefault(); 
        projectLi.classList.toggle('open');
        }
    });

            // 3. 화면의 빈 공간 아무 데나 터치했을 때
            document.addEventListener('click', (e) => {
                // 내가 클릭한 곳이 Projects 메뉴 안쪽이 아니라면?
                if (!projectLi.contains(e.target)) {
                    // 열려있는 메뉴를 닫아라 (open 클래스 제거)
                    projectLi.classList.remove('open');
                }
            });

            const filterBtns = document.querySelectorAll('.filter-btn');
            const works = document.querySelectorAll('.work');

            filterBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();

                    filterBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');

                    const filterValue = btn.getAttribute('data-filter');

                    works.forEach(work => {
                        if (filterValue === 'all' || work.getAttribute('data-category') === filterValue) {
                            work.style.display = 'block';
                        } else {
                            work.style.display = 'none';
                        }
                    });
                });
            });