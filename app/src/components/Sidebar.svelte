<script lang="ts">
    import { APP_NAME, IS_MOBILE, RESOURCES, USERCONTENT_BASE_URL } from "../utils/constants";
    import { loadTheme } from "../utils/theme";
    import { openedSidebarWrite } from "../utils/stores";
    import { decodeToken } from "../utils/user";

    let isLoaded = false;

    openedSidebarWrite.subscribe((value) => {
        if (!isLoaded) return;
        if (value) {
            openSidebar();
        } else {
            closeAll();
        }
    });

    // Sidebar
    let preOpen = false;
    let blurOpened = false;
    let sidebarOpened = false;
    let themeModalOpened = false;

    let user = decodeToken();

    const openSidebar = () => {
        preOpen = true;
        openedSidebarWrite.set(true);

        // Delay to apply transition
        setTimeout(() => {
            blurOpened = true;
            sidebarOpened = true;
            try {
                document.getElementById('sidebar-container').classList.remove('sidebar-container-hide');
                document.getElementById('sidebar-container').classList.add('sidebar-container-show');
            } catch (e) {
                console.error(e);
                openedSidebarWrite.set(false);
                return;
            }
        }, 100);
    };

    const closeSidebar = () => {
        sidebarOpened = false;

        document.getElementById('sidebar-container').classList.remove('sidebar-container-show');
        document.getElementById('sidebar-container').classList.add('sidebar-container-hide');
        window.removeEventListener('mousemove', sidebarMove, true);
    }

    const blurCheck = (e: any) => {
        if (
            e !== null &&
            e.target !== e.currentTarget
        ) return false;
        return true;
    };

    const closeAll = () => {
        blurOpened = false;
        closeSidebar();
        document.getElementById('theme-modal').parentElement.removeAttribute('style');
        document.getElementById('theme-modal').parentElement.style.bottom = '-50%';
        themeModalOpened = false;

        setTimeout(() => {
            preOpen = false;
        }, 500);
    }

    let lastX = 999;

    if(IS_MOBILE()) {
        window.addEventListener('pointermove', (e: MouseEvent) => {
            if (e.clientX === lastX) return;

            if (e.clientX - lastX > 20 && !sidebarOpened) {
                openSidebar();
                lastX = 999;
            } else if (e.clientX - lastX < -20 && sidebarOpened) {
                closeSidebar();
                lastX = 999;
            }

            lastX = e.clientX;
        });

        window.addEventListener('pointerup', () => {
            lastX = 999;
        });
    } else {
        window.addEventListener('mousedown', (e: MouseEvent) => {
            if (sidebarOpened) return;

            lastX = e.clientX;
            window.addEventListener('mousemove', sidebarMove, true);
        });

        window.addEventListener('mouseup', () => {
            window.removeEventListener('mousemove', sidebarMove, true);
        });
    }

    function sidebarMove(e: MouseEvent) {
        if (e.clientX - lastX > 30) {
            openedSidebarWrite.set(true);
            window.removeEventListener('mousemove', sidebarMove, true);
        }
        lastX = e.clientX;
    }

    // Theme Modal
    let dark = localStorage.getItem('dark');
    let fontSize = localStorage.getItem('fontSize');

    const openThemeModal = () => {
        closeSidebar();

        themeModalOpened = true;
        document.getElementById('theme-modal').parentElement.removeAttribute('style');

        setTimeout(() => {
            const darkOnEl = document.getElementById("dark-on");
            const darkOffEl = document.getElementById("dark-off");
            const darkAutoEl = document.getElementById("dark-auto");

            darkOnEl.addEventListener("click", () => {
                dark = "on";
                localStorage.setItem('dark', 'on');
                loadTheme();
            });

            darkOffEl.addEventListener("click", () => {
                dark = "off";
                localStorage.setItem('dark', 'off');
                loadTheme();
            });

            darkAutoEl.addEventListener("click", () => {
                dark = "auto";
                localStorage.setItem('dark', 'auto');
                loadTheme();
            });

            const fontSizeEl = document.getElementById("font-size") as HTMLInputElement;

            fontSizeEl.addEventListener("input", (e: Event) => {
                fontSize = (e.target as HTMLInputElement).value;
                localStorage.setItem('fontSize', (e.target as HTMLInputElement).value);
                loadTheme();
            });

            window.addEventListener('mouseup', () => {
                if (!themeModalOpened) {
                    return window.removeEventListener('mousemove', themeModalMove, true);
                }
                window.removeEventListener('mousemove', themeModalMove, true);
                document.getElementById('theme-modal').parentElement.removeAttribute('style');
            });
            document.getElementById('theme-modal-dragger').addEventListener('mousedown', () => {
                window.addEventListener('mousemove', themeModalMove, true);
            });

            function themeModalMove(e: MouseEvent) {
                let windowH = window.innerHeight;
                let themeModalH = document.getElementById('theme-modal').clientHeight;
                let resetPos = windowH - themeModalH;

                if (e.clientY - 20 < resetPos) {
                    document.getElementById('theme-modal').parentElement.style.top = resetPos + 'px';
                    return;
                }

                if (e.clientY - 20 > themeModalH) {
                    window.removeEventListener('mousemove', themeModalMove, true);
                    openedSidebarWrite.set(false);
                    return;
                }

                document.getElementById('theme-modal').parentElement.style.bottom = 'auto';
                document.getElementById('theme-modal').parentElement.style.top = e.clientY - 20 + 'px';
            }
        }, 500);
    };

    function setSidebarWrite(value: boolean) {
        if (!isLoaded) return;
        if (value) {
            openSidebar();
        } else {
            closeAll();
        }
        openedSidebarWrite.set(value);
    }

    isLoaded = true;
