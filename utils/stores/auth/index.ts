import { STORE_KEYS } from '../../contants/stores';

const getAuthToken = (): string | null => {
    return (
        localStorage.getItem(STORE_KEYS.token) ||
        sessionStorage.getItem(STORE_KEYS.token)
    );
};

const setAuthToken = (token: string, rememberMe: boolean = false): void => {
    if (rememberMe) {
        localStorage.setItem(STORE_KEYS.token, token);
    } else {
        sessionStorage.setItem(STORE_KEYS.token, token);
    }
};

const removeAuthToken = (): void => {
    localStorage.removeItem(STORE_KEYS.token);
    sessionStorage.removeItem(STORE_KEYS.token);
};

export { getAuthToken, removeAuthToken, setAuthToken };
