import savedTemplate from './templates/saved.html';
import { getAllStoriesIDB, deleteStory } from '../utils/idb';

class SavedView {
  constructor(container) {
    this._container = container;
  }

  render() {
    this._container.innerHTML = savedTemplate;
    this.renderSavedList();
  }

  async renderSavedList() {
    const listEl = document.querySelector('#saved-list');
    listEl.innerHTML = '<p>Memuat…</p>';
    const items = await getAllStoriesIDB();

    if (!items.length) {
      listEl.innerHTML = '<p>Tidak ada story tersimpan.</p>';
      return;
    }

    listEl.innerHTML = '';
    items.forEach(story => {
      const card = document.createElement('div');
      card.className = 'story-item';
      card.innerHTML = `
        <img src="${story.photoUrl}" alt="Foto cerita dari ${story.name}">
        <h3>${story.name}</h3>
        <p>${story.description}</p>
        <small>Disimpan: ${new Date(story.createdAt).toLocaleString()}</small>
        <div style="margin:.5rem; display:flex; gap:.5rem;">
          <button class="btn-delete-local" data-id="${story.id}">Unsave</button>
        </div>
      `;
      listEl.appendChild(card);
    });

    listEl.addEventListener('click', async (e) => {
      const del = e.target.closest('.btn-delete-local');
      if (del) {
        await deleteStory(del.dataset.id);
        this.renderSavedList();
        alert('Story dihapus dari penyimpanan lokal.');
      }
    });
  }
}

export default SavedView;
