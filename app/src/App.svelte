<script lang="ts">
    import { Router, Route } from "svelte-routing";
    import { getTheme, loadTheme } from "./utils/theme";
    import Home from "./routes/Home.svelte";
    import Login from "./routes/Login.svelte";
    import Register from "./routes/Register.svelte";
    import Verify from "./routes/Verify.svelte";
    import TopLogo from "./components/TopLogo.svelte";
    import toast from "./components/toast";
    import Toaster from "./components/Toaster.svelte";
    import axios from "axios";
    import { API_BASE_URL } from "./utils/constants";
    import Splash from "./components/Splash.svelte";

    loadTheme(true);
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
        loadTheme();
    });

    let logged = false;
    let isLoaded = false;
    let params = new URLSearchParams(window.location.search);

    (async () => {
        async function auth(token: string = localStorage.getItem("token")) {
            await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }).then((response) => {
                if (response.status === 200 && response.data.success && response.data.token) {
                    localStorage.setItem("token", response.data.token);
                    document.cookie = `token=${response.data.token}; path=/; expires=${new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 30).toUTCString()}`;
                    logged = true;
                } else {
                    localStorage.removeItem("token");
                    document.cookie = `token=; path=/; expires=${new Date(new Date().getTime() - 1000).toUTCString()}`;
                    logged = false;
                }
            }).catch((error) => {
                localStorage.removeItem("token");
                document.cookie = `token=; path=/; expires=${new Date(new Date().getTime() - 1000).toUTCString()}`;
                logged = false;
                console.error(error);
            });
        }

        // Auth
        if (localStorage.getItem("token"))
            await auth();
        else if (document.cookie.split(";").some((item) => item.trim().startsWith("token=")))
            await auth(document.cookie.split(";").find((item) => item.trim().startsWith("token=")).split("=")[1]);

        isLoaded = true;
    })();

    // Redirect
    if (![
        '/register',
        '/login',
        '/logout',
    ].includes(window.location.pathname)) {
        window.localStorage.setItem('redirect', window.location.pathname);
    }

    // Toast
    if (params.get("toast")) {
        let toastData: any;
        try {
            toastData = JSON.parse(atob(params.get("toast").replace(/ /g, "+")));
        } catch (e) {
            console.error(e);
        }

        if (toastData) {
            console.log(toastData);

            toast.open({
                type: toastData.type,
                message: toastData.message,
                duration: toastData.duration,
                style: toastData.style,
                icon: toastData.icon,
                buttons: toastData.buttons,
            });

            // replace url without toast param (but with all other params)
            window.history.replaceState({}, document.title, window.location.pathname + window.location.search.replace(/&?toast=[^&]*/, ""));
        }
    }
</script>

<div id="theme-wrapper" data-theme="{getTheme()}" class="absolute top-0 left-0 w-full h-screen overflow-hidden">
    {#if isLoaded}
        <Toaster />
        <Router>
            <Route path="/">
                <Home />
            </Route>
            <Route path="/login">
                <Login />
            </Route>
            <Route path="/forgot-password">
                <Login forgotPasswordModalOpened={true} />
            </Route>
            <Route path="/register">
                <Register />
            </Route>
            <Route path="/logout">
                <script lang="ts">
                    localStorage.removeItem("token"),
                    document.cookie = `token=; path=/; expires=${new Date(new Date().getTime() - 1000).toUTCString()}`;
                    if (localStorage.getItem('redirect'))
                        window.location.href = localStorage.getItem('redirect');
                    else
                        window.location.href = "/";

                    setTimeout(() => {
                        document.getElementById("logoutBox").classList.remove("hidden");
                        document.getElementById("logoutBox").classList.add("flex");
                    }, 1000);
                </script>
                <div id="logoutBox" class="hidden flex-col justify-center items-center w-full h-full overflow-hidden ml-auto">
                    <h1 class="text-3xl font-bold text-center">
                        Vous êtes déconnecté
                    </h1>
                    <a href="/" class="link link-primary text-center mt-5">
                        Retour à l'accueil
                    </a>
                </div>
            </Route>
            <Route path="/verify">
                <Verify />
            </Route>
            <Route path="*">
                <div class="flex flex-col justify-center items-center w-full h-full overflow-hidden ml-auto">
                    <TopLogo />
                    <h1 class="text-8xl font-bold text-center">
                        404
                    </h1>
                    <p class="text-3xl text-center">
                        Page non trouvée
                    </p>
                    <div class="flex flex-row justify-center items-center mt-10">
                        <a href="/" class="btn btn-primary btn-md">
                            Retour à l'accueil
                        </a>
                        <a href="/search" class="btn btn-secondary btn-md ml-5">
                            Rechercher
                        </a>
                    </div>
                </div>
            </Route>
        </Router>
    {:else}
        <Splash />
    {/if}
</div>
