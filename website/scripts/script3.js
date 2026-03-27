// 1. [핵심] 페이지 로드 상태와 상관없이 즉시 실행되는 함수
const setupFolders = () => {
  const folders = document.querySelectorAll('.folder');
  if (folders.length === 0) return; 

  const urlParams = new URLSearchParams(window.location.search);
  const targetId = urlParams.get('open');

  // [원리 1] 닫혀있는 폴더들의 층수 (항상 열린 폴더들보다 높아야 왼쪽 탭이 안 가려짐)
  const getBaseZ = (index) => 1000 - index; // Projects: 1000, Archive: 999, About: 998
  
  // [원리 2] 열리는 폴더들을 쌓아올릴 카운터 (닫힌 탭보단 낮게 시작)
  let currentOpenZ = 10; 

  folders.forEach((folder, index) => {
    const baseZ = getBaseZ(index);

    // 초기 상태 층수 할당
    if (!folder.classList.contains('open')) {
      folder.style.zIndex = baseZ;
    }

    // Go Back으로 돌아왔을 때 즉시 열기
    if (targetId && folder.id === `folder-${targetId}`) {
      folder.classList.add('open', 'instant');
      folder.style.zIndex = ++currentOpenZ; // 열리는 즉시 카운터 증가

      setTimeout(() => {
        folder.classList.remove('instant');
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 50);
    }

    // 탭 클릭 이벤트
    const tab = folder.querySelector('.tab');
    if (tab) {
      tab.onclick = () => {
        const isOpen = folder.classList.contains('open');

        if (isOpen) {
          // 현재 열려있는 폴더들 중 가장 높은 z-index 찾기
          const openedFolders = Array.from(folders).filter(f => f.classList.contains('open'));
          const maxZ = Math.max(...openedFolders.map(f => parseInt(f.style.zIndex) || 0));

          if (parseInt(folder.style.zIndex) === maxZ) {
            // 내가 열린 폴더들 중 맨 위에 있으면 -> '닫기'
            folder.classList.remove('open');
          } else {
            // 다른 열린 폴더에 가려져 있으면 -> '맨 앞으로 꺼내오기'
            folder.style.zIndex = ++currentOpenZ;
          }
        } else {
          // 새로 열 때 -> 무조건 기존 열린 폴더들을 덮으면서 나오도록 층수 증가!
          folder.style.zIndex = ++currentOpenZ;
          folder.classList.add('open');
        }
      };
    }

    // 애니메이션이 완전히 끝난 후 층수 복구 (닫힐 때 끊김 방지)
    folder.ontransitionend = (e) => {
      if (e.propertyName === 'transform' && !folder.classList.contains('open')) {
        folder.style.zIndex = baseZ;
      }
    };
  });
};

// 2. 브라우저가 요소를 읽자마자 실행 시도 (깜빡임 방지)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupFolders);
} else {
  setupFolders();
}

/* --- 아래는 기존 이미지 및 날짜 로직 (동일) --- */
const imageFiles = [
  'bp1.webp',
  'bp4.webp',
  'bp5.webp',
  'cf1.webp',
  'cl2.jpg',
  'cl4.jpg',
  'gm5.jpg', 
  'thumb.png',
  'gm4.jpg'
];
const shuffledImages = [...imageFiles].sort(() => 0.5 - Math.random());
const bgSheets = document.querySelectorAll('.sheet-1, .sheet-2, .sheet-3');

bgSheets.forEach((sheet, index) => {
  let randomAngle = Math.floor(Math.random() * 21) + 15; 
  if (index % 2 === 0) randomAngle = -randomAngle; 
  sheet.style.transform = `rotate(${randomAngle}deg)`;
  if (shuffledImages[index]) {
    const preloadedImg = new Image();
    preloadedImg.src = `./images/random/${shuffledImages[index]}`;
    preloadedImg.onload = () => { sheet.style.backgroundImage = `url('${preloadedImg.src}')`; };
  }
});

const updateDateElement = document.getElementById('update-date');
if (updateDateElement) {
  const lastMod = new Date(document.lastModified);
  updateDateElement.textContent = `${lastMod.getFullYear()}. ${String(lastMod.getMonth() + 1).padStart(2, '0')}. ${String(lastMod.getDate()).padStart(2, '0')}.`;
}

/* --- 프로젝트 태그(project-type) 랜덤 기울기 --- */
const projectTags = document.querySelectorAll('.project-type');

projectTags.forEach(tag => {
  // -6도에서 6도 사이의 랜덤한 각도를 만듭니다. (각도가 너무 크면 글씨 읽기 힘듦)
  const randomAngle = Math.floor(Math.random() * 13) - 6; 
  
  // 각 태그마다 랜덤 각도를 개별적으로 적용합니다.
  tag.style.transform = `rotate(${randomAngle}deg)`;
});



//archive//

function scatterPhotos() {
  const pile = document.getElementById('photo-pile');
  if (!pile) return;

  const photos = pile.querySelectorAll('.pile-photo');
  
  // 흩뿌려질 운동장의 넓이
  const containerWidth = pile.offsetWidth;
  const containerHeight = pile.offsetHeight;

  photos.forEach((photo, index) => {
    // 💡 1. 랜덤 좌표 계산 (사진 크기를 고려해 가장자리 마진 줌)
    const margin = 100; // 사진이 밖으로 안 나가게 하는 여백
    const randomX = Math.floor(Math.random() * 80) + 10;
    const randomY = Math.floor(Math.random() * 80) + 10; 

    // 💡 3. 랜덤 Stacking order (겹치는 순서)
    const randomZ = Math.floor(Math.random() * photos.length);

    // 💡 4. CSS 속성 적용
    photo.style.left = `${randomX}%`;
    photo.style.top = `${randomY}%`;
    photo.style.transform = `translate(-50%, -50%)`;
    photo.style.zIndex = randomZ;
    
    // 처음엔 투명했다가 서서히 나타나게 하면 더 멋집니다
    photo.style.opacity = 0;
    setTimeout(() => {
        photo.style.opacity = 1;
    }, index * 50); // 순차적으로 나타나는 효과
  });
}

// 🚀 실행 방법 1: 페이지 로드 시 흩뿌리기
window.addEventListener('load', scatterPhotos);