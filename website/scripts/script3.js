document.addEventListener('DOMContentLoaded', () => { //배경 작업사진 랜덤, 클릭
  
  const bgImages = [
    './images/vitra/vitra1.webp',
    './images/gego/gego1.png',
    './images/goodmolecules/gm1.jpg',
    './images/blockparty/title.webp'
  ];

  

  const bgPhoto = document.getElementById('bg-photo');
  
  const bgContainer = document.getElementById('bg-photo-container');

  if (bgPhoto && bgContainer && bgImages.length > 0) {
    
    let currentIndex = Math.floor(Math.random() * bgImages.length);
    bgPhoto.src = bgImages[currentIndex];

    bgContainer.addEventListener('click', () => {
      
      currentIndex = (currentIndex + 1) % bgImages.length;
      
      bgPhoto.src = bgImages[currentIndex];
      
    });
  }
});



// 탭 펼치기 닫기
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


const images = [
  './images/종이1.webp',
  './images/종이2.webp',
  './images/종이3.webp'
];

let loadedCount = 0;
let currentIndex = 0;
let isAnimating = false;

const imageObjects = images.map(src => {
  const image = new Image();
  image.onload = () => {
    loadedCount++;
    if (loadedCount === images.length) {
      container.onclick = handleClick;
    }
  };
  image.src = src;
  return image;
});

const img = document.getElementById('stopmotion-img');
const container = document.getElementById('click-zone');
const clickZone = document.getElementById('click-zone');

const INTERVAL = [100, 130]; // 각 이미지 사이 딜레이 (ms), 취향에 맞게 조절

container.onclick = () => {
  if (isAnimating || loadedCount < images.length) return; // 애니메이션 중엔 클릭 무시
  isAnimating = true;

  const isForward = currentIndex < images.length - 1;
  const step = isForward ? 1 : -1;
  const target = isForward ? images.length - 1 : 0;
  let stepCount = 0;

  const animate = () => {
    currentIndex += step;
    img.src = images[currentIndex];
    stepCount++;

    if (currentIndex !== target) {
      setTimeout(animate, INTERVAL[stepCount]);
    } else {
      isAnimating = false;
      if (currentIndex === images.length - 1) {
      clickZone.classList.add('expanded');
      } else {
        clickZone.classList.remove('expanded');
      }
    }
  };
  setTimeout(animate, INTERVAL[0]);
};