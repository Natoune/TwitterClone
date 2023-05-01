<script lang="ts">
    import toast, { type ToastSettings } from './toast';
    import { fade } from 'svelte/transition';

    export let id: string;

    let timeout: any = null;
    let item: ToastSettings;

    toast.store.subscribe((val) => {
        item = val.find((item) => item.id === id);
        if (item && !timeout) {
            timeout = setTimeout(() => {
                toast.close(id);
            }, item.duration);
        }
    });
</script>

{#if item}
    <div
        class="toast toast-{item.position.split('-')[0]} toast-{item.position.split('-')[1]} z-50 w-11/12 sm:w-1/3"
        transition:fade
    >
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div
            class="alert alert-{item.type} rounded-lg shadow-lg cursor-pointer"
            on:click={() => {
                toast.close(id);
            }}
        >
            {#if item.icon}
                <i class="{item.icon} mr-2"></i>
            {/if}
            {@html item.message}
            <div class="flex-none">
                {#if item.buttons}
                    {#each item.buttons as button}
                        <button
                            class="btn btn-sm btn-{button.type ?? 'ghost'}"
                            on:click={() => {
                                if (button.action)
                                    button.action();

                                toast.close(id);
                            }}
                        >
                            {@html button.content}
                        </button>
                    {/each}
                {/if}
            </div>
        </div>
    </div>
{/if}

<style>
    .toast {
        width: max-content;
        max-width: 33.333333%;
    }

    @media (max-width: 768px) {
        .toast {
            max-width: 95%;
        }
    }
</style>
