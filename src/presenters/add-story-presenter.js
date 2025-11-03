import StoryModel from '../models/story-model';
import AddStoryView from '../views/add-story-view';

class AddStoryPresenter {
  constructor(viewContainer) {
    this._view = new AddStoryView(viewContainer);
  }

  async render() {
    this._view.render();
    this._view.setOnSubmit(async () => {
      const formData = this._view.getStoryInput();
      if (formData) {
        try {
          await StoryModel.addNewStory(formData);
          this._view.showSuccess('Cerita berhasil diunggah!');

          if (Notification.permission === 'granted' && navigator.serviceWorker?.ready) {
            (await navigator.serviceWorker.ready).showNotification('Story berhasil dibuat', {
              body: 'Anda telah membuat story baru!',
              icon: '/icons/icon-192.png'
            });
          }
        } catch (error) {
          this._view.showError(`Gagal mengunggah cerita: ${error.message}`);
        }
      }
    });
  }
}

export default AddStoryPresenter;
