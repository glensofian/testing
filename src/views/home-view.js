import homeTemplate from './templates/home.html';
import { openDBStories, deleteStory, putStories } from '../utils/idb';

class HomeView {
  constructor(container) {
    this._container = container;
    this._map = null;
    this._markers = {};
  }

  render() {
    this._container.innerHTML = homeTemplate;
  }

  renderStoryList(stories) {
    const container = document.querySelector('#story-list');
    container.innerHTML = '';
    stories.forEach((story) => {
      const storyItem = document.createElement('div');
      storyItem.classList.add('story-item');

      if (story.lat && story.lon) {
        storyItem.dataset.id = story.id;
        storyItem.dataset.lat = story.lat;
        storyItem.dataset.lon = story.lon;
        storyItem.classList.add('story-item--clickable');
      }

      storyItem.innerHTML = `
        <img src="${story.photoUrl}" alt="Foto cerita dari ${story.name}">
        <h3>${story.name}</h3>
        <p>${story.description}</p>
        <small>Dibuat pada: ${new Date(story.createdAt).toLocaleDateString()}</small>
        <div style="margin-top:.5rem; display:flex; gap:.5rem;">
          <button class="btn-save-offline" data-id="${story.id}">Simpan Offline</button>
          <button class="btn-delete-local" data-id="${story.id}">Hapus Lokal</button>
        </div>
      `;
      container.appendChild(storyItem);
    });
  }

  renderMap(stories) {
    const storiesWithLocation = stories.filter(story => story.lat && story.lon);
    const mapContainer = document.querySelector('#stories-map');

    if (storiesWithLocation.length === 0) {
      mapContainer.innerHTML = '<p>Tidak ada cerita dengan data lokasi untuk ditampilkan di peta.</p>';
      return;
    }

    this._map = L.map('stories-map').setView([storiesWithLocation[0].lat, storiesWithLocation[0].lon], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this._map);

    storiesWithLocation.forEach(story => {
      const marker = L.marker([story.lat, story.lon]).addTo(this._map);
      marker.bindPopup(`
        <div class="popup-content">
          <img src="${story.photoUrl}" alt="${story.name}" style="width:100%; border-radius:4px;">
          <b>${story.name}</b>
          <p>${story.description.substring(0, 50)}...</p>
        </div>
      `);
      this._markers[story.id] = marker;
    });
  }
  
  setOnStoryItemClick(callback) {
    document.querySelector('#story-list').addEventListener('click', (event) => {
      const storyItem = event.target.closest('.story-item--clickable');
      if (storyItem) {
        const { lat, lon, id } = storyItem.dataset;
        callback({ lat, lon, id });
      }
    });
  }

  async bindOfflineButtons() {
    document.querySelector('#story-list').addEventListener('click', async (e) => {
      const saveBtn = e.target.closest('.btn-save-offline');
      const delBtn = e.target.closest('.btn-delete-local');
      if (saveBtn) {
        const card = saveBtn.closest('.story-item');
        const data = {
          id: card.dataset.id || crypto.randomUUID(),
          name: card.querySelector('h3').textContent,
          description: card.querySelector('p').textContent,
          photoUrl: card.querySelector('img').src,
          createdAt: new Date().toISOString(),
          lat: Number(card.dataset.lat) || null,
          lon: Number(card.dataset.lon) || null,
        };
        await putStories([data]);
        alert('Disimpan ke Offline');
      }
      if (delBtn) {
        const id = delBtn.dataset.id;
        await deleteStory(id);
        alert('Dihapus dari penyimpanan lokal');
      }
    });
  }

  focusMapOnStory({ lat, lon, id }) {
    if (this._map && this._markers[id]) {
      this._map.flyTo([lat, lon], 15);
      this._markers[id].openPopup();
    }
  }

  showError(message) {
    document.querySelector('#story-list').innerHTML = `<p>${message}</p>`;
  }

  redirectToLogin() {
    window.location.hash = '#/login';
  }
}

export default HomeView;
