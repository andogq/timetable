<script>
    import { page } from "$app/stores";
    import generate from "$lib/generate";
    import { format_text } from "$lib/format";

    import Output from "$lib/components/Output.svelte";

    const OPTIMISATIONS = [
        {
            key: "breaks",
            label: "Minimise the amount of time between subjects on a single day",
        },
        {
            key: "days",
            label: "Minimise the amount of days required",
        },
        {
            key: "campus",
            label: "Prefer a certain campus",
            parameters: {
                campus: {
                    type: "text",
                },
            },
        },
        {
            key: "week_position",
            label: "Prefer a time of the week",
            parameters: {
                period: {
                    type: "select",
                    options: ["start", "middle", "end"],
                },
            },
        },
    ];

    let rankings = [];
    let parameters = {};

    let timetables = null;
    let log = [];
    let selected_timetable = 0;
    let decoded = null;

    $: if (
        timetables !== null &&
        timetables.length > 0 &&
        selected_timetable >= timetables.length
    ) {
        selected_timetable = 0;
    }

    $: if ($page.params.data) {
        try {
            decoded = JSON.parse(atob($page.params.data));
        } catch {
            result = null;
            log = [
                ...log,
                "Problem decoding object or generating timetable. Please try again.",
            ];
        }
    }

    function run() {
        timetables = generate(decoded, {
            log: (message) => (log = [...log, message]),
            rankings,
            parameters,
        });
    }
</script>

{#if decoded === null}
    <p>Data not found, or problem decoding data. Please try again.</p>
{:else}
    <p>Configure options, and click "Generate" to generate some timetables.</p>

    <div>
        <ol id="optimisations">
            {#each OPTIMISATIONS as _, i}
                <li>
                    <select bind:value={rankings[i]}>
                        <option value={null} selected>
                            Select optimisation
                        </option>
                        {#each OPTIMISATIONS as { key }}
                            {#if rankings[i] === key || !rankings.includes(key)}
                                <option value={key}>{format_text(key)}</option>
                            {/if}
                        {/each}
                    </select>

                    {#each Object.entries(OPTIMISATIONS.find((o) => o.key === rankings[i])?.parameters || {}) as [key, parameter]}
                        {#if parameter.type === "text"}
                            <input
                                type="text"
                                bind:value={parameters[key]}
                                placeholder={format_text(key)}
                            />
                        {:else if parameter.type === "select"}
                            <select bind:value={parameters[key]}>
                                {#each parameter.options as option}
                                    <option value={option}>
                                        {format_text(option)}
                                    </option>
                                {/each}
                            </select>
                        {/if}
                    {/each}
                </li>
            {/each}
        </ol>
        <div id="definitions">
            <h3>Definitions</h3>
            {#each OPTIMISATIONS as { key, label }}
                <p><b>{format_text(key)}</b>: {label}</p>
            {/each}
        </div>
    </div>

    <button on:click={run} disabled={rankings.includes(null)}>
        Generate
    </button>
{/if}

{#if timetables}
    {#if timetables.length === 0}
        <p>
            Unable to load any time tables. Please adjust your settings and try
            again.
        </p>
    {:else}
        <p>Showing timetable {selected_timetable + 1}/{timetables.length}</p>
        <div id="navigation">
            <button
                on:click={() => selected_timetable--}
                disabled={selected_timetable === 0}
            >
                Previous
            </button>
            <button
                on:click={() => selected_timetable++}
                disabled={selected_timetable + 1 >= timetables.length}
            >
                Next
            </button>
        </div>
        <Output timetable={timetables[selected_timetable]} />
    {/if}
{/if}
