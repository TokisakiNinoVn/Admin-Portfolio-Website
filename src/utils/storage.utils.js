// File: src/utils/storage.ts
export function setWithExpiry(key, value, ttl) {
  const now = Date.now()
  const item = {
    value,
    expiry: now + ttl,
  }
  localStorage.setItem(key, JSON.stringify(item))
}

export function getWithExpiry(key) {
  const itemStr = localStorage.getItem(key)
  if (!itemStr) return null

  try {
    const item = JSON.parse(itemStr)
    const now = Date.now()

    if (now > item.expiry) {
      localStorage.removeItem(key)
      return null
    }

    return item.value
  } catch {
    localStorage.removeItem(key)
    return null
  }
}

export function setLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}


export function getLocalStorage(key) {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    try {
        return JSON.parse(itemStr);
    } catch {
        return itemStr;
    }
}


export function clearLocalStorage() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('role');
  localStorage.removeItem('email');
  localStorage.setItem('isLoggedIn', 'false');
}

export function logOut() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('role');
  localStorage.removeItem('email');
  localStorage.setItem('isLoggedIn', 'false');
}
