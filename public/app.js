let allBeats = [];
let currentBeat = null;
let previewTimeout = null;
const audio = document.getElementById('audio-player');

async function loadBeats() {
  try {
    const res = await fetch('/api/beats');
    allBeats = await res.json();
    renderBeats(allBeats);
  } catch (e) {
    console.error('Beatlar yüklenemedi:', e);
  }
}

function renderBeats(beats) {
  const grid = document.getElementById('beat-grid');
  if (beats.length === 0) {
    grid.innerHTML = '<div class="empty-state">No beats yet.</div>';
    return;
  }
  grid.innerHTML = beats.map(beat => `
    <div class="beat-card" data-id="${beat.id}">
      <img class="beat-cover" src="${beat.cover}" alt="${beat.title}">
      <div class="beat-info">
        <div class="beat-genre">${beat.genre}</div>
        <div class="beat-title">${beat.title}</div>
        <div class="beat-bottom">
          <div class="beat-price">${beat.price}₺</div>
          <button class="play-btn" onclick="togglePreview(${beat.id})">▶ Preview</button>
        </div>
      </div>
    </div>
  `).join('');
}

function filterBeats(genre) {
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  if (genre === 'all') {
    renderBeats(allBeats);
  } else {
    renderBeats(allBeats.filter(b => b.genre === genre));
  }
}

function togglePreview(beatId) {
  const beat = allBeats.find(b => b.id === beatId);
  if (!beat) return;

  if (currentBeat && currentBeat.id === beatId) {
    stopPreview();
    return;
  }

  stopPreview();
  currentBeat = beat;

  audio.src = beat.audio;
  audio.currentTime = 0;
  audio.play();

  // Player bar güncelle
  document.getElementById('player-cover').src = beat.cover;
  document.getElementById('player-title').textContent = beat.title;
  document.getElementById('player-genre').textContent = beat.genre;
  document.getElementById('player-buy-link').href = `https://wa.me/905418630425?text=Merhaba, "${beat.title}" beati satın almak istiyorum.`;
  document.getElementById('player-bar').classList.add('visible');

  // Buton güncelle
  updatePlayButtons(beatId, true);

  // 30 saniye sonra durdur
  previewTimeout = setTimeout(() => {
    stopPreview();
  }, 30000);
}

function stopPreview() {
  audio.pause();
  audio.currentTime = 0;
  clearTimeout(previewTimeout);
  if (currentBeat) {
    updatePlayButtons(currentBeat.id, false);
  }
  currentBeat = null;
  document.getElementById('player-bar').classList.remove('visible');
}

function updatePlayButtons(beatId, isPlaying) {
  document.querySelectorAll('.beat-card').forEach(card => {
    const btn = card.querySelector('.play-btn');
    if (card.dataset.id == beatId) {
      btn.textContent = isPlaying ? '■ Stop' : '▶ Preview';
      btn.classList.toggle('playing', isPlaying);
    } else {
      btn.textContent = '▶ Preview';
      btn.classList.remove('playing');
    }
  });
}

// Progress bar
audio.addEventListener('timeupdate', () => {
  const pct = (audio.currentTime / 30) * 100;
  document.getElementById('progress-fill').style.width = Math.min(pct, 100) + '%';
  const secs = Math.floor(audio.currentTime);
  document.getElementById('player-time').textContent = `0:${String(secs).padStart(2,'0')} / 0:30`;
});

function seekAudio(e) {
  const bar = document.getElementById('progress-bar');
  const pct = e.offsetX / bar.offsetWidth;
  audio.currentTime = pct * 30;
}

loadBeats();