
// =========================
// データベース管理
// =========================

const DB_NAME = "WritingEnglishApp";
const DB_VERSION = 1;

let dbInstance = null;

// データベースを開く
function openDatabase() {
  return new Promise((resolve, reject) => {

    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains("learningItems")) {
        const store = db.createObjectStore(
          "learningItems",
          { keyPath: "id", autoIncrement: true }
        );

        store.createIndex("type", "type", { unique: false });
        store.createIndex("original", "original", { unique: false });
      }
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onerror = () => {
      reject(request.error);
    };

  });
}


// 学習内容を保存する
async function saveLearningItem(item) {

  const db = await openDatabase();

  return new Promise((resolve, reject) => {

    const transaction = db.transaction(
      "learningItems",
      "readwrite"
    );

    const store = transaction.objectStore("learningItems");

    // 同じ種類・同じ間違いがあるか確認
    const request = store.getAll();

    request.onsuccess = () => {

      const items = request.result;

      const exists = items.some(saved =>
        saved.type === item.type &&
        saved.original.toLowerCase() === item.original.toLowerCase()
      );

      if (!exists) {
        store.add({
          ...item,
          createdAt: new Date().toISOString()
        });
      }
    };

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);

  });
}


// 学習内容をすべて取得する
async function getLearningItems() {

  const db = await openDatabase();

  return new Promise((resolve, reject) => {

    const transaction = db.transaction(
      "learningItems",
      "readonly"
    );

    const request = transaction
      .objectStore("learningItems")
      .getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);

  });
}


// 学習内容を削除する
async function deleteLearningItem(id) {

  const db = await openDatabase();

  return new Promise((resolve, reject) => {

    const transaction = db.transaction(
      "learningItems",
      "readwrite"
    );

    transaction
      .objectStore("learningItems")
      .delete(id);

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);

  });
}
