import daisyui from 'daisyui'

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './index.html',
        './src/**/*.{svelte,ts}',
    ],
    plugins: [
        daisyui,
    ],
    daisyui: {
        themes: [
            {
                clight: {
                    "primary": "#E0A82E",
                    "secondary": "#F9D72F",
                    "accent": "#181830",
                    "neutral": "#181830",
                    "base-100": "#FFFFFF",
                    "base-300": "#D1D5DB",
                    "info": "#3ABFF8",
                    "success": "#36D399",
                    "warning": "#FBBD23",
                    "error": "#F87272",
                },
                cdark: {
                    "primary": "#38BDF8",
                    "secondary": "#818CF8",
                    "accent": "#F471B5",
                    "neutral": "#1E293B",
                    "base-100": "#0F172A",
                    "base-200": "#1E293B",
                    "border-color": "#38BDF8",
                    "info": "#0CA5E9",
                    "success": "#2DD4BF",
                    "warning": "#F4BF50",
                    "error": "#FB7085",
                }
            }
        ],
    },
}
