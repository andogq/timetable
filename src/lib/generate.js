const fs = require("fs/promises");
const path = require("path");

const DATA = "./data";

const DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday"
];

const PREFERRED_LOCATION = "Melbourne City";

function permutate(options) {
    if (options.length === 1) return options[0].times.map(time => [{ name: options[0].name, ...time }]);
    else {
        let target = options[0];
        options = permutate(options.slice(1));
        
        let result = [];
        
        for (let time of target.times) {
            for (let o of options) {
                result.push([{
                    name: target.name,
                    ...time
                }, ...o]);
            }
        }
        
        return result;
    }
}

function convert_time(day, time) {
    let [hours, minutes] = time.split(":").map(n => Number(n));
    
    hours += day * 24;
    
    return (hours * 60) + minutes;
}


function format_time(time) {
    let mins_per_day = 24 * 60;
    
    let day = Math.floor(time / mins_per_day);
    time = time % mins_per_day;
    
    let hours = String(Math.floor(time / 60));
    let mins = String(time % 60);
    
    if (hours.length === 1) hours = `0${hours}`;
    if (mins.length === 1) mins = `0${mins}`;
    
    return {
        day,
        time: `${hours}:${mins}`
    }
}

function format_duration(duration) {
    let hours = Math.floor(duration / 60);
    let mins = duration % 60;
    
    hours = hours > 0 ? 
        hours + (
            hours === 1 ? " hr" : " hrs"
        ) :
    "";
    
    mins = mins > 0 ?
        mins + (
            mins === 1 ? " min" : " mins"
        ) :
    "";
    
    return [hours, mins].join(" ").trim() || "0 mins";
}

function sort(timetable) {
    return timetable.sort((a, b) => a.time - b.time);
}

function clashes(timetable) {
    let end_time = 0;
    
    let clash = false;
    
    for (let subject of timetable) {
        if (subject.time < end_time) {
            clash = true;
            break;
        } else {
            // Change end time to this subject's ending time
            end_time = subject.time + subject.duration;
        }
    }
    
    return clash;
}

function calculate_penalty(timetable) {
    let penalty = 0;
    
    let end_time = timetable[0].time;
    
    for (let subject of timetable) {
        penalty += subject.time - end_time;
        
        end_time = subject.time + subject.duration;
    }
    
    return penalty;
}

function calculate_contact_hours(timetable) {
    let contact_hours = DAYS.map((_, i) => ({
        day: i,
        start: Infinity,
        end: 0,
        class: 0,
        class_count: 0
    }));
    
    for (let subject of timetable) {
        let day = contact_hours[subject.day];
        
        if (subject.time < day.start) day.start = subject.time;
        if (subject.time + subject.duration > day.end) day.end = subject.time + subject.duration;
        day.class += subject.duration;
        day.class_count++;
    }
    
    contact_hours = contact_hours
        .filter(c => isFinite(c.start))
        .map(c => ({
            ...c,
            total: c.end - c.start,
            break: c.end - c.start - c.class
        }));
    
    return contact_hours;
}

async function run() {
//  let files = await fs.readdir(path.resolve(__dirname, DATA));
//  let classes = [];
//  
//  for (let file_name of files) {
//      let file_path = path.resolve(__dirname, DATA, file_name);
//      
//      console.log(`Loading ${file_path}`);
//      
//      let file = await fs.readFile(file_path);
//      
//      try {
//          file = JSON.parse(file);
//      } catch {
//          // Not a JSON file
//          continue;
//      }
//      
//      let subject = {
//          name: file_name.replace(/\..+$/, "").replace("_", " ").toUpperCase(),
//          times: []
//      }
//      
//      for (let time of Object.values(file)) {
//          subject.times.push({
//              day: DAYS.indexOf(DAYS.find(d => d.indexOf(time.day_of_week) === 0)),
//              time: time.start_time,
//              duration: Number(time.duration),
//              location: time.campus_description
//          });
//      }
//      
//      classes.push(subject);
//  }
    
    let classes = await fs.readFile(path.resolve(__dirname, "./data.json"));
    classes = JSON.parse(classes);
    
    // Generate all possibilities
    let timetables = permutate(classes);
    console.log(`Total possibilities: ${timetables.length}`);
    
    // Convert times
    timetables = timetables.map(timetable => (
        timetable.map(subject => ({
            ...subject,
            pretty_time: subject.time,
            time: convert_time(subject.day, subject.time)
        }))
    ));
    
    // Sort each subject within a timetable
    timetables = timetables.map(timetable => sort(timetable));
    
    // Check for clashes
    let total_clashes = 0;
    timetables = timetables.filter(timetable => {
        let clash = clashes(timetable);
        
        if (clash) total_clashes++;
        
        return !clash;
    });
    console.log(`Found ${total_clashes} clashes`);
    
    // Calculate penalty for each timetable
    timetables = timetables
        .map(timetable => ({
            timetable,
            penalty: calculate_penalty(timetable),
            locations: timetable.reduce((locations, subject) => ({
                ...locations,
                [subject.location]: (locations[subject.location] ?? 0) + 1
            }), {})
        }));
    
    if (PREFERRED_LOCATION) {
        // Sort by location preference
        timetables = timetables.sort((a, b) => {
            // Attempt to prioritise campus location, but if the same prioritise penalty
            if (a.locations[PREFERRED_LOCATION] > b.locations[PREFERRED_LOCATION]) return -1;
            else if (a.locations[PREFERRED_LOCATION] > b.locations[PREFERRED_LOCATION]) return 1;
            else return b.penalty - a.penalty;
        });
    } else {
        // Sort only on penalty
        timetables = timetables.sort((a, b) => a.penalty - b.penalty);
    }
    
    timetables = timetables.map(({timetable}) => timetable);
    
    // Pick out the best option
    let timetable = timetables[0];
    
    // Calculate contact hours
    let contact_hours = calculate_contact_hours(timetable);
    
    console.log(`\nSelected Subjects:`);
    console.log(
        timetable.map(subject => (
            `${subject.name}: ${DAYS[subject.day]} ${format_time(subject.time).time} - ${format_time(subject.time + subject.duration).time} (${subject.location})`
        )).join("\n")
    );
    
    console.log(`\nWeek Summary:`);
    console.log(
        contact_hours.map(c => (
            `${DAYS[c.day]}: ${format_time(c.start).time} to ${format_time(c.end).time} - ${c.class_count} class${c.class_count === 1 ? "" : "es"}, ${format_duration(c.total)} total (${format_duration(c.break)} break)`
        )).join("\n")
    );
}

run();
