<script>
    import { page } from "$app/stores";
    import generate from "$lib/generate";
    import { format_text } from "$lib/format";

    import Output from "$lib/components/Output.svelte";

    let rankings = [];
    let parameters = {};
    $: invalid_rankings = rankings.filter(
        (r, i) => r !== null && rankings.slice(i + 1).includes(r)
    );

    let timetables = null;
    let log = [];
    let selected_timetable = 0;
    let decoded = null;
    let campus_options = [];

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

            if (!Array.isArray(decoded)) throw "Decoded is not an array";

            for (let subject of decoded) {
                if (
                    typeof subject.name !== "string" ||
                    !Array.isArray(subject.times)
                )
                    throw "Malformed subject";

                for (let time of subject.times) {
                    if (
                        typeof time.day !== "number" ||
                        typeof time.time !== "string" ||
                        typeof time.duration !== "number" ||
                        typeof time.location !== "string"
                    )
                        throw "Malformed time";

                    if (!campus_options.includes(time.location))
                        campus_options.push(time.location);
                }
            }
        } catch (e) {
            console.log(e);
            decoded = null;
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
        selected_timetable = 0;
    }

    $: optimisations = [
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
                    type: "select",
                    options: campus_options
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
</script>

{#if decoded === null}
    <p>Data not found, or problem decoding data. Please try again.</p>
{:else}
    <p>
        In order to generate the best possible table for your circumstance,
        please configure the rankings of the options below. The algorithm will
        attempt to prioritise the options from top to bottom. If you don't like
        what you see, try change them and regenerate for other options.
    </p>
    <p>
        Configure the options, and click "Generate" to generate some timetables.
    </p>

    <div>
        <ol id="optimisations">
            {#each optimisations as _, i}
                <li>
                    <select
                        bind:value={rankings[i]}
                        class:error={invalid_rankings.includes(rankings[i])}
                    >
                        <option value={null} selected>
                            Select optimisation
                        </option>
                        {#each optimisations as { key }}
                            <option value={key}>
                                {format_text(key)}
                                {#if rankings[i] !== key && rankings.includes(key)}
                                    (Selected)
                                {/if}
                            </option>
                        {/each}
                    </select>

                    {#each Object.entries(optimisations.find((o) => o.key === rankings[i])?.parameters || {}) as [key, parameter]}
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
            {#each optimisations as { key, label }}
                <p><b>{format_text(key)}</b>: {label}</p>
            {/each}
        </div>
    </div>

    <button
        on:click={run}
        disabled={invalid_rankings.length !== 0 || rankings.includes(null)}
    >
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

<style>
    .error {
        border: 2px solid red;
    }
</style>
