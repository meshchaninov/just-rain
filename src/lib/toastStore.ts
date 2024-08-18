import { writable, type Writable } from "svelte/store";

type TypeOptions = "default" | "success" | "error" | "warning";

type ToastOptions = {
    message: string;
    type?: TypeOptions;
    dismissible?: boolean;
    timeout?: number;
}

type Toast = ToastOptions & { id: number };

export const toasts: Writable<Toast[]> = writable([]);

export const addToast = (toast: ToastOptions) => {
    // Create a unique ID so we can easily find/remove it
    // if it is dismissible/has a timeout.
    const id = Math.floor(Math.random() * 10000);

    // Setup some sensible defaults for a toast.
    const defaults: Toast = {
        id,
        message: "",
        type: "default",
        dismissible: true,
        timeout: 3000,
    };

    const timeout = toast.timeout || defaults.timeout;

    // Push the toast to the top of the list of toasts
    toasts.update((all) => [{ ...defaults, ...toast }, ...all]);

    // If toast is dismissible, dismiss it after "timeout" amount of time.
    if (timeout) setTimeout(() => dismissToast(id), timeout);
};

export const dismissToast = (id: Number) => {
    toasts.update((all) => all.filter((t) => t.id !== id));
};