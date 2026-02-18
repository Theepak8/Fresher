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
    return;
  }

  if (state.shuffle) {
    const random = source[Math.floor(Math.random() * source.length)];
    await playTrack(random);
    return;
  }

  const index = source.findIndex((item) => state.current && item.id === state.current.id);
  const atEnd = index === source.length - 1;
  if (atEnd && state.repeat === 'off') {
    pauseTrack();
    state.status = 'Reached end of list.';
    render();
    return;
  }
  const nextIndex = index < 0 || atEnd ? 0 : index + 1;
  await playTrack(source[nextIndex]);
};

const previousTrack = async () => {
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
  app.innerHTML = `
    <div class="layout">
      <aside class="panel col">
        <h1>Bulby Beats</h1>
        <p class="muted">Search and play almost any song from YouTube audio streams.</p>

        <section class="panel inset">
          <h2>Playlists</h2>
          <div class="chips">
            ${state.playlists
              .map(
                (p) =>
                  `<button data-action="set-playlist" data-id="${p.id}" class="chip ${
                    p.id === state.activePlaylistId ? 'active' : ''
                  }">${p.name}</button>`
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
  }</button>
            </div>
            <div class="timeline">
              <span>${formatTime(state.currentTime)}</span>
              <input id="seek" type="range" min="0" max="${Math.floor(state.duration || 1)}" value="${Math.floor(
    state.currentTime
  )}" />
              <span>${formatTime(state.duration)}</span>
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
                )
                .join('')
            : '<p class="muted">Queue is empty.</p>'
        }
        <h2>Liked songs</h2>
        ${
          state.liked.length
            ? state.liked.map((track) => renderTrackButton(track)).join('')
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
  }
});

app.addEventListener('submit', (event) => {
  if (event.target.id !== 'playlist-form') return;
  event.preventDefault();
  const input = document.querySelector('#playlist-name');
  createPlaylist(input.value);
  input.value = '';
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
});

render();
