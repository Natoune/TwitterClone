<script>
    import { APP_NAME, IS_APP, RESOURCES } from "../utils/constants";
</script>
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
class="
    fixed top-8 left-1/2 -translate-x-1/2 cursor-pointer px-4 py-2
    max-sm:top-2 max-sm:left-1 max-sm:-translate-x-0
"
class:hidden={IS_APP}
on:click={() => {
    window.location.href = "/";
}}
>
<div class="flex flex-row justify-center items-center">
    <img src="{RESOURCES.ICON}" alt="logo" class="w-12 h-12 max-sm:w-8 max-sm:h-8 mr-2" />
    <span class="text-2xl max-sm:hidden font-bold ml-2">{APP_NAME}</span>
</div>
</div>
