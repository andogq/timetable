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
mut:
	hour int
	minute int
}
fn (mut t Time) add_minutes(minutes int) {
	t.hour = (t.hour + ((t.minute + minutes) / 60)) % 24
	t.minute = (t.minute + minutes) % 60
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
fn new_time(time_string string) Time {
	time_split := time_string.split(":")

	hour := time_split[0].int() % 24
	minute := time_split[1].int() % 60

	return Time{
		hour
		minute
	}
}
	options []ActivityOption
}

struct ActivityOption {
	day string
	start string
	duration int
}

fn main() {
	data := os.read_file("data.json") or {
		eprintln("Problem opening file")
		return
	}
	d := json.decode([]Subject, data) or {
		eprintln("Problem decoding json")
		return
	}

	mut t := new_time("08:30")
	t.add_minutes(90)
	println(t)
}