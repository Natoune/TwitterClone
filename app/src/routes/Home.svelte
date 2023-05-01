<script lang="ts">
    import Navbar from "../components/Navbar.svelte";
    import Sidebar from "../components/Sidebar.svelte";
    import Splash from "../components/Splash.svelte";
    import Tabs from "../components/Tabs.svelte";
    import FirstLaunch from "../components/FirstLaunch.svelte";
    import { IS_APP } from "../utils/constants";
    import { decodeToken } from "../utils/user";

    let isLoaded = false;
    let user = decodeToken();

    (async () => {
        if (IS_APP && !user) {
            window.location.href = "/login";
            return;
        }

        isLoaded = true;
    })();
</script>

{#if isLoaded}
<Sidebar />
<Navbar />
{#if user && !user.firstLaunchDone}
    <FirstLaunch />
{/if}
<div class="flex flex-col justify-center items-center w-full h-full overflow-hidden mt-16 xl:w-3/4 ml-auto">
    <div class="left-0 w-full h-full pb-16 mb-16 overflow-x-hidden overflow-y-auto">
        <div class="relative w-full h-fit p-5 bg-base-100 hover:bg-base-200 active:bg-base-200 transition-all duration-150 flex flex-col lg:flex-row justify-start items-start border-b border-base-200">
            <img
                src="/images/default-profile-picture.png"
                alt="avatar"
                class="rounded-full w-12 h-12 absolute top-4 left-4"
            >
            <div class="flex flex-row sm:flex-col justify-center items-center ml-16">
                <span class="font-bold text-lg">Mehdi</span>
                <span class="text-gray-500 max-sm:ml-3">@mehdi</span>
            </div>
            <div class="relative flex flex-col justify-end items-center break-words ml-16 w-2/3 lg:w-1/2">
                <span class="text-base lg:text-lg">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Phasellus ultricies, urna ac dignissim faucibus, nunc est dictum tellus, volutpat rutrum purus purus eget erat.
                    Pellentesque eleifend mi eu dictum volutpat. Curabitur quis dui eget urna varius tincidunt at ac diam. Vivamus sagittis dapibus ultricies.
                    <br/>
                    Nullam laoreet scelerisque est, vel fermentum velit imperdiet non. Nullam gravida fermentum lorem id viverra.
                    Vestibulum purus libero, lacinia vitae orci et, euismod egestas metus. Maecenas non arcu id justo dictum fermentum ac non mauris.
                    Integer volutpat odio velit, quis egestas augue volutpat a. Proin gravida condimentum justo a laoreet.
                </span>
                <div class="carousel rounded-box mt-5 w-full">
                    <img
                        src="https://placehold.co/600x400"
                        alt=""
                        class="carousel-item w-auto h-auto max-w-xl max-xl:max-w-lg max-lg:max-w-md max-md:max-w-sm max-sm:max-w-xs mx-5 rounded-lg"
                    >
                    <img
                        src="https://placehold.co/600x400"
                        alt=""
                        class="carousel-item w-auto h-auto max-w-xl max-xl:max-w-lg max-lg:max-w-md max-md:max-w-sm max-sm:max-w-xs mx-5 rounded-lg"
                    >
                </div>
            </div>
            <div class="flex flex-row lg:flex-col justify-start items-center lg:items-end w-full lg:w-1/2 ml-14 lg:ml-2 max-sm:-ml-2 mt-5">
                <div class="group flex flex-row justify-start items-center mr-5 cursor-pointer">
                    <i class="
                        far fa-comment text-gray-500 mr-2
                        group-hover:bg-primary group-active:bg-primary group-hover:text-primary group-active:text-primary group-hover:bg-opacity-30 group-active:bg-opacity-30
                        transition-all duration-300 rounded-full p-2
                    "></i>
                    <span class="text-gray-500 group-hover:text-primary group-active:text-primary transition-all duration-150">
                        126
                    </span>
                </div>
                <div class="group flex flex-row justify-start items-center mr-5 cursor-pointer">
                    <i class="
                        far fa-heart text-gray-500 mr-2
                        group-hover:bg-error group-active:bg-error group-hover:text-error group-active:text-error group-hover:bg-opacity-30 group-active:bg-opacity-30
                        transition-all duration-300 rounded-full p-2
                    "></i>
                    <span class="text-gray-500 group-hover:text-error group-active:text-error transition-all duration-150">
                        73,4 k
                    </span>
                </div>
                <div class="group flex flex-row justify-start items-center mr-5 cursor-pointer">
                    <i class="
                        far fa-eye text-gray-500 mr-2
                        group-hover:bg-success group-active:bg-success group-hover:text-success group-active:text-success group-hover:bg-opacity-30 group-active:bg-opacity-30
                        transition-all duration-300 rounded-full p-2
                    "></i>
                    <span class="text-gray-500 group-hover:text-success group-active:text-success transition-all duration-150">
                        1,3 M
                    </span>
                </div>
                <div class="group flex flex-row justify-start items-center my-5 mr-5 cursor-pointer">
                    <i class="
                        fas fa-share text-gray-500 mr-2
                        group-hover:bg-slate-500 group-active:bg-slate-500 group-hover:text-slate-500 group-active:text-slate-500 group-hover:bg-opacity-30 group-active:bg-opacity-30
                        transition-all duration-300 rounded-full p-2
                    "></i>
                </div>
            </div>
        </div>
    </div>
</div>
<Tabs tab="home" />
{:else}
<Splash />
{/if}
