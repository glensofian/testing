import loginTemplate from './templates/login.html';

class LoginView {
  constructor(container) {
    this._container = container;
  }

  render() {
    this._container.innerHTML = loginTemplate;
  }

  getLoginInput() {
    const email = document.querySelector('#login-email').value;
    const password = document.querySelector('#login-password').value;
    return { email, password };
  }

  setOnLoginSubmit(callback) {
    const loginForm = document.querySelector('#login-form');
    loginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      callback();
    });
  }

  showSuccess(message) {
    alert(message);
    window.location.hash = '#/home';
  }

  showError(message) {
    alert(message);
  }
}

export default LoginView;