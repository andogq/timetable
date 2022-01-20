(() => {
    const TOKEN_NAME = "ss";
    const DAYS = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday"
    ];

    function generate_url(subject, group) {
        let url = new URL(window.location.href);
        let token = url.searchParams.get(TOKEN_NAME);

        return new URL(
            `/even/rest/student/${window.data.student.student_code}/subject/${subject}/group/${group}/activities/?${TOKEN_NAME}=${token}`,
            window.location.origin
        );
    }

    async function run() {
        console.log("Running");

        let classes = [];
        
        for (let course of Object.values(window.data.student.student_enrolment)) {
            console.log(`Downloading ${course.description}`);

            for (let group of Object.values(course.groups)) {
                console.log(`Downloading group ${group.description}`);

                let url = generate_url(course.subject_code, group.activity_group_code);

                let request = await fetch(url);
                if (request.status === 200) {
                    let body = await request.json();

                    let subject = {
                        name: [course.description, group.description].join(" "),
                        times: []
                    };

                    // Transform the result
                    for (let time of Object.values(body)) {
                        subject.times.push({
                            day: DAYS.indexOf(DAYS.find(d => d.indexOf(time.day_of_week) === 0)),
                            time: time.start_time,
                            duration: Number(time.duration),
                            location: time.campus_description
                        });
                    }

                    classes.push(subject);
                }
            }
        }

        let encoded_data = btoa(JSON.stringify(classes));

        window.open(`${window.ando_generator_url}/?data=${encoded_data}`, "_blank").focus();
    }

    run();
})();
