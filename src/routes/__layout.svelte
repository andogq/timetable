<script>
    const links = [
        {
            label: "Github",
            href: "https://github.com/andogq",
        },
        {
            label: "Twitter",
            href: "https://twitter.com/andogq",
        },
    ];
</script>

<div id="container">
    <div id="header">
        <h1>Timetable Generator</h1>
    </div>
    <div id="content">
        <slot />
    </div>
    <div id="footer">
        {#each links as { label, href }, i}
            <p>
                <a {href}>{label}</a>
            </p>
        {/each}
    </div>
</div>

<style>
    #container {
        min-height: 100%;
        width: 100%;

        display: flex;
        flex-direction: column;
        gap: 1rem;

        padding: 1rem;

        box-sizing: border-box;
    }

    #content {
        flex-grow: 1;
        padding: 1rem;
    }

    #footer {
        display: flex;
        flex-direction: row;
        justify-content: center;
    }

    #footer > p {
        padding: 0 1rem;
    }

    #footer > p:not(:last-child) {
        border-right: 2px dashed black;
    }
</style>
