<script>
    import { format_time } from "$lib/format";

    const SUBJECT_PADDING = 0.25;
    const LUMINANCE_VALUES = [0.2126, 0.7152, 0.0722];
    const SRGB_THRESHOLD = 0.03928;
    const LUMINANCE_THRESHOLD = 0.1791;

    const pallette = [
        "#001f3f",
        "#0074D9",
        "#B10DC9",
        "#85144b",
        "#FF4136",
        "#FF851B",
        "#FFDC00",
        "#3D9970",
    ].map((c) => {
        let luminance = c
            .match(/^#(\w{2})(\w{2})(\w{2})/)
            .slice(1)
            .reduce((total, d, i) => {
                d = parseInt(d, 16);
                let srgb = d / 255;

                if (srgb <= SRGB_THRESHOLD) d = srgb / 12.92;
                else d = Math.pow((srgb + 0.055) / 1.055, 2.4);

                return total + d * LUMINANCE_VALUES[i];
            }, 0);

        return {
            color: c,
            text: luminance > LUMINANCE_THRESHOLD ? "black" : "white",
        };
    });

    const subjects = [
        [
            {
                name: "Introduction to Programming",
                start: 570,
                duration: 120,
            },
            {
                name: "Physics 1",
                start: 690,
                duration: 60,
            },
            {
                name: "Introduction to Electrical Engineering",
                start: 810,
                duration: 60,
            },
            {
                name: "Practical Database Concepts",
                start: 875,
                duration: 105,
            },
        ],
        [
            {
                name: "Introduction to Programming",
                start: 570,
                duration: 120,
            },
            {
                name: "Physics 1",
                start: 690,
                duration: 60,
            },
            {
                name: "Introduction to Electrical Engineering",
                start: 810,
                duration: 60,
            },
            {
                name: "Practical Database Concepts",
                start: 875,
                duration: 105,
            },
        ],
    ];

    $: times = subjects.flat().reduce(
        ({ start, end }, subject) => ({
            start: start < subject.start ? start : subject.start,
            end:
                end > subject.start + subject.duration
                    ? end
                    : subject.start + subject.duration,
        }),
        {
            start: Infinity,
            end: 0,
        }
    );
</script>

<div id="calendar">
    {#each subjects as day}
        <div class="day">
            <div class="header">
                <h3>Monday</h3>
                <p>8hrs (2hrs break)</p>
            </div>
            <div class="subjects">
                <div id="ticks">
                    {#each Array(Math.floor((times.end - times.start) / 60)) as _}
                        <div />
                    {/each}
                    {#if (times.end - times.start) % 60 > 0}
                        <div
                            style:flex-grow={((times.end - times.start) / 60) %
                                1}
                        />
                    {/if}
                </div>

                {#each day as subject, i}
                    <div
                        class="subject"
                        style:height={`calc(${
                            (subject.duration / (times.end - times.start)) * 100
                        }% - ${SUBJECT_PADDING * 2}rem)`}
                        style:top={`calc(${
                            ((subject.start - times.start) /
                                (times.end - times.start)) *
                            100
                        }% + ${SUBJECT_PADDING}rem)`}
                        style:background={pallette[i].color}
                        style:color={pallette[i].text}
                    >
                        <h4>{subject.name}</h4>
                        <p>
                            {format_time(subject.start)} - {format_time(
                                subject.start + subject.duration
                            )}
                        </p>
                    </div>
                {/each}
            </div>
        </div>
    {/each}
</div>

<style>
    #calendar {
        height: 100%;
        width: 100%;

        display: flex;
        flex-direction: row;

        gap: var(--spacing);
    }

    #ticks {
        position: absolute;

        top: 0;
        left: 0;

        height: 100%;
        width: 100%;

        display: flex;
        flex-direction: column;
    }

    #ticks > * {
        flex-grow: 1;
        border-top: 2px dashed #DDDDDD;
    }

    .day {
        flex-grow: 1;
        
        height: 100%;

        display: flex;
        flex-direction: column;
    }

    .subjects {
        flex-grow: 1;
        flex-basis: 0;

        position: relative;
    }

    .subject {
        position: absolute;
        width: 100%;

        box-sizing: border-box;

        padding: 0.75rem;
        border-radius: var(--border-radius);
    }
</style>
