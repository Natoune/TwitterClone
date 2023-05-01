<script>
    import { APP_NAME, RESOURCES, USERCONTENT_BASE_URL } from "../utils/constants";
    import { openedSidebarWrite } from "../utils/stores";
    import { decodeToken } from "../utils/user";

    let user = decodeToken();
</script>
<div class="absolute z-40 navbar border-b border-base-300 flex justify-between items-center px-4 py-2 xl:w-3/4 right-0">
    <div class="navbar-start">
        <div
            class="group flex items-center cursor-pointer"
            on:click={() => {
                openedSidebarWrite.set(true);
            }}
            on:keypress={() => {
                openedSidebarWrite.set(true);
            }}
        >
            {#if user}
                <img
                    src="{USERCONTENT_BASE_URL}/avatar/{user.avatar}"
                    alt="Avatar"
                    class="w-8 h-8 rounded-full group-hover:brightness-90 group-active:brightness-100 transition-all duration-200"
                />
                <span class="ml-2 text-sm font-semibold max-sm:hidden group-hover:text-base transition-all duration-200">
                    {user.username}
                </span>
            {:else}
                <i class="hidden max-xl:block fas fa-bars text-2xl px-5"></i>
            {/if}
        </div>
    </div>
    <div class="navbar-center">
        <div class="flex items-center">
            <img
                src="{RESOURCES.ICON}"
                alt="{APP_NAME} Logo"
                class="w-8 h-8"
            />
            <span class="ml-2 text-xl font-bold max-sm:hidden">
                {APP_NAME}
            </span>
        </div>
    </div>
    <div class="navbar-end">
    </div>
</div>
