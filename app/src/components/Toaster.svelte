<script lang="ts">
    import toast, { type ToastSettings } from './toast';
    import Toast from './Toast.svelte';

    let items: ToastSettings[] = [];

    toast.store.subscribe((val) => {
        items = val;
    });
</script>

{#each items as item (item.id)}
    <Toast id={item.id} />
{/each}
