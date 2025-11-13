import { STORE_KEYS } from '../../contants/stores';

const getAuthToken = (): string | null => {
    const token = localStorage.getItem(STORE_KEYS.token) || sessionStorage.getItem(STORE_KEYS.token);
    
    // Retorna null se o token for inválido (null, undefined, string vazia, ou strings "null"/"undefined")
    if (!token || token.trim() === '' || token === 'null' || token === 'undefined') {
        return null;
    }
    
    return token;
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
