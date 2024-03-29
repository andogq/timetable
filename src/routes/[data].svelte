<script>
    import { page } from "$app/stores";
    import generate from "$lib/generate";
    import { slide } from "svelte/transition";

    import Calendar from "$lib/components/Calendar.svelte";
    import Order from "$lib/components/Order.svelte";
    import links from "$lib/links";

    let rankings = [];
    let parameters = {};

    let timetables = null;
    let log = [];
    let selected_timetable = 0;
    let selected_semester = undefined;
    
    let decoded = null;
    
    let campus_options = [];
    let class_codes = [];
    let semester_options = [];

    $: if (
        timetables !== null &&
        timetables.length > 0 &&
        selected_timetable >= timetables.length
    ) {
        selected_timetable = 0;
    }

    $: if (semester_options.length === 1) {
        selected_semester = semester_options[0];
    } else if (semester_options.length === 0) selected_semester = undefined;

    $: if ($page.params.data) {
        try {
            let raw = JSON.parse(atob($page.params.data));

            if (!Array.isArray(raw)) throw "Decoded is not an array";

            [campus_options, class_codes, semester_options, decoded] = raw;

            class_codes = class_codes.map(([code, name]) => ({
                code,
                name,
            }));

            decoded = decoded.map((subject) => {
                if (
                    // Name
                    typeof subject[0] !== "string" ||
                    // Subject code
                    typeof subject[1] !== "number" ||
                    // Semester
                    typeof subject[2] !== "number" ||
                    // Times
                    !Array.isArray(subject[3])
                ) {
                    throw "Malformed subject";
                }

                return {
                    name: subject[0],
                    code: class_codes[subject[1]].code,
                    semester: semester_options[subject[2]],
                    times: subject[3].map((time) => {
                        if (
                            // Day
                            typeof time[0] !== "number" ||
                            // Time
                            typeof time[1] !== "number" ||
                            // Length
                            typeof time[2] !== "number" ||
                            // Campus
                            typeof time[3] !== "number" ||
                            // Popularity
                            !(typeof time[4] === "number" || time[4] === null)
                        ) {
                            throw "Malformed time";
                        }

                        return {
                            day: time[0],
                            time: time[1],
                            duration: time[2],
                            campus: campus_options[time[3]],
                            popularity: time[4]
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

        timetables = generate(decoded.filter(s => s.semester === selected_semester), {
            rankings,
            parameters,
        });

        selected_timetable = 0;
    }
</script>

<div id="container">
    <div id="column">
        <div class="card" id="header">
            <h1>
                <a href="/">Timetable Generator</a>
            </h1>

            <div id="links">
                {#each links as { label, href }}
                    <p>
                        <a {href}>{label}</a>
                    </p>
                {/each}
            </div>
        </div>

        <div class="card">
            <h2>Configuration</h2>

            <p>
                In order to generate the best possible table for your
                circumstance, please configure the rankings of the options
                below. The algorithm will attempt to prioritise the options from
                top to bottom. If you don't like what you see, try change them
                and regenerate for other options.
                <br />
                Configure the options, and click "Generate" to generate some timetables.
            </p>

            <div>
                <Order
                    options={[
                        {
                            key: "campus",
                            options: campus_options,
                        },
                        {
                            key: "days",
                        },
                        {
                            key: "breaks"
                        },
                        {
                            key: "popularity",
                            options: [
                                "Lowest Average",
                                "Below 100%"
                            ]
                        },
                    ]}
                    bind:rankings
                    bind:parameters
                />
            </div>

            {#if semester_options.length > 1}
                <div id="select_semester">
                    <p>Select Semester</p>
                    <select bind:value={selected_semester}>
                        {#each semester_options as semester}
                            <option>{semester}</option>
                        {/each}
                    </select>
                </div>
            {/if}

            <button id="generate_button" on:click={run}> Generate </button>
        </div>

        {#if timetables !== null && timetables.length > 0}
            <div id="summary" class="card" transition:slide>
                <h2>Summary</h2>

                <div id="navigation">
                    <button
                        on:click={() => selected_timetable--}
                        disabled={selected_timetable === 0}
                    >
                        ❮❮
                    </button>

                    <p>{selected_timetable + 1}/{timetables.length}</p>

                    <button
                        on:click={() => selected_timetable++}
                        disabled={selected_timetable + 1 >= timetables.length}
                    >
                        ❯❯
                    </button>
                </div>
            </div>
        {/if}
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

        gap: var(--spacing);
        padding: var(--spacing);

        box-sizing: border-box;

        background: #dddddd;
    }

    .card {
        background: white;

        padding: var(--spacing);

        border-radius: var(--border-radius);
    }

    .card > p {
        font-size: 0.85rem;
    }

    .card > *:not(:last-child) {
        margin-bottom: var(--spacing);
    }

    #column {
        display: flex;
        flex-direction: column;

        overflow-y: scroll;

        gap: var(--spacing);

        width: 20%;
        max-width: 25rem;
    }

    #result {
        flex-grow: 1;
        position: relative;
    }

    #generate_button {
        width: 100%;
        margin: 0;
    }

    #navigation {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }

    #header {
        text-align: center;
    }

    #header > h1 > a {
        text-decoration: none;
        color: black;
    }

    #links {
        display: flex;
        flex-direction: row;
        justify-content: center;
    }

    #links > p {
        padding: 0 1rem;
    }

    #links > p:not(:last-child) {
        border-right: 2px dashed black;
    }

    #select_semester {
        border: 1px solid #aaaaaa;
        border-radius: var(--border-radius);

        user-select: none;
        padding: 0.5rem;

        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;

        font-size: 0.9rem;
    }

    #select_semester > select {
        background: none;
        border: none;
        
        padding: 0;
        margin: 0;

        cursor: pointer;

        text-align: right;
    }

    #select_semester > p {
        margin: 0;
    }
</style>
