<script>
    import { page } from "$app/stores";
    import generate from "$lib/generate";
    import { format_text } from "$lib/format";

    import Calendar from "$lib/components/Calendar.svelte";

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
    let class_codes = [];

    $: if (
        timetables !== null &&
        timetables.length > 0 &&
        selected_timetable >= timetables.length
    ) {
        selected_timetable = 0;
    }

    $: if ($page.params.data) {
        try {
            let raw = JSON.parse(atob($page.params.data));

            if (!Array.isArray(raw)) throw "Decoded is not an array";

            [campus_options, class_codes, decoded] = raw;

            decoded = decoded.map((subject) => {
                if (
                    // Name
                    typeof subject[0] !== "string" ||
                    // Subject code
                    typeof subject[1] !== "number" ||
                    // Times
                    !Array.isArray(subject[2])
                ) {
                    throw "Malformed subject";
                }

                return {
                    name: subject[0],
                    code: class_codes[subject[1]],
                    times: subject[2].map((time) => {
                        if (
                            // Day
                            typeof time[0] !== "number" ||
                            // Time
                            typeof time[1] !== "number" ||
                            // Length
                            typeof time[2] !== "number" ||
                            // Campus
                            typeof time[3] !== "number"
                        ) {
                            throw "Malformed time";
                        }

                        return {
                            day: time[0],
                            time: time[1],
                            duration: time[2],
                            location: campus_options[time[3]],
                        };
                    }),
                };
            });
        } catch (e) {
            console.error(e);
            decoded = null;
            log = [
                ...log,
                "Problem decoding object or generating timetable. Please try again.",
            ];
        }
    }

    function run() {
        timetables = null;

        timetables = generate(decoded, {
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
                    options: campus_options,
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

<div id="container">
    <div id="column">
        <div id="configuration" class="card">
            <h2>Configuration</h2>
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

            <button
                on:click={run}
                disabled={invalid_rankings.length !== 0 ||
                    rankings.includes(null)}
            >
                Generate
            </button>
        </div>
        <div id="summary" class="card">
            <h2>Summary</h2>

            {#if timetables !== null && timetables.length > 0}
                <p>
                    Showing timetable {selected_timetable +
                        1}/{timetables.length}
                </p>
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
            {/if}
        </div>
    </div>
    <div id="result" class="card">
        {#if timetables !== null && timetables.length > selected_timetable}
            <Calendar
                timetable={timetables[selected_timetable]}
                subjects={class_codes}
            />
        {/if}
    </div>
</div>

<style>
    #container {
        height: 100%;
        width: 100%;

        display: flex;
        flex-direction: row;

        gap: 1rem;
        padding: 1rem;

        box-sizing: border-box;

        background: #dddddd;
    }

    .card {
        background: white;

        padding: 1rem;

        border-radius: 10px;
    }

    #column {
        display: flex;
        flex-direction: column;

        gap: 1rem;

        width: 30%;
    }

    #result {
        flex-grow: 1;
    }

    .error {
        border: 2px solid red;
    }
</style>
