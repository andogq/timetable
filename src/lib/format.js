export function format_time(time) {    
    let hours = String(Math.floor(time / 60));
    let mins = String(time % 60);
    
    if (hours.length === 1) hours = `0${hours}`;
    if (mins.length === 1) mins = `0${mins}`;
    
    return `${hours}:${mins}`;
}

export function format_duration(duration) {
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

export function format_text(text) {
    return text
        .split("_")
        .map(word => word[0].toUpperCase() + word.slice(1))
        .join(" ");
}
