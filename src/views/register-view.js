import registerTemplate from './templates/register.html';

class RegisterView {
  constructor(container) {
    this._container = container;
  }

  render() {
    this._container.innerHTML = registerTemplate;
  }

  getRegisterInput() {
    const name = document.querySelector('#register-name').value;
    const email = document.querySelector('#register-email').value;
    const password = document.querySelector('#register-password').value;
    return { name, email, password };
  }

  setOnRegisterSubmit(callback) {
    const registerForm = document.querySelector('#register-form');
    registerForm.addEventListener('submit', (event) => {
      event.preventDefault();
      callback();
    });
  }

  showSuccess(message) {
    alert(message);
    window.location.hash = '#/login';
  }

  showError(message) {
    alert(message);
  }
}

export default RegisterView;