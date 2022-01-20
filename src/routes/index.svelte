<script>
    import { page } from "$app/stores";
    
    import Bookmarklet from "$lib/components/Bookmarklet.svelte";
    import Generate from "$lib/components/Generate.svelte";

    $: encoded = $page.url.searchParams.get("data");
</script>

<h1>Timetable Generator</h1>

<ol>
    <li>Drag the button below into your bookmark bar</li>
    <li>Go to your university's Allocate+ page and log in</li>
    <li>Click the bookmark and let it run!</li>
</ol>

<Bookmarklet />

{#if encoded}
    <Generate {encoded}/>
{/if}