</script>

<div
    id="sidebar-bg"
    class="fixed top-0 left-0 w-full h-screen z-50 xl:z-40 transition-all duration-500 xl:w-fit xl:block xl:sidebar-bg-show"
    class:hidden={!preOpen}
    class:sidebar-bg-show={blurOpened}
    on:click={(e) => {
        if (blurCheck(e)) setSidebarWrite(false);
    }}
    on:keydown={(e) => {
        if (e.key === "Escape") setSidebarWrite(false);
    }}
>
    <div
        id="sidebar-container"
        class="bg-base-100 w-80 xl:w-1/4 h-full fixed top-0 left-0 z-50 transition-all duration-500 sidebar-container-hide xl:sidebar-container-show xl:border-r border-base-300"
    >
        <div class="flex flex-col justify-between items-center w-full h-full px-5">
            <!-- Header -->
            <div class="border-b border-base-300 w-full p-3 my-7 flex flex-col justify-start">
                {#if user}
                    <div class="absolute top-8 right-10 w-8 h-8 flex flex-row justify-center items-center cursor-pointer hover:bg-base-300 active:bg-base-300 transition-all duration-150 rounded-full">
                        <div class="w-1 h-1 rounded-full bg-gray-500"></div>
                        <div class="w-1 h-1 rounded-full bg-gray-500 mx-1"></div>
                        <div class="w-1 h-1 rounded-full bg-gray-500"></div>
                    </div>

                    <img
                        src="{USERCONTENT_BASE_URL}/avatar/{user.avatar}"
                        alt="Avatar"
                        class="w-10 h-10 rounded-full cursor-pointer border-2 border-transparent hover:brightness-90 active:brightness-100 transition-all duration-150"
                    >
                    <div class="w-fit mt-2 pl-2 pr-10 py-1 flex flex-col cursor-pointer hover:bg-base-300 active:bg-base-300 transition-all duration-150 rounded-xl">
                        <span class="text-sm font-semibold w-fit">
                            {user.displayName}
                        </span>
                        <span class="text-sm font-semibold w-fit text-gray-500">
                            @{user.username}
                        </span>
                    </div>
                    <div class="flex flex-row justify-between items-center w-full mt-4">
                        <div class="flex flex-col justify-center items-center cursor-pointer px-4 py-2 hover:bg-base-200 active:bg-base-200 transition-all duration-150 rounded-xl">
                            <span class="text-sm font-semibold">
                                {user.following.length}
                            </span>
                            <span class="text-sm font-semibold text-gray-500">
                                Abonnements
                            </span>
                        </div>
                        <div class="flex flex-col justify-center items-center cursor-pointer px-4 py-2 hover:bg-base-200 active:bg-base-200 transition-all duration-150 rounded-xl">
                            <span class="text-sm font-semibold">
                                {user.followers.length}
                            </span>
                            <span class="text-sm font-semibold text-gray-500">
                                Abonnés
                            </span>
                        </div>
                    </div>
                {:else}
                    <!-- login and register buttons -->
                    <div class="flex flex-col justify-between items-center w-full">
                        <div class="flex flex-row justify-start items-center w-full mb-4">
                            <img
                                src="{RESOURCES.ICON}"
                                alt="Logo"
                                class=""
                            >
                            <span class="text-2xl font-semibold ml-2">
                                {APP_NAME}
                            </span>
                        </div>
                        <a class="btn btn-primary w-full mt-4" href="/login">
                            Connexion
                        </a>
                        <a class="btn btn-secondary w-full mt-4" href="/register">
                            Inscription
                        </a>
                    </div>
                {/if}
            </div>
            <!-- Menu -->
            <div class="flex flex-col justify-start items-start w-full h-full">
                <div class="flex flex-col justify-start items-start w-full h-full">
                    {#if user}
                        <div class="flex flex-row justify-start items-center w-full h-14 px-8 cursor-pointer opacity-80 hover:opacity-100 hover:bg-base-200 active:opacity-100 active:bg-base-200 transition-all duration-300 rounded-xl">
                            <div class="w-8 h-8 flex flex-row justify-center items-center">
                                <i class="fas fa-home"></i>
                            </div>
                            <span class="text-base font-semibold ml-4">
                                Accueil
                            </span>
                        </div>
                        <div class="flex flex-row justify-start items-center w-full h-14 px-8 cursor-pointer opacity-80 hover:opacity-100 hover:bg-base-200 active:opacity-100 active:bg-base-200 transition-all duration-300 rounded-xl">
                            <div class="w-8 h-8 flex flex-row justify-center items-center">
                                <i class="fas fa-user"></i>
                            </div>
                            <span class="text-base font-semibold ml-4">
                                Profil
                            </span>
                        </div>
                        <div class="max-xl:hidden flex flex-row justify-start items-center w-full h-14 px-8 cursor-pointer opacity-80 hover:opacity-100 hover:bg-base-200 active:opacity-100 active:bg-base-200 transition-all duration-300 rounded-xl">
                            <div class="w-8 h-8 flex flex-row justify-center items-center">
                                <i class="fas fa-search"></i>
                            </div>
                            <span class="text-base font-semibold ml-4">
                                Recherche
                            </span>
                        </div>
                        <div class="max-xl:hidden flex flex-row justify-start items-center w-full h-14 px-8 cursor-pointer opacity-80 hover:opacity-100 hover:bg-base-200 active:opacity-100 active:bg-base-200 transition-all duration-300 rounded-xl">
                            <div class="w-8 h-8 flex flex-row justify-center items-center">
                                <i class="fas fa-bell"></i>
                            </div>
                            <span class="text-base font-semibold ml-4">
                                Notifications
                            </span>
                        </div>
                        <div class="max-xl:hidden flex flex-row justify-start items-center w-full h-14 px-8 cursor-pointer opacity-80 hover:opacity-100 hover:bg-base-200 active:opacity-100 active:bg-base-200 transition-all duration-300 rounded-xl">
                            <div class="w-8 h-8 flex flex-row justify-center items-center">
                                <i class="fas fa-envelope"></i>
                            </div>
                            <span class="text-base font-semibold ml-4">
                                Messages
                            </span>
                        </div>
                        <div class="flex flex-row justify-start items-center w-full h-14 px-8 cursor-pointer opacity-80 hover:opacity-100 hover:bg-base-200 active:opacity-100 active:bg-base-200 transition-all duration-300 rounded-xl">
                            <div class="w-8 h-8 flex flex-row justify-center items-center">
                                <i class="fas fa-cog"></i>
                            </div>
                            <span class="text-base font-semibold ml-4">
                                Paramètres
                            </span>
                        </div>
                        <div class="flex flex-row justify-start items-center w-full h-14 px-8 cursor-pointer opacity-80 hover:opacity-100 hover:bg-base-200 active:opacity-100 active:bg-base-200 transition-all duration-300 rounded-xl">
                            <div class="w-8 h-8 flex flex-row justify-center items-center">
                                <i class="fas fa-question-circle"></i>
                            </div>
                            <span class="text-base font-semibold ml-4">
                                Aide
                            </span>
                        </div>
                    {:else}
                        <div class="flex flex-row justify-start items-center w-full h-14 px-8 cursor-pointer opacity-80 hover:opacity-100 hover:bg-base-200 active:opacity-100 active:bg-base-200 transition-all duration-300 rounded-xl">
                            <div class="w-8 h-8 flex flex-row justify-center items-center">
                                <i class="fas fa-home"></i>
                            </div>
                            <span class="text-base font-semibold ml-4">
                                Accueil
                            </span>
                        </div>
                        <div class="max-xl:hidden flex flex-row justify-start items-center w-full h-14 px-8 cursor-pointer opacity-80 hover:opacity-100 hover:bg-base-200 active:opacity-100 active:bg-base-200 transition-all duration-300 rounded-xl">
                            <div class="w-8 h-8 flex flex-row justify-center items-center">
                                <i class="fas fa-search"></i>
                            </div>
                            <span class="text-base font-semibold ml-4">
                                Recherche
                            </span>
                        </div>
                        <div class="flex flex-row justify-start items-center w-full h-14 px-8 cursor-pointer opacity-80 hover:opacity-100 hover:bg-base-200 active:opacity-100 active:bg-base-200 transition-all duration-300 rounded-xl">
                            <div class="w-8 h-8 flex flex-row justify-center items-center">
                                <i class="fas fa-question-circle"></i>
                            </div>
                            <span class="text-base font-semibold ml-4">
                                Aide
                            </span>
                        </div>
                    {/if}
                </div>
            </div>
            <!-- Footer -->
            <div class="flex flex-col justify-start items-start w-full h-fit mb-5">
                <div
                    class="flex flex-row justify-start items-center w-full h-14 px-8 cursor-pointer opacity-80 hover:opacity-100 hover:bg-base-200 active:opacity-100 active:bg-base-200 transition-all duration-300 rounded-xl"
                    on:click={openThemeModal}
                    on:keypress={openThemeModal}
                >
                    <div class="w-8 h-8 flex flex-row justify-center items-center">
                        <i class="fas fa-paint-brush-alt"></i>
                    </div>
                    <span class="text-base font-semibold ml-4">
                        Affichage
                    </span>
                </div>
            </div>
        </div>
    </div>
</div>

<div
    class="fixed top-0 left-0 w-full h-screen z-50 bg-black bg-opacity-50 max-xl:hidden theme-bg-{themeModalOpened ? 'show' : 'hide'}"
    on:click={() => {
        setSidebarWrite(false);
    }}
    on:keydown={(e) => {
        if (e.key === "Escape") setSidebarWrite(false);
    }}
></div>
<div class="absolute w-full sm:w-2/3 xl:w-1/2 2xl:w-5/12 h-fit bottom-0 left-1/2 -translate-x-1/2 sm:bottom-1/2 sm:translate-y-1/2 z-{themeModalOpened ? '50' : '0'}">
    <div
        id="theme-modal"
        class="
            relative sm:transition-opacity max-sm:transition-transform duration-300 opacity-0 max-sm:rounded-b-none
            flex flex-col justify-center items-center bg-base-100 px-11 py-20 w-full h-2/3 rounded-b-xl rounded-t-xl mx-auto my-auto
        "
        class:translate-y-full={!themeModalOpened}
        class:opacity-100={themeModalOpened}
    >
        <div
            id="theme-modal-dragger"
            class="block sm:hidden absolute top-5 px-10 py-4 cursor-pointer"
        >
            <div class="border border-t-base-300 w-16 sm:w-0"></div>
        </div>
        <h1 class="text-2xl font-semibold text-center">
            Affichage
        </h1>
        <p class="text-base text-center text-gray-500 mb-4">
            Ces paramètres seront actifs uniquement sur cet appareil.
        </p>
        <div class="mb-4 w-2/3">
            <h2 class="text-xl font-semibold">
                Mode sombre
            </h2>
            <div class="px-5 mx-auto">
                <div class="form-control">
                    <label class="label cursor-pointer">
                        <span class="label-text">Activé</span>
                        <input
                            type="radio"
                            id="dark-on"
                            name="radio-10"
                            class="radio checked:bg-primary"
                            checked={dark === 'on'}
                        >
                    </label>
                </div>
                <div class="form-control">
                    <label class="label cursor-pointer">
                        <span class="label-text">Désactivé</span>
                        <input
                            type="radio"
                            id="dark-off"
                            name="radio-10"
                            class="radio checked:bg-primary"
                            checked={dark === 'off'}
                        >
                    </label>
                </div>
                <div class="form-control">
                    <label class="label cursor-pointer">
                        <span class="label-text">Préférences du système</span>
                        <input
                            type="radio"
                            id="dark-auto"
                            name="radio-10"
                            class="radio checked:bg-primary"
                            checked={dark === 'auto'}
                        >
                    </label>
                </div>
            </div>
        </div>
        <div class="mb-10 w-2/3">
            <h2 class="text-xl font-semibold mb-3">
                Taille de la police
            </h2>
            <input id="font-size" type="range" min="14" max="18" value="{fontSize}" class="range range-primary" step="1" />
            <div class="w-full flex justify-between text-xs px-2">
                {#key fontSize}
                <span
                    class="text-gray-500"
                    class:text-inherit={fontSize == '14'}
                    style="font-size: 0.7rem"
                >
                    Aa
                </span>
                <span
                    class="text-gray-500"
                    class:text-inherit={fontSize == '15'}
                    style="font-size: 0.85rem"
                >
                    Aa
                </span>
                <span
                    class="text-gray-500"
                    class:text-inherit={fontSize == '16'}
                    style="font-size: 1.1rem"
                >
                    Aa
                </span>
                <span
                    class="text-gray-500"
                    class:text-inherit={fontSize == '17'}
                    style="font-size: 1.3rem"
                >
                    Aa
                </span>
                <span
                    class="text-gray-500"
                    class:text-inherit={fontSize == '18'}
                    style="font-size: 1.55rem"
                >
                    Aa
                </span>
                {/key}
            </div>
        </div>
        <button class="btn btn-primary btn-wide" on:click={() => { setSidebarWrite(false); }}>
            Terminé
        </button>
    </div>
</div>

<style>
    .sidebar-bg-show {
        background-color: rgba(0, 0, 0, 0.5)
    }

    .sidebar-container-hide {
        transform: translateX(-100%);
    }

    .sidebar-container-show {
        transform: translateX(0);
    }

    .theme-bg-hide {
        display: none;
    }

    .theme-bg-show {
        display: block;
    }

    @media (min-width: 1280px) {
        .xl\:sidebar-container-show {
            transform: translateX(0) !important;
        }
    }
</style>
