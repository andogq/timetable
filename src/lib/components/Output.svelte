<script>
    export let calendar_options;
    export let timetable;

    import { format_time, format_duration } from "$lib/format";

    const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    $: contact_hours = calculate_contact_hours(timetable);

    let times = [];
    $: {
        times = [];
        for (
            let i = calendar_options.start;
            i < calendar_options.end;
            i += calendar_options.tick
        ) {
            let hours = Math.floor(i);
            let mins = Math.round((i % 1) * 60);
            times.push(
                [hours, mins]
                    .map((n) => (String(n).length < 2 ? `0${n}` : String(n)))
                    .join(":")
            );
        }
    }

    let cells = [];
    $: if (times.length > 0) {
        cells = times.map(() =>
            DAYS.map(() => ({
                span: 1,
                text: "",
            }))
        );

        for (let subject of timetable) {
            let start =
                ((subject.time % (24 * 60)) / 60 - calendar_options.start) /
                calendar_options.tick;
            let length = subject.duration / 60 / calendar_options.tick;
            let end = start + length;
            let day = subject.day;

            // Put the spread in the cell
            cells[start][day] = {
                span: length,
                text: [subject.name, subject.location].join("\n"),
            };

            // Remove everything below
            for (let i = start + 1; i < end; i++) {
                cells[i][day] = {
                    span: 0,
                    text: "",
                };
            }
        }
    }

    function calculate_contact_hours(timetable) {
        let contact_hours = DAYS.map((_, i) => ({
            day: i,
            start: Infinity,
            end: 0,
            class: 0,
            class_count: 0,
        }));

        for (let subject of timetable) {
            let day = contact_hours[subject.day];

            if (subject.time < day.start) day.start = subject.time;
            if (subject.time + subject.duration > day.end)
                day.end = subject.time + subject.duration;
            day.class += subject.duration;
            day.class_count++;
        }

        contact_hours = contact_hours.map((c) => ({
            ...c,
            total: c.end - c.start,
            break: c.end - c.start - c.class,
        }));

        return contact_hours;
    }
</script>

<table>
    <thead>
        <th class="time" />

        {#each DAYS as day}
            <th>{day}</th>
        {/each}
    </thead>
    <tbody>
        <tr id="summary">
            <td />

            {#each contact_hours as day}
                <td>
                    {#if isFinite(day.start)}
                        <p>Start: {format_time(day.start).time}</p>
                        <p>End: {format_time(day.end).time}</p>
                        <p>
                            Total: {format_duration(day.total)}{day.break > 0
                                ? ` (${format_duration(day.break)} break)`
                                : ""}
                        </p>
                    {:else}
                        Free day!
                    {/if}
                </td>
            {/each}
        </tr>

        {#each times as time, i}
            <tr>
                <td class="time">{time}</td>

                {#each cells[i] as { span, text }}
                    {#if span !== 0}
                        <td rowspan={span} class:block={span > 1}>
                            {text}
                        </td>
                    {/if}
                {/each}
            </tr>
        {/each}
    </tbody>
</table>

<style>
    table {
        width: 100%;

        table-layout: fixed;
    }

    table,
    th,
    td {
        padding: 0.5rem 1rem;
        border: 1px solid black;
        border-collapse: collapse;
    }

    td {
        white-space: pre-wrap;
        word-wrap: break-word;
    }

    #summary > td {
        white-space: normal;
    }

    .time {
        width: 5rem;
        text-align: center;
    }

    .block {
        background: cyan;
    }
</style>
