<script lang="ts">
    import axios from "axios";
    import { API_BASE_URL } from "../utils/constants";
    import Splash from "../components/Splash.svelte";
    import TopLogo from "../components/TopLogo.svelte";

    let params = new URLSearchParams(window.location.search);
    let token = params.get("token");
    let error = false;

    axios.post(`${API_BASE_URL}/auth/verify`, {
        action: "verify",
        token: token,
    }).then((res) => {
        if (res.data.success) {
            window.location.href = "/?toast=" + btoa(JSON.stringify({
                type: "success",
                message: "Votre adresse email a été vérifiée !",
                duration: 4000,
                icon: 'fas fa-check',
                buttons: [
                    {
                        content: "OK",
                    }
                ]
            }));
        } else {
            error = true;
        }
    }).catch((err) => {
        error = true;
        console.log(err);
    });
</script>

{#if error}
<div class="flex flex-col justify-center items-center w-full h-full overflow-hidden ml-auto">
    <TopLogo />
    <h1 class="text-7xl font-bold text-center">
        Erreur
    </h1>
    <p class="text-2xl text-center mt-3">
        Une erreur est survenue lors de la vérification de votre adresse email.
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
{:else}
<Splash />
{/if}
