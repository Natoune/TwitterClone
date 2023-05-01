import { writable } from 'svelte/store';

export interface ToastSettings {
    message: string;
    type?: 'info' | 'success' | 'warning' | 'danger';
    position?: 'top-start' | 'top-center' | 'top-end' | 'start-middle' | 'center-middle' | 'end-middle' | 'start-bottom' | 'center-bottom' | 'end-bottom';
    duration?: number;
    icon?: string;
    style?: string;
    id?: string;
    buttons?: {
        content: string;
        type?: 'primary' | 'secondary' | 'ghost' | 'info' | 'success' | 'warning' | 'danger';
        action?: () => void;
    }[];
}

let store = writable<ToastSettings[]>([]);

export default {
    store,
    open: (settings: ToastSettings) => {
        const { id = Math.random().toString(36).substr(2, 9), message, type = 'info', position = 'top-center', duration = 5000, icon = null, style = '', buttons = [] } = settings;
        store.update((items) => [...items, {
            id,
            message,
            type,
            position,
            duration,
            icon,
            style,
            buttons
        }]);
        return id;
    },
    close: (id: string) => {
        store.update((items) => items.filter((item) => item.id !== id));
    },
    closeAll: () => {
        store.set([]);
    }
}
