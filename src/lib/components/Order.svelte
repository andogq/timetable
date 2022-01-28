<script>
    import { format_text } from "$lib/format";
    import { slide } from "svelte/transition";

    export let options;
    export let rankings = [];
    export let parameters = {};

    $: rankings = options.map(o => o.key);
    $: if (Object.keys(parameters).length === 0) parameters = options.reduce((obj, o) => ({
        ...obj,
        ...(Array.isArray(o.options) && o.options.length > 0 ? { [o.key]: o.options[0] } : {})
    }), {});

    $: sorted_options = options.sort((a, b) => rankings.indexOf(a.key) - rankings.indexOf(b.key));

    let dragged = null;
    let hovered = null;

    function drop(e) {
        e.preventDefault();

        let new_order = [...rankings];

        // Delete the old item;
        let item = new_order.splice(dragged, 1)[0];

        // Recalculate indexes
        if (dragged < hovered) hovered--;

        new_order = [
            ...new_order.slice(0, hovered),
            item,
            ...new_order.slice(hovered),
        ];

        rankings = [...new_order];
    }
</script>

<div id="container">
    {#each sorted_options as item, i}
        <div
            draggable="true"
            class="item numbered"
            class:hovered={hovered === i}
            on:dragstart={(e) => {
                e.dataTransfer.dropEffect = "move";

                dragged = i;
            }}
            on:dragend={() => {
                hovered = null;
                dragged = null;
            }}
            on:dragover={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";

                hovered = i;
            }}
            on:dragleave={() => {
                hovered = null;
            }}
            on:drop={drop}
        >
            <p>{format_text(item.key)}</p>

            {#if Array.isArray(item.options) && item.options.length > 0}
                <select
                    bind:value={parameters[item.key]}
                >
                    {#each item.options as option}
                        <option value={option}>
                            {format_text(option)}
                        </option>
                    {/each}
                </select>
            {/if}
        </div>
    {/each}

    {#if hovered >= sorted_options.length - 1}
        <div
            class="item"
            class:hovered={hovered === sorted_options.length}
            transition:slide
            on:drop={drop}
            on:dragover={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";

                hovered = sorted_options.length;
            }}
            on:dragleave={() => (hovered = null)}
        >
            <br />
        </div>
    {/if}
</div>

<style>
    #container {
        counter-reset: item-counter;

        border: 1px solid #aaaaaa;
        border-radius: var(--border-radius)
    }

    .numbered > p::before {
        content: "⸬ " counter(item-counter) ". ";
        counter-increment: item-counter;
        color: #aaaaaa;

        transition: color var(--transition);
    }

    .numbered:hover > p::before {
        color: var(--main);
    }

    .item {
        user-select: none;
        box-sizing: border-box;

        cursor: pointer;

        padding: 0.5rem;

        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;

        font-size: 0.9rem;
    }

    .item:not(:first-child) {
        border-top: 1px solid #aaaaaa;
    }

    .item > p {
        margin: 0;
    }

    .item.hovered {
        border-top: 2px solid var(--main);
    }

    .item.hovered:first-child {
        border-radius: var(--border-radius);
    }

    select {
        background: none;
        border: none;

        padding: 0;
        margin: 0;

        cursor: pointer;
    }
</style>
