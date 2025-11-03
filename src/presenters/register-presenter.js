import StoryModel from '../models/story-model';
import RegisterView from '../views/register-view';

class RegisterPresenter {
  constructor(viewContainer) {
    this._view = new RegisterView(viewContainer);
  }

  async render() {
    this._view.render();
    
    this._view.setOnRegisterSubmit(async () => {
      try {
        const input = this._view.getRegisterInput();
        await StoryModel.register(input);
        this._view.showSuccess('Registrasi berhasil! Silakan login.');
      } catch (error) {
        this._view.showError(`Registrasi gagal: ${error.message}`);
      }
    });
  }
}

export default RegisterPresenter;