const audio = new Audio();

const state = {
  current: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.9,
  search: '',
  searchResults: [],
  queue: [],
  liked: [],
  playlists: [
    { id: 'focus', name: 'Focus Flow', tracks: [] },
    { id: 'night', name: 'Late Night', tracks: [] }
  ],
  activePlaylistId: 'focus',
  shuffle: false,
  repeat: 'all',
  status: 'Search for any song to start playing.'
const tracks = [
  {
    id: 'sunrise',
    title: 'Sunrise Drive',
    artist: 'Nova Drift',
    album: 'City Lights',
    cover:
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=80',
    audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  },
  {
    id: 'neon',
    title: 'Neon Dreams',
    artist: 'Luma Wave',
    album: 'Future Pulse',
    cover:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1000&q=80',
    audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
  },
  {
    id: 'midnight',
    title: 'Midnight Ride',
    artist: 'Pulse Theory',
    album: 'Night Runner',
    cover:
      'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&w=1000&q=80',
    audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
  },
  {
    id: 'coastline',
    title: 'Coastline Echo',
    artist: 'Seafoam Club',
    album: 'Golden Hour',
    cover:
      'https://images.unsplash.com/photo-1501612780327-45045538702b?auto=format&fit=crop&w=1000&q=80',
    audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
  },
  {
    id: 'aurora',
    title: 'Aurora Bloom',
    artist: 'Aria Lane',
    album: 'Northern',
    cover:
      'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1000&q=80',
    audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'
  },
  {
    id: 'gravity',
    title: 'Gravity Loop',
    artist: 'Zenith',
    album: 'Orbit',
    cover:
      'https://images.unsplash.com/photo-1521335629791-ce4aec67dd47?auto=format&fit=crop&w=1000&q=80',
    audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3'
  }
];

const trackMap = Object.fromEntries(tracks.map((track) => [track.id, track]));
const audio = new Audio();

const state = {
  currentTrackId: tracks[0].id,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  queue: [],
  liked: ['aurora'],
  search: '',
  shuffle: false,
  repeat: 'all',
  playlists: [
    { id: 'focus', name: 'Focus Flow', tracks: ['sunrise', 'midnight', 'gravity'] },
    { id: 'night', name: 'Late Night', tracks: ['neon', 'aurora', 'coastline'] },
    { id: 'trip', name: 'Road Trip', tracks: ['midnight', 'coastline', 'sunrise', 'neon'] }
  ],
  activePlaylistId: 'focus'
};

const app = document.querySelector('#app');
audio.volume = state.volume;

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${min}:${sec}`;
};

const uid = () => `t-${Date.now()}-${Math.floor(Math.random() * 99999)}`;

const activePlaylist = () => state.playlists.find((p) => p.id === state.activePlaylistId);

const sameSong = (a, b) => a && b && a.id === b.id;

const setCurrent = async (track) => {
  if (!track) return;
  if (track.streamUrl) {
    state.current = track;
    if (audio.src !== track.streamUrl) {
      audio.src = track.streamUrl;
    }
    return;
  }

  state.status = 'Resolving audio stream...';
  render();
  const response = await fetch(`/api/resolve?id=${encodeURIComponent(track.id)}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Unable to resolve stream.');
  }
  const resolved = {
    ...track,
    title: data.title || track.title,
    artist: data.artist || track.artist,
    duration: data.duration || track.duration || 0,
    thumb: data.thumb || track.thumb,
    streamUrl: data.streamUrl
  };
  state.current = resolved;
  audio.src = resolved.streamUrl;
};

const playTrack = async (track, pushCurrent = false) => {
  try {
    if (pushCurrent && state.current && !sameSong(state.current, track)) {
      state.queue.push({ ...state.current });
    }
    if (!sameSong(state.current, track) || !state.current?.streamUrl) {
      await setCurrent(track);
    }
    await audio.play();
    state.isPlaying = true;
    state.status = `Playing: ${state.current.title}`;
  } catch (error) {
    state.isPlaying = false;
    state.status = `Playback failed: ${error.message}`;
audio.src = trackMap[state.currentTrackId].audio;

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${min}:${sec}`;
};

const randomTrack = () => {
  const choices = tracks.filter((track) => track.id !== state.currentTrackId);
  return choices[Math.floor(Math.random() * choices.length)] || tracks[0];
};

const setTrack = (trackId) => {
  if (!trackMap[trackId]) return;
  state.currentTrackId = trackId;
  state.currentTime = 0;
  state.duration = 0;
  audio.src = trackMap[trackId].audio;
};

const playTrack = async (trackId, pushCurrent = false) => {
  if (pushCurrent && trackId !== state.currentTrackId) {
    state.queue.push(state.currentTrackId);
  }
  if (trackId && trackId !== state.currentTrackId) {
    setTrack(trackId);
  }
  try {
    await audio.play();
    state.isPlaying = true;
  } catch {
    state.isPlaying = false;
  }
  render();
};

const pauseTrack = () => {
  audio.pause();
  state.isPlaying = false;
  render();
};

const nextTrack = async () => {
  if (state.queue.length) {
    const next = state.queue.shift();
    await playTrack(next);
    return;
  }

  const source = state.searchResults.length ? state.searchResults : activePlaylist().tracks;
  if (!source.length) {
    pauseTrack();
    state.status = 'Queue is empty. Search for songs to continue.';
    render();
    return;
  }

  if (state.repeat === 'one' && state.current) {
    await playTrack(state.current);
const nextTrack = () => {
  if (state.queue.length) {
    setTrack(state.queue.shift());
    playTrack(state.currentTrackId);
    return;
  }

  if (state.shuffle) {
    setTrack(randomTrack().id);
    playTrack(state.currentTrackId);
    return;
  }

  const currentIndex = tracks.findIndex((track) => track.id === state.currentTrackId);
  const isLast = currentIndex === tracks.length - 1;
  if (isLast && state.repeat === 'off') {
    pauseTrack();
    return;
  }
  const nextIndex = isLast ? 0 : currentIndex + 1;
  setTrack(tracks[nextIndex].id);
  playTrack(state.currentTrackId);
};

const previousTrack = () => {
  if (audio.currentTime > 4) {
    audio.currentTime = 0;
    return;
  }
  const source = state.searchResults.length ? state.searchResults : activePlaylist().tracks;
  if (!source.length) return;
  const index = source.findIndex((item) => state.current && item.id === state.current.id);
  const prevIndex = index <= 0 ? source.length - 1 : index - 1;
  await playTrack(source[prevIndex]);
};

const toggleLike = () => {
  if (!state.current) return;
  const exists = state.liked.find((track) => track.id === state.current.id);
  if (exists) {
    state.liked = state.liked.filter((track) => track.id !== state.current.id);
  } else {
    state.liked.push({ ...state.current });
  }
  render();
};

const searchSongs = async () => {
  const query = state.search.trim();
  if (!query) return;
  state.status = `Searching for "${query}"...`;
  render();
  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  const data = await response.json();
  if (!response.ok) {
    state.status = data.error || 'Search failed.';
    state.searchResults = [];
    render();
    return;
  }
  state.searchResults = data.results.map((item) => ({ ...item, key: uid() }));
  state.status = `Found ${state.searchResults.length} songs from YouTube.`;
  render();
};

const createPlaylist = (name) => {
  const trimmed = name.trim();
  if (!trimmed) return;
  const id = `p-${Date.now()}`;
  state.playlists.push({ id, name: trimmed, tracks: [] });
  state.activePlaylistId = id;
};

const addToPlaylist = (track) => {
  const playlist = activePlaylist();
  if (!playlist) return;
  if (!playlist.tracks.find((item) => item.id === track.id)) {
    playlist.tracks.push({ ...track, key: uid() });
  const currentIndex = tracks.findIndex((track) => track.id === state.currentTrackId);
  const prevIndex = currentIndex <= 0 ? tracks.length - 1 : currentIndex - 1;
  setTrack(tracks[prevIndex].id);
  playTrack(state.currentTrackId);
};

const cycleRepeat = () => {
  state.repeat = state.repeat === 'all' ? 'one' : state.repeat === 'one' ? 'off' : 'all';
  render();
};

const toggleLike = (id) => {
  if (state.liked.includes(id)) {
    state.liked = state.liked.filter((likedId) => likedId !== id);
  } else {
    state.liked.push(id);
  }
  render();
};

const removeQueue = (index) => {
  state.queue.splice(index, 1);
  render();
};

const repeatLabel = () => (state.repeat === 'one' ? '🔁1' : '🔁');

const isLikedCurrent = () => state.current && state.liked.some((track) => track.id === state.current.id);

const renderTrackButton = (track, extraActions = '') => `
  <div class="list-item inline">
    <button class="list-item main" data-action="play" data-track='${encodeURIComponent(JSON.stringify(track))}'>
      <img src="${track.thumb || ''}" alt="${track.title}" />
      <span>${track.title}<small>${track.artist}</small></span>
    </button>
    ${extraActions}
  </div>
`;

const render = () => {
  const playlist = activePlaylist();
const discoverTracks = () => {
  const q = state.search.toLowerCase().trim();
  if (!q) return tracks;
  return tracks.filter((track) =>
    [track.title, track.artist, track.album].some((text) => text.toLowerCase().includes(q))
  );
};

const activePlaylist = () => state.playlists.find((playlist) => playlist.id === state.activePlaylistId);

const render = () => {
  const currentTrack = trackMap[state.currentTrackId];
  const playlist = activePlaylist();
  const playlistTracks = (playlist?.tracks || []).map((id) => trackMap[id]).filter(Boolean);
  const queueTracks = state.queue.map((id) => trackMap[id]).filter(Boolean);
  const discovery = discoverTracks();

  app.innerHTML = `
    <div class="layout">
      <aside class="panel col">
        <h1>Bulby Beats</h1>
        <p class="muted">Search and play almost any song from YouTube audio streams.</p>
        <p class="muted">Luminous Spotify-inspired player.</p>

        <section class="panel inset">
          <h2>Playlists</h2>
          <div class="chips">
            ${state.playlists
              .map(
                (p) =>
                  `<button data-action="set-playlist" data-id="${p.id}" class="chip ${
                    p.id === state.activePlaylistId ? 'active' : ''
                  }">${p.name}</button>`
                (playlist) =>
                  `<button data-action="set-playlist" data-id="${playlist.id}" class="chip ${
                    state.activePlaylistId === playlist.id ? 'active' : ''
                  }">${playlist.name}</button>`
              )
              .join('')}
          </div>
          <form id="playlist-form" class="row">
            <input id="playlist-name" placeholder="Create playlist" />
            <button type="submit">Add</button>
          </form>
        </section>

        <section class="panel inset scroll">
          <h2>${playlist?.name || 'Playlist'}</h2>
          ${
            playlist?.tracks.length
              ? playlist.tracks
                  .map(
                    (track) =>
                      renderTrackButton(
                        track,
                        `<button data-action="enqueue" data-track='${encodeURIComponent(JSON.stringify(track))}'>Queue</button>`
                      )
                  )
                  .join('')
              : '<p class="muted">No songs in this playlist yet.</p>'
            playlistTracks.length
              ? playlistTracks
                  .map(
                    (track) => `
                      <button class="list-item" data-action="play" data-id="${track.id}">
                        <img src="${track.cover}" alt="${track.title}" />
                        <span>${track.title}<small>${track.artist}</small></span>
                      </button>
                    `
                  )
                  .join('')
              : '<p class="muted">No tracks yet. Add tracks from Discover.</p>'
          }
        </section>
      </aside>

      <main class="col">
        <section class="hero">
          <img class="hero-cover" src="${
            state.current?.thumb ||
            'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1000&q=80'
          }" alt="cover" />
          <div>
            <p class="muted">Now Playing</p>
            <h2>${state.current?.title || 'Nothing playing yet'}</h2>
            <h3>${state.current?.artist || 'Search for a song below'}</h3>
            <div class="row">
              <button data-action="shuffle" class="${state.shuffle ? 'active' : ''}">⤨</button>
              <button data-action="previous">⏮</button>
              <button data-action="toggle-play" class="play">${state.isPlaying ? '⏸' : '▶'}</button>
              <button data-action="next">⏭</button>
              <button data-action="repeat" class="${state.repeat !== 'off' ? 'active' : ''}">${repeatLabel()}</button>
              <button data-action="toggle-like" class="${isLikedCurrent() ? 'active' : ''}">${
    isLikedCurrent() ? '♥ Liked' : '♡ Like'
          <img class="hero-cover" src="${currentTrack.cover}" alt="${currentTrack.title}" />
          <div>
            <p class="muted">Now Playing</p>
            <h2>${currentTrack.title}</h2>
            <h3>${currentTrack.artist}</h3>
            <div class="row">
              <button data-action="toggle-shuffle" class="${state.shuffle ? 'active' : ''}">⤨</button>
              <button data-action="previous">⏮</button>
              <button data-action="toggle-play" class="play">${state.isPlaying ? '⏸' : '▶'}</button>
              <button data-action="next">⏭</button>
              <button data-action="repeat" class="${state.repeat !== 'off' ? 'active' : ''}">${
    state.repeat === 'one' ? '🔁1' : '🔁'
  }</button>
            </div>
            <div class="timeline">
              <span>${formatTime(state.currentTime)}</span>
              <input id="seek" type="range" min="0" max="${Math.floor(state.duration || 1)}" value="${Math.floor(
    state.currentTime
  )}" />
              <span>${formatTime(state.duration)}</span>
              <input id="seek" type="range" min="0" max="${Math.floor(state.duration || audio.duration || 420)}" value="${Math.floor(
    state.currentTime
  )}" />
              <span>${formatTime(state.duration || audio.duration)}</span>
            </div>
            <div class="timeline">
              <span>Volume</span>
              <input id="volume" type="range" min="0" max="1" step="0.01" value="${state.volume}" />
              <span>${Math.round(state.volume * 100)}%</span>
            </div>
            <p class="status">${state.status}</p>
          </div>
        </section>

        <section class="panel inset">
          <div class="row split">
            <h2>Search Songs</h2>
            <div class="row">
              <input id="search" placeholder="Search any song" value="${state.search}" />
              <button data-action="search">Search</button>
            </div>
          </div>
          <div class="grid">
            ${
              state.searchResults.length
                ? state.searchResults
                    .map(
                      (track) => `
                        <article class="card">
                          <img src="${track.thumb || ''}" alt="${track.title}" />
                          <h4>${track.title}</h4>
                          <p>${track.artist} • ${formatTime(track.duration)}</p>
                          <div class="row">
                            <button data-action="play-and-queue" data-track='${encodeURIComponent(JSON.stringify(track))}'>Play</button>
                            <button data-action="enqueue" data-track='${encodeURIComponent(JSON.stringify(track))}'>Queue</button>
                            <button data-action="add-playlist" data-track='${encodeURIComponent(JSON.stringify(track))}'>+Playlist</button>
                          </div>
                        </article>
                      `
                    )
                    .join('')
                : '<p class="muted">No results yet. Search above.</p>'
            }
            <h2>Discover</h2>
            <input id="search" placeholder="Search track, artist, album" value="${state.search}" />
          </div>
          <div class="grid">
            ${discovery
              .map(
                (track) => `
                  <article class="card">
                    <img src="${track.cover}" alt="${track.title}" />
                    <h4>${track.title}</h4>
                    <p>${track.artist} • ${track.album}</p>
                    <div class="row">
                      <button data-action="play-with-queue" data-id="${track.id}">Play</button>
                      <button data-action="enqueue" data-id="${track.id}">Queue</button>
                      <button data-action="add-to-playlist" data-id="${track.id}">+Playlist</button>
                      <button data-action="like" data-id="${track.id}">${
                        state.liked.includes(track.id) ? '♥' : '♡'
                      }</button>
                    </div>
                  </article>
                `
              )
              .join('')}
          </div>
        </section>
      </main>

      <aside class="panel col scroll">
        <h2>Queue</h2>
        ${
          state.queue.length
            ? state.queue
                .map((track, index) =>
                  renderTrackButton(
                    track,
                    `<button data-action="remove-queue" data-index="${index}">✕</button>`
                  )
          queueTracks.length
            ? queueTracks
                .map(
                  (track, index) => `
                    <div class="list-item inline">
                      <img src="${track.cover}" alt="${track.title}" />
                      <span>${track.title}<small>${track.artist}</small></span>
                      <button data-action="remove-queue" data-index="${index}">✕</button>
                    </div>
                  `
                )
                .join('')
            : '<p class="muted">Queue is empty.</p>'
        }
        <h2>Liked songs</h2>
        ${
          state.liked.length
            ? state.liked.map((track) => renderTrackButton(track)).join('')
            ? state.liked
                .map((id) => trackMap[id])
                .map(
                  (track) => `
                    <button class="list-item" data-action="play" data-id="${track.id}">
                      <img src="${track.cover}" alt="${track.title}" />
                      <span>${track.title}<small>${track.artist}</small></span>
                    </button>
                  `
                )
                .join('')
            : '<p class="muted">No liked songs yet.</p>'
        }
      </aside>
    </div>
  `;
};

app.addEventListener('click', async (event) => {
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const { action, id, index, track: trackJson } = target.dataset;
  const track = trackJson ? JSON.parse(decodeURIComponent(trackJson)) : null;

  try {
    switch (action) {
      case 'toggle-play':
        if (!state.current && state.searchResults.length) {
          await playTrack(state.searchResults[0]);
        } else if (state.isPlaying) {
          pauseTrack();
        } else if (state.current) {
          await playTrack(state.current);
        }
        break;
      case 'play':
        await playTrack(track);
        break;
      case 'play-and-queue':
        await playTrack(track, true);
        break;
      case 'enqueue':
        state.queue.push({ ...track, key: uid() });
        render();
        break;
      case 'remove-queue':
        removeQueue(Number(index));
        break;
      case 'next':
        await nextTrack();
        break;
      case 'previous':
        await previousTrack();
        break;
      case 'repeat':
        state.repeat = state.repeat === 'all' ? 'one' : state.repeat === 'one' ? 'off' : 'all';
        render();
        break;
      case 'shuffle':
        state.shuffle = !state.shuffle;
        render();
        break;
      case 'toggle-like':
        toggleLike();
        break;
      case 'set-playlist':
        state.activePlaylistId = id;
        render();
        break;
      case 'add-playlist':
        addToPlaylist(track);
        break;
      case 'search':
        await searchSongs();
        break;
      default:
        break;
    }
  } catch (error) {
    state.status = error.message;
    render();
app.addEventListener('click', (event) => {
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const { action, id, index } = target.dataset;

  switch (action) {
    case 'toggle-play':
      state.isPlaying ? pauseTrack() : playTrack(state.currentTrackId);
      break;
    case 'play':
      playTrack(id);
      break;
    case 'play-with-queue':
      playTrack(id, true);
      break;
    case 'next':
      nextTrack();
      break;
    case 'previous':
      previousTrack();
      break;
    case 'toggle-shuffle':
      state.shuffle = !state.shuffle;
      render();
      break;
    case 'repeat':
      cycleRepeat();
      break;
    case 'enqueue':
      state.queue.push(id);
      render();
      break;
    case 'remove-queue':
      state.queue.splice(Number(index), 1);
      render();
      break;
    case 'like':
      toggleLike(id);
      break;
    case 'set-playlist':
      state.activePlaylistId = id;
      render();
      break;
    case 'add-to-playlist': {
      const playlist = activePlaylist();
      if (playlist && !playlist.tracks.includes(id)) playlist.tracks.push(id);
      render();
      break;
    }
    default:
      break;
  }
});

app.addEventListener('input', (event) => {
  if (event.target.id === 'seek') {
    const value = Number(event.target.value);
    audio.currentTime = value;
    state.currentTime = value;
  }
  if (event.target.id === 'volume') {
    state.volume = Number(event.target.value);
    audio.volume = state.volume;
    const value = Number(event.target.value);
    state.volume = value;
    audio.volume = value;
    render();
  }
  if (event.target.id === 'search') {
    state.search = event.target.value;
  }
});

app.addEventListener('keydown', async (event) => {
  if (event.target.id === 'search' && event.key === 'Enter') {
    event.preventDefault();
    await searchSongs();
    render();
  }
});

app.addEventListener('submit', (event) => {
  if (event.target.id !== 'playlist-form') return;
  event.preventDefault();
  const input = document.querySelector('#playlist-name');
  createPlaylist(input.value);
  input.value = '';
  const name = input.value.trim();
  if (!name) return;
  const id = `custom-${Date.now()}`;
  state.playlists.push({ id, name, tracks: [] });
  state.activePlaylistId = id;
  render();
});

audio.addEventListener('loadedmetadata', () => {
  state.duration = audio.duration;
  render();
});

audio.addEventListener('timeupdate', () => {
  state.currentTime = audio.currentTime;
  const seek = document.querySelector('#seek');
  if (seek) seek.value = Math.floor(audio.currentTime);
  const firstTimelineValue = document.querySelector('.timeline span');
  if (firstTimelineValue) firstTimelineValue.textContent = formatTime(state.currentTime);
});

audio.addEventListener('loadedmetadata', () => {
  state.duration = audio.duration || state.current?.duration || 0;
  render();
});

audio.addEventListener('ended', async () => {
  await nextTrack();
  const timeNodes = document.querySelectorAll('.timeline span:first-child');
  if (timeNodes[0]) timeNodes[0].textContent = formatTime(state.currentTime);
});

audio.addEventListener('ended', () => {
  if (state.repeat === 'one') {
    audio.currentTime = 0;
    audio.play();
    return;
  }
  nextTrack();
});

render();
