// file: src/utils/format.util.js

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const formatURLImage = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    return `${baseURL}/${url}`;
}

export const formatURLFile = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    return `${baseURL}/${url}`;
}

export const formatDate = (date) => {
    if (!date) return null;
    const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(date).toLocaleDateString('vi-VN', options);
}

export const formatDateTime = (dateTime) => {
    // console.log(dateTime)
    if (!dateTime) return null;
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    return new Date(dateTime).toLocaleString(undefined, options);
}


