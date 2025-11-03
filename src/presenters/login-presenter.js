import StoryModel from '../models/story-model';
import LoginView from '../views/login-view';

class LoginPresenter {
  constructor(viewContainer) {
    this._view = new LoginView(viewContainer);
  }

  async render() {
    this._view.render();
    
    this._view.setOnLoginSubmit(async () => {
      try {
        const { email, password } = this._view.getLoginInput();

        await StoryModel.login({ email, password });
        this._view.showSuccess('Login berhasil!');
      } catch (error) {
        this._view.showError(`Login gagal: ${error.message}`);
      }
    });
  }
}

export default LoginPresenter;