const DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday"
];

function permutate(options) {
    if (options.length === 1) return options[0].times.map(time => [{
        name: options[0].name,
        code: options[0].code,
        ...time
    }]);
    else {
        let target = options[0];
        options = permutate(options.slice(1));

        let result = [];

        for (let time of target.times) {
            for (let o of options) {
                result.push([{
                    ...target,
                    ...time
                }, ...o]);
            }
        }

        return result;
    }
}

function sort(timetable) {
    return timetable.sort((a, b) => (
        a.day - b.day ||
        a.time - b.time
    ));
}

function clashes(timetable) {
    let end_time = 0;

    let clash = false;

    for (let subject of timetable) {
        let time = (subject.day * 24 * 60) + subject.time;

        if (time < end_time) {
            clash = true;
            break;
        } else {
            // Change end time to this subject's ending time
            end_time = time + subject.duration;
        }
    }

    return clash;
}

const PENALTIES = {
    "breaks": timetable => {
        let penalty = 0;

        // Start with the first subject of the week
        let end_time = timetable[0].time;
        let day = timetable[0].day;

        for (let subject of timetable) {
            if (day !== subject.day) {
                end_time = subject.time;
                day = subject.day;
            }

            penalty += subject.time - end_time;

            end_time = subject.time + subject.duration;
        }

        return penalty;
    },
    "days": timetable => {
        let days = [];

        for (let subject of timetable) {
            if (!days.includes(subject.day)) days.push(subject.day);
        }

        return days.length
    },
    "campus": (timetable, options) => {
        let campus_count = 0;

        for (let subject of timetable) {
            if (subject.campus === options.campus) campus_count++;
        }

        return -campus_count;
    },
    "popularity": (timetable, options) => {
        if (options.popularity === "Lowest Average") {
            let total_popularity = timetable.reduce((total, subject) => total + subject.popularity, 0);
            return total_popularity / timetable.length
        } else if (options.popularity === "Below 100%") {
            let total_below = timetable.reduce((total, subject) => total + (subject.popularity >= 100 ? 1 : 0), 0);
            return total_below;
        }
    }
}

export default function generate(classes, {
    amount = 10,
    log = console.log,
    rankings,
    parameters,
} = {}) {
    let start_time = Date.now();

    // Generate all possibilities
    let timetables = permutate(classes);
    log(`Total possibilities: ${timetables.length}`);

    // Sort each subject within a timetable
    timetables = timetables.map(timetable => sort(timetable));

    // Check for clashes
    let total_clashes = 0;
    timetables = timetables.filter(timetable => {
        let clash = clashes(timetable);

        if (clash) total_clashes++;

        return !clash;
    });
    log(`Found ${total_clashes} clashes`);

    // Calculate penalty for each timetable
    timetables = timetables
        .map(timetable => ({
            timetable,
            penalty: Object.entries(PENALTIES).reduce((obj, [key, penalty]) => ({
                ...obj,
                [key]: penalty(timetable, parameters)
            }), {})
        }));

    timetables = timetables.sort((a, b) => {
        for (let ranking of rankings) {
            let r = a.penalty[ranking] - b.penalty[ranking];
            if (r !== 0) return r;
        }

        // If here, everything is the same
        return 0;
    });

    timetables = timetables
        .slice(0, amount);


    log(`Completed in ${Date.now() - start_time}ms`);

    return timetables.map(({ timetable }) => timetable);
}
