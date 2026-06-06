document.addEventListener('DOMContentLoaded', () => {

  // ── 절대경로
  const getBasePath = () => {
    const path = window.location.pathname;
    if (path.includes('/html/')) return path.split('/html/')[0] + '/';
    return path.substring(0, path.lastIndexOf('/') + 1);
  };
  const BASE_PATH = getBasePath();
  const INDEX_URL = window.location.origin + BASE_PATH + 'index.html';

  // 상세 페이지 직접 새로고침 → 인덱스로 리다이렉트
  if (!document.getElementById('bg-photo-container')) {
    window.location.replace(INDEX_URL + '?page=' + encodeURIComponent(window.location.href));
    return;
  }

  // ── BG 이미지
  const bgImages = [
    BASE_PATH + 'images/random/book_mockup.webp',
    BASE_PATH + 'images/random/02-1.webp',
    BASE_PATH + 'images/random/ill.webp',
    BASE_PATH + 'images/random/lineupposter.webp',
    BASE_PATH + 'images/random/outdoor_wall.webp',
    BASE_PATH + 'images/random/sstationary.webp',
    BASE_PATH + 'images/random/truck.webp',
    BASE_PATH + 'images/random/poster_series.webp',
    BASE_PATH + 'images/random/pamCube.webp',
    BASE_PATH + 'images/random/last.webp'
  ];
  const bgPhoto = document.getElementById('bg-photo');
  const bgContainer = document.getElementById('bg-photo-container');
  let bgIndex = Math.floor(Math.random() * bgImages.length);
  bgPhoto.src = bgImages[bgIndex];

  // ── 폴더 요소
  const folderProjects = document.getElementById('folder-projects');
  const folderArchive = document.getElementById('folder-archive');
  const pageProject = folderProjects.querySelector('.page.project');
  const pageArchive = folderArchive.querySelector('.page.archive');
  const projectGrid = pageProject.querySelector('.project-grid');
  const archivePile = pageArchive.querySelector('.chaotic-photo-pile');

  // ── 상태 (단일 진실원)
  // 'closed' | 'open' | 'detail'
  const state = { projects: 'open', archive: 'closed' };
  

  // ── 상대경로 → 절대경로
  const fixPaths = (root, baseUrl) => {
    if (!root) return;
    root.querySelectorAll('[src], [href]').forEach(el => {
      ['src', 'href'].forEach(attr => {
        const val = el.getAttribute(attr);
        if (!val) return;
        if (/^(https?:|blob:|data:|#|mailto:)/.test(val)) return;
        el.setAttribute(attr, new URL(val, baseUrl).href);
      });
    });
  };
  fixPaths(pageProject, INDEX_URL);
  fixPaths(pageArchive, INDEX_URL);

  // ── 렌더링: 상태 → 클래스만 토글 (위치는 CSS가 결정)
  function render() {
    folderProjects.classList.toggle('open', state.projects === 'open');
    folderProjects.classList.toggle('detail-mode', state.projects === 'detail');
    folderArchive.classList.toggle('open', state.archive === 'open');
    folderArchive.classList.toggle('detail-mode', state.archive === 'detail');

    // 프로젝트 콘텐츠: detail/open 전환만 처리, closed는 마지막 상태 유지
    const projDetail = pageProject.querySelector('.detail-wrapper');
    if (state.projects === 'detail') {
      projectGrid.style.display = 'none';
      if (projDetail) projDetail.style.display = '';
    } else if (state.projects === 'open') {
      projectGrid.style.display = '';
      if (projDetail) projDetail.style.display = 'none';
    }
    // closed일 때는 콘텐츠 안 건드림 → transition 부드러움 + 마지막 상태 유지

    // 아카이브 콘텐츠: 동일
    const archDetail = pageArchive.querySelector('.detail-wrapper');
    if (state.archive === 'detail') {
      archivePile.style.display = 'none';
      if (archDetail) archDetail.style.display = '';
    } else if (state.archive === 'open') {
      archivePile.style.display = '';
      if (archDetail) archDetail.style.display = 'none';
    }

    const isAnyTabOpen = state.projects !== 'closed' || state.archive !== 'closed';
    document.body.classList.toggle('tab-open', isAnyTabOpen);
    }

    // ── 상세 콘텐츠 삽입
    function insertDetail(page, html) {
      page.querySelector('.detail-wrapper')?.remove();
      const wrapper = document.createElement('div');
      wrapper.className = 'detail-wrapper';
      wrapper.innerHTML = html;
      page.appendChild(wrapper);
    }

    function playAllVideos() {
      document.querySelectorAll('video').forEach(v => {
        //v.load();
        v.play().catch(() => {});
      });
    }

    const bgPhotoNext = document.getElementById('bg-photo-next');
    let activeBg = bgPhoto;
    let inactiveBg = bgPhotoNext;

    // 초기 상태 명확히
    activeBg.style.opacity = '1';
    inactiveBg.style.opacity = '0';

    function crossfadeTo(src) {
      const preload = new Image();
      preload.onload = () => {
        inactiveBg.src = src;

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            inactiveBg.style.transition = 'opacity 2s ease';
            activeBg.style.transition = 'opacity 2s ease';
            inactiveBg.style.opacity = '1';
            activeBg.style.opacity = '0';

            // 페이드 끝난 다음에 역할 swap
            const oldActive = activeBg;
            const newActive = inactiveBg;
            activeBg = newActive;
            inactiveBg = oldActive;
          });
        });
      };
    preload.src = src;
  }

  // ── BG 자동 전환
  setInterval(() => {
    if (state.projects !== 'closed' || state.archive !== 'closed') return;
    bgIndex = (bgIndex + 1) % bgImages.length;
    crossfadeTo(bgImages[bgIndex]);
  }, 5000);

  // BG 클릭: 모두 닫기
  bgContainer.addEventListener('click', () => {
    if (state.projects !== 'closed' || state.archive !== 'closed') {
      state.projects = 'closed';
      state.archive = 'closed';

      document.documentElement.style.setProperty('--bg-gradient-color', 'rgba(18, 18, 18, 1)');
      render();
    }
  });

  const aboutMeArea = document.querySelector('.about-me');
  if (aboutMeArea) {
    aboutMeArea.addEventListener('click', (e) => {
      // 탭(프로젝트나 아카이브)이 하나라도 열려있을 때 발동!
      if (state.projects !== 'closed' || state.archive !== 'closed') {
        e.preventDefault(); // Eugene Ahn이나 메일 링크를 눌러도 페이지 이동 안 하게 멱살 꽉 잡음!
        
        state.projects = 'closed';
        state.archive = 'closed';
        document.documentElement.style.setProperty('--bg-gradient-color', 'rgba(18, 18, 18, 1)');
        render(); // 탭 닫기 실행!
      }
    });
  }

 // ── Projects 탭 클릭 로직 (라벨 + 빈공간 통합)
  folderProjects.querySelector('.tab').addEventListener('click', (e) => {
    const isLabelClick = e.target.closest('.label-btn');

    // 상황 1: 아카이브가 열려 있어서 프로젝트가 메인이 아닐 때 (아카이브에 덮여있을 때)
    if (state.archive !== 'closed') {
      state.archive = 'closed'; // 라벨이든 빈공간이든 무조건 아카이브를 닫아서 프로젝트를 메인으로 꺼냄
      render();
      return;
    }

    // 상황 2: 프로젝트가 완전히 닫혀있을 때
    if (state.projects === 'closed') {
      const detail = pageProject.querySelector('.detail-wrapper');
      state.projects = detail ? 'detail' : 'open';
      
      // ✅ detail이면 저장된 색 복원
      if (detail && detail.dataset.color) {
        document.documentElement.style.setProperty('--bg-gradient-color', detail.dataset.color);
      }
      
      render();
      return;
    }

    // 상황 3: 프로젝트가 메인으로 열려있을 때
    if (isLabelClick) {
      // 3-A. 라벨 클릭: 폴더 목록으로 돌아가기 (제자리 거나 상세에서 나오기)
      state.projects = 'open';
      history.pushState(null, '', INDEX_URL);
      pageProject.querySelector('.detail-wrapper')?.remove();
      const tabName = folderProjects.querySelector('.tab-detail-name');
      tabName.textContent = '';
      tabName.style.color = '';
      render();
    } else {
      // 3-B. 빈 공간 클릭: 탭 닫기
      state.projects = 'closed';
      if (state.archive === 'closed') {
        document.documentElement.style.setProperty('--bg-gradient-color', 'rgba(18, 18, 18, 1)');
      }
      render();
    }
  });

  // ── Archive 탭 클릭 로직 (라벨 + 빈공간 통합)
  folderArchive.querySelector('.tab').addEventListener('click', (e) => {
    const isLabelClick = e.target.closest('.label-btn');

    // 상황 1: 아카이브가 닫혀있을 때
    if (state.archive === 'closed') {
      const detail = pageArchive.querySelector('.detail-wrapper');
      state.archive = detail ? 'detail' : 'open';
      
      // ✅ detail이면 저장된 색 복원
      if (detail && detail.dataset.color) {
        document.documentElement.style.setProperty('--bg-gradient-color', detail.dataset.color);
      }
      
      if (state.projects === 'closed') state.projects = 'open';
      history.pushState(null, '', INDEX_URL + '?open=archive');
      if (state.archive === 'open') setTimeout(scatterPhotos, 100);
      render();
      return;
    }

    // 상황 2: 아카이브가 메인으로 열려있을 때 (아카이브는 항상 최상단이므로 덮일 일이 없음)
    if (isLabelClick) {
      // 2-A. 라벨 클릭: 사진 더미(폴더)로 돌아가기
      state.archive = 'open';
      history.pushState(null, '', INDEX_URL + '?open=archive');
      pageArchive.querySelector('.detail-wrapper')?.remove();
      const tabName = folderArchive.querySelector('.tab-detail-name');
      tabName.textContent = '';
      tabName.style.color = '';
      render();
      setTimeout(scatterPhotos, 100);
    } else {
      // 2-B. 빈 공간 클릭: 탭 닫기
      state.archive = 'closed';
      if (state.projects === 'closed') {
        document.documentElement.style.setProperty('--bg-gradient-color', 'rgb(18, 18, 18)');
      }
      render();
    }
  });

  // ── SPA loadPage
  function loadPage(url) {
    fetch(url)
      .then(res => res.text())
      .then(html => {
        const baseUrl = new URL(url, window.location.href).href;
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const sourcePage = doc.querySelector('.page.project, .page.archive');
        if (!sourcePage) return;
        fixPaths(sourcePage, baseUrl);

        const isArchivePage = !!doc.getElementById('folder-archive')?.classList.contains('detail-mode');
        const newContent = sourcePage.innerHTML;
        const newBg = doc.body.dataset.bg
          ? new URL(doc.body.dataset.bg, baseUrl).href
          : null;

        if (isArchivePage) {
          insertDetail(pageArchive, newContent);
          state.archive = 'detail';
          if (state.projects === 'closed') state.projects = 'open';
        } else {
          insertDetail(pageProject, newContent);
          state.projects = 'detail';
          state.archive = 'closed';
        }

        const detailName = doc.querySelector('.detail-name')?.textContent?.trim();
        const detailColor = doc.body.dataset.color;

        if (detailColor) {
          document.documentElement.style.setProperty('--bg-gradient-color', detailColor);

          const wrapper = isArchivePage 
            ? pageArchive.querySelector('.detail-wrapper')
            : pageProject.querySelector('.detail-wrapper');
          if (wrapper) wrapper.dataset.color = detailColor;
        }

        if (isArchivePage) {
          const tabName = folderArchive.querySelector('.tab-detail-name');
          tabName.textContent = detailName || '';
          tabName.style.color = detailColor || '';
        } else {
          const tabName = folderProjects.querySelector('.tab-detail-name');
          tabName.textContent = detailName || '';
          tabName.style.color = detailColor || '';
        }

        if (newBg) crossfadeTo(newBg);

        history.pushState({ url, isArchivePage }, '', url);
        render();
        playAllVideos();

        if (isArchivePage) {
          pageArchive.scrollTop = 0;
        } else {
          pageProject.scrollTop = 0;
        }
      })
      .catch(err => console.error('loadPage error:', err));
  }

  // ── 초기 렌더링 (transition 없이)
  folderProjects.style.transition = 'none';
  folderArchive.style.transition = 'none';

  const params = new URLSearchParams(window.location.search);
  const targetPage = params.get('page');
  const targetOpen = params.get('open');

  if (targetPage) {
    loadPage(targetPage);
  } else if (targetOpen === 'archive') {
    state.projects = 'open';
    state.archive = 'open';
  } else {
    state.projects = 'closed';
    state.archive = 'closed';
  }

  render();
  void document.body.offsetHeight;
  requestAnimationFrame(() => {
    folderProjects.style.transition = '';
    folderArchive.style.transition = '';
  });

  // ── SPA 라우팅
  document.addEventListener('click', (e) => {
    if (e.target.closest('.tab')) return;
    const link = e.target.closest('a');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto')) return;
    if (link.hostname && link.hostname !== window.location.hostname) return;
    if (link.target === '_blank' || link.hasAttribute('download')) return;

    e.preventDefault();
    loadPage(link.href);
  });

  window.addEventListener('popstate', (e) => {
    if (e.state?.url) {
      loadPage(e.state.url);
    } else {
      const p = new URLSearchParams(window.location.search);
      if (p.get('open') === 'archive') {
        state.projects = 'open';
        state.archive = 'open';
      } else {
        state.projects = 'open';
        state.archive = 'closed';
      }
      render();
    }
  });

  // ── 아카이브 사진 흩뿌리기 (안 겹치게)
  const savedPos = [];
  function scatterPhotos() {
    const photos = pageArchive.querySelectorAll('#photo-pile .pile-photo');
    const minDistance = 15; 
    const maxAttempts = 200; 
    const aspectRatio = window.innerWidth / window.innerHeight; 

    photos.forEach((photo, i) => {
      if (!savedPos[i]) {
        let left, top;
        let attempts = 0;

        while (attempts < maxAttempts) {
          left = Math.random() * 80 + 10;
          top = Math.random() * 80 + 10; 

          const tooClose = savedPos.some(pos => {
            if (!pos) return false;
            const dx = pos.left - left;
            const dy = (pos.top - top) * aspectRatio; 
            return Math.sqrt(dx * dx + dy * dy) < minDistance;
          });

          if (!tooClose) break;
          attempts++;
        }

        savedPos[i] = {
          left,
          top,
          z: Math.floor(Math.random() * photos.length)
        };
      }
      
      photo.style.left = `${savedPos[i].left}%`;
      photo.style.top = `${savedPos[i].top}%`;
      photo.style.zIndex = savedPos[i].z;
      
      /* 회전값 제거, 중앙 기준점만 유지 */
      photo.style.transform = 'translate(-50%, -50%)';
      
      requestAnimationFrame(() => { photo.style.opacity = '1'; });
    });
  }
  setTimeout(scatterPhotos, 50);
});
