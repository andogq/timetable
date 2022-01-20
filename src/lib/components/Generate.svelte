<script>
    export let encoded;

    let decoded = null;
    let error = null;

    $: if (encoded) {
        try {
            decoded = JSON.parse(atob(encoded));
            
        } catch {
            decoded = null;
            error = "Invalid data object. Please try again.";
        }
    }
</script>

{#if decoded}
    <pre>{JSON.stringify(decoded)}</pre>
{/if}

{#if error}
    <p id="error">{error}</p>
{/if}
