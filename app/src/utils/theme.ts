export function loadTheme(first = false) {
    if (!localStorage.getItem('dark'))  {
        localStorage.setItem('dark', 'auto');
    }

    localStorage.setItem('theme', getTheme());

    if (!localStorage.getItem('fontSize')) {
        localStorage.setItem('fontSize', '16');
    }

    if (!first)
        document.getElementById('theme-wrapper').setAttribute('data-theme', localStorage.getItem('theme') || 'clight');

    document.documentElement.style.fontSize = localStorage.getItem('fontSize') + 'px';
}

export function getTheme() {
    if (localStorage.getItem('dark') === 'auto') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'cdark' : 'clight';
    } else if (localStorage.getItem('dark') === 'on') {
        return 'cdark';
    } else {
        return 'clight';
    }
}
