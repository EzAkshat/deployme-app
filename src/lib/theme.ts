export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "deployme-theme";

// Runs before first paint so the saved theme never flashes.
export const themeInitScript = `try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;
