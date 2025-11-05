import SavedView from '../views/saved-view';

class SavedPresenter {
  constructor(viewContainer) {
    this._view = new SavedView(viewContainer);
  }
  async render() {
    this._view.render();
  }
}

export default SavedPresenter;
