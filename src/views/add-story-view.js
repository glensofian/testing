import addStoryTemplate from './templates/add-story.html';

class AddStoryView {
  constructor(container) {
    this._container = container;
    this._stream = null;
    this._photo = null;
    this._latitude = null;
    this._longitude = null;
  }

  render() {
    this._container.innerHTML = addStoryTemplate;
    this._initCamera();
    this._initMap();
  }

  async _initCamera() {
    const video = document.querySelector('#camera-feed');
    try {
      this._stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = this._stream;
    } catch (err) {
      this.showError('Tidak bisa mengakses kamera. Pastikan Anda memberikan izin.');
    }
  }

  _initMap() {
    const map = L.map('map').setView([-6.200000, 106.816666], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    const marker = L.marker([-6.200000, 106.816666]).addTo(map);
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      this._latitude = lat;
      this._longitude = lng;
      marker.setLatLng(e.latlng);
      document.querySelector('#story-location').value = `Lat: ${lat.toFixed(6)}, Lon: ${lng.toFixed(6)}`;
    });
  }

  _capturePhoto() {
    const video = document.querySelector('#camera-feed');
    const canvas = document.querySelector('#photo-canvas');
    const preview = document.querySelector('#photo-preview');
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(blob => { this._photo = blob; }, 'image/jpeg');
    preview.src = canvas.toDataURL('image/jpeg');
    preview.classList.remove('hidden');
    video.classList.add('hidden');
    if (this._stream) {
      this._stream.getTracks().forEach(track => track.stop());
    }
  }

  getStoryInput() {
    const description = document.querySelector('#story-description').value;
    if (!this._photo || !description) {
      this.showError('Deskripsi dan foto tidak boleh kosong!');
      return null;
    }
    const formData = new FormData();
    formData.append('photo', this._photo);
    formData.append('description', description);
    if (this._latitude && this._longitude) {
      formData.append('lat', this._latitude);
      formData.append('lon', this._longitude);
    }
    return formData;
  }
  
  setOnSubmit(callback) {
    document.querySelector('#capture-button').addEventListener('click', () => this._capturePhoto());
    document.querySelector('#add-story-form').addEventListener('submit', (event) => {
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

export default AddStoryView;