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