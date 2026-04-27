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
    BASE_PATH + 'images/random/4.5.webp',
    BASE_PATH + 'images/random/02-1.webp',
    BASE_PATH + 'images/random/poster series.webp',
    BASE_PATH + 'images/random/thumbnail.webp',
    BASE_PATH + 'images/random/motion_steel.webp'
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
      v.load();
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
      render();
    }
  });

  // ── label 클릭: 해당 폴더의 인덱스로 (다른 폴더 보존)
folderProjects.querySelector('.label-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    state.projects = 'open';
    history.pushState(null, '', INDEX_URL);
    folderProjects.querySelector('.tab-detail-name').textContent = ''; // ✅ 추가
    render();
  });

  folderArchive.querySelector('.label-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    state.archive = 'open';
    if (state.projects === 'closed') state.projects = 'open';
    history.pushState(null, '', INDEX_URL + '?open=archive');
    folderArchive.querySelector('.tab-detail-name').textContent = ''; // ✅ 추가
    render();
    setTimeout(scatterPhotos, 100);
  });

  // ── projects tab 빈공간 클릭
  folderProjects.querySelector('.tab-toggle').addEventListener('click', () => {
    if (state.archive === 'detail') {
      state.archive = 'closed';
      state.projects = 'open';
      render();
      return;
    }
    if (state.archive === 'open') {
      state.archive = 'closed';
      render();
      return;
    }

    // archive closed → projects 토글
    if (state.projects === 'detail' || state.projects === 'open') {
      state.projects = 'closed';
    } else {
      // ✅ 닫혀있다가 열 때: 마지막 상태(detail이 있으면 detail, 없으면 open)
      const hasDetail = pageProject.querySelector('.detail-wrapper');
      state.projects = hasDetail ? 'detail' : 'open';
    }
    render();
  });

  // ── archive tab 빈공간 클릭
  folderArchive.querySelector('.tab-toggle').addEventListener('click', () => {
    if (state.archive === 'detail' || state.archive === 'open') {
      state.archive = 'closed';
    } else {
      // ✅ 마지막 상태 복원
      const hasDetail = pageArchive.querySelector('.detail-wrapper');
      state.archive = hasDetail ? 'detail' : 'open';
      if (state.projects === 'closed') state.projects = 'open';
      if (state.archive === 'open') setTimeout(scatterPhotos, 100);
    }
    render();
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
        if (isArchivePage) {
          folderArchive.querySelector('.tab-detail-name').textContent = detailName || '';
        } else {
          folderProjects.querySelector('.tab-detail-name').textContent = detailName || '';
        }

        if (newBg) crossfadeTo(newBg);

        history.pushState({ url, isArchivePage }, '', url);
        render();
        playAllVideos();
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

  // ── 아카이브 사진 흩뿌리기
  const savedPos = [];
  function scatterPhotos() {
    const photos = pageArchive.querySelectorAll('#photo-pile .pile-photo');
    photos.forEach((photo, i) => {
      if (!savedPos[i]) {
        savedPos[i] = {
          left: Math.random() * 65 + 15,
          top: Math.random() * 60 + 20,
          z: Math.floor(Math.random() * photos.length)
        };
      }
      photo.style.left = `${savedPos[i].left}%`;
      photo.style.top = `${savedPos[i].top}%`;
      photo.style.transform = 'translate(-50%, -50%)';
      photo.style.zIndex = savedPos[i].z;
      requestAnimationFrame(() => { photo.style.opacity = '1'; });
    });
  }
  setTimeout(scatterPhotos, 50);

});

