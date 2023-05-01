<script lang="ts">
    let display = false;
</script>

<div class="absolute w-full h-screen top-0 left-0 bg- flex flex-col justify-center items-center overflow-hidden">
    <img
        id="splash-image"
        src="/icon.svg"
        alt="Chargement..."
        class="w-28 h-28 animate-pulse"
        class:hidden={!display}
        on:load={() => {
            display = true;
        }}
    />
</div>
