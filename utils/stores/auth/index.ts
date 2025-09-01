import { STORE_KEYS } from '../../contants/stores';

const getAuthToken = () => {
    return localStorage.getItem(STORE_KEYS.token);
};

const setAuthToken = (token: string) => {
    localStorage.setItem(STORE_KEYS.token, token);
};

const removeAuthToken = () => {
    localStorage.removeItem(STORE_KEYS.token);
};

export { getAuthToken, setAuthToken, removeAuthToken };
