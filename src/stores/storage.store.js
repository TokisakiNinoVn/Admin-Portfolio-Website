// File: src/utils/localStorage.ts
export function clearLocalStorage() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.setItem('isLoggedIn', 'false');
}