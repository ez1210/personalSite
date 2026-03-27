/* -----------------------------------------------------------------
   [1] 헤더 & 해시 처리 (기존 코드 유지)
----------------------------------------------------------------- */
const header = document.getElementById('info-header');
const intro = document.getElementById('intro');

if (window.location.hash) {
    window.history.replaceState(null, null, ' ');
}

/* -----------------------------------------------------------------
   [2] 통합 필터링 로직 (토글 기능 완벽 적용)
----------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. 필터 버튼들을 찾습니다. 
    // (a태그의 data-filter나, 새로운 디자인의 span 태그 모두 작동하게 설정)
    const filterButtons = document.querySelectorAll('a[data-filter], .filter-list span, .sub-menu span');
    const workItems = document.querySelectorAll('.work');

    // 'All' 버튼을 미리 찾아둡니다 (나중에 돌아갈 때 필요함)
    // 텍스트가 'All'이거나 data-filter가 'all'인 녀석을 찾음
    let allButton = null;
    filterButtons.forEach(btn => {
        if (btn.innerText.trim().toLowerCase() === 'all' || btn.getAttribute('data-filter') === 'all') {
            allButton = btn;
        }
    });

    filterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // 태그가 span이면 링크 이동 방지가 필요 없지만, a태그일 경우를 대비
            e.preventDefault(); 

            // 1. 현재 버튼이 무슨 필터인지 알아내기
            // data-filter가 있으면 그거 쓰고, 없으면 글자(innerText)를 읽어서 소문자로 변환
            let filterValue = button.getAttribute('data-filter');
            if (!filterValue) {
                filterValue = button.innerText.toLowerCase().trim();
            } else {
                filterValue = filterValue.toLowerCase().trim();
            }

            // [핵심 기능] 토글 로직 시작!
            // "이미 활성화(active)된 버튼을 눌렀고, 그게 'all' 버튼이 아니라면?"
            if (button.classList.contains('active') && filterValue !== 'all') {
                
                // -> 필터 해제하고 'All' 모드로 전환!
                console.log("토글 해제: All로 돌아갑니다.");
                
                // 모든 버튼 끄기
                filterButtons.forEach(btn => btn.classList.remove('active'));
                
                // 'All' 버튼 켜기 (만약 찾았으면)
                if (allButton) allButton.classList.add('active');
                
                // 필터 값 강제로 'all'로 변경
                filterValue = 'all';

            } else {
                // -> 일반적인 클릭 (새로운 필터 적용)
                
                // 다른 버튼들 다 끄기
                filterButtons.forEach(btn => btn.classList.remove('active'));
                
                // 지금 누른 버튼 켜기
                button.classList.add('active');
            }

            // 2. 실제 작품들 보여주기/숨기기 (기존 로직 활용)
            workItems.forEach(item => {
                const itemCategory = item.getAttribute('data-category');
                const itemYear = item.getAttribute('data-year');
                
                // 데이터가 없을 경우를 대비해 안전하게 체크
                const categoryMatch = itemCategory && itemCategory.toLowerCase().trim() === filterValue;
                const yearMatch = itemYear && itemYear.trim() === filterValue;

                if (filterValue === 'all' || categoryMatch || yearMatch) {
                    item.style.display = ''; // 보이기
                } else {
                    item.style.display = 'none'; // 숨기기
                }
            });
        });
    });
});

/* -----------------------------------------------------------------
   [3] 모바일 메뉴 토글 (기존 코드 유지)
----------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    // 버튼과 메뉴 찾기 (클래스 이름이 정확해야 함)
    const worksBtn = document.querySelector('.side-nav .main-link'); // Works 버튼
    const subMenu = document.querySelector('.sub-menu'); // 메뉴 목록

    if (worksBtn && subMenu) {
        worksBtn.addEventListener('click', (e) => {
            // 화면이 모바일 사이즈(768px 이하)일 때만 작동
            if (window.innerWidth <= 768) {
                
                // 디테일 페이지(.home-link)가 아닐 때만 토글 작동
                if (worksBtn.classList.contains('main-link') && !worksBtn.classList.contains('home-link')) {
                    e.preventDefault(); 
                    e.stopPropagation();
                    subMenu.classList.toggle('open');
                }
            }
        });
    }
});