/*
# Plan:

Beginning with the class with the least options, pick the option that has the
least impact

Impact could be calculated from:
 - Difference in time between first class and last class in the week
 - Empty space between classes during the week
 - Distance between average time of class and that class

*/

module main

import os
import json

struct Time {
	hour int
	minute int
}
fn (t Time) add_minutes(minutes int) Time {
	return Time{
		hour: (t.hour + ((t.minute + minutes) / 60)) % 24
		minute: (t.minute + minutes) % 60
	}
}
fn (t Time) str() string {
	mut hour := t.hour.str()
	if hour.len == 1 {
		hour = "0$hour"
	}

	mut minute := t.minute.str()
	if minute.len == 1 {
		minute = "0$minute"
	}
	return '$hour:$minute'
}
fn (a Time) < (b Time) bool {
	mut result := true

	if a.hour == b.hour {
		result = a.minute < b.minute
	} else {
		result = a.hour < b.hour
	}

	return result
}
fn (a Time) == (b Time) bool {
	return a.hour == b.hour && a.minute == b.minute
}
fn new_time(time_string string) Time {
	time_split := time_string.split(":")

	hour := time_split[0].int() % 24
	minute := time_split[1].int() % 60

	return Time{
		hour
		minute
	}
}

struct Class {
	subject string
	description string
	class string
	options []ActivityOption
}

struct ActivityOption {
	day int
	time string
	duration int
}

struct Activity {
	time string
	duration string
	subject string
	description string
	class string
}

struct Day {
	activities []Activity
}

// fn (mut d Day) add(activity Activity) bool {
// 	for a in d.activities {
		
// 	}
// }

struct Timetable {
	days []Day = []Day{len: 5, init: Day{}}
}

fn (t Timetable) allocate(class Class) {
}

fn main() {
	// Load json from file
	d := os.read_file("data.json") or {
		eprintln("Problem opening file")
		return
	}
	mut data := json.decode([]Class, d) or {
		eprintln("Problem decoding json")
		return
	}

	// First, sort activities in order of how many options there are
	data.sort(a.options.len < b.options.len)

	mut a := new_time("08:30")
	println(a.add_minutes(90))
}