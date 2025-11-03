export const openDBStories = () => new Promise((resolve, reject) => {
  const req = indexedDB.open('story-db', 1);
  req.onupgradeneeded = () => {
    const db = req.result;
    if (!db.objectStoreNames.contains('stories')) {
      const store = db.createObjectStore('stories', { keyPath: 'id' });
      store.createIndex('createdAt', 'createdAt', { unique: false });
    }
  };
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => reject(req.error);
});

export async function putStories(list) {
  const db = await openDBStories();
  const tx = db.transaction('stories', 'readwrite');
  const store = tx.objectStore('stories');
  for (const item of list) store.put(item);
  await tx.complete?.() || tx.done?.();
  db.close();
}

export async function getAllStoriesIDB() {
  const db = await openDBStories();
  const tx = db.transaction('stories', 'readonly');
  const store = tx.objectStore('stories');
  const req = store.getAll();
  const result = await new Promise((res) => { req.onsuccess = () => res(req.result || []); });
  db.close();
  return result;
}

export async function deleteStory(id) {
  const db = await openDBStories();
  const tx = db.transaction('stories', 'readwrite');
  tx.objectStore('stories').delete(id);
  await tx.complete?.() || tx.done?.();
  db.close();
}
