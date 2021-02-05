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

struct Subject {
	code string
	description string
	activities []Activity
}

struct Activity {
	activity_type string
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

	println(d)
}