class Router {
  constructor(mainContent, routes) {
    this._mainContent = mainContent;
    this._routes = routes;
  }

  async renderPage() {
    const path = location.hash.slice(1).toLowerCase() || '/';
    const Presenter = this._routes[path] || this._routes['/'];

    const updateContent = async () => {
      if (Presenter) {
        const presenter = new Presenter(this._mainContent);
        await presenter.render();
      } else {
        this._mainContent.innerHTML = '<p>Halaman tidak ditemukan.</p>';
      }
    };

    if (!document.startViewTransition) {
      await updateContent();
      return;
    }

    document.startViewTransition(() => {
      updateContent();
    });
  }
}

export default Router;