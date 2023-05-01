<script lang="ts">
    import { decodeToken } from "../utils/user";

    export let tab: 'home' | 'search' | 'notifications' | 'messages' = 'home';

    let user = decodeToken();
</script>

<div class="btm-nav btm-nav-lg xl:hidden">
    <a
        class:active={tab === "home"}
        href="/"
    >
        <i class="fas fa-home"></i>
        <span class="btm-nav-label max-md:hidden">Accueil</span>
    </a>
    <a
        class:active={tab === "search"}
        href="/search"
    >
        <i class="fas fa-search"></i>
        <span class="btm-nav-label max-md:hidden">Recherche</span>
    </a>
    {#if user}
        <a
            class:active={tab === "notifications"}
            href="/notifications"
        >
            <i class="fas fa-bell"></i>
            <span class="btm-nav-label max-md:hidden">Notifications</span>
        </a>
        <a
            class:active={tab === "messages"}
            href="/messages"
        >
            <i class="fas fa-envelope"></i>
            <span class="btm-nav-label max-md:hidden">Messages</span>
        </a>
    {/if}
</div>
