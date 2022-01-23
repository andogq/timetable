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
        let campus_options = [];

        for (let course of Object.values(window.data.student.student_enrolment)) {
            console.log(`Downloading ${course.description}`);

            for (let group of Object.values(course.groups)) {
                console.log(`Downloading group ${group.description}`);

                let url = generate_url(course.subject_code, group.activity_group_code);

                let request = await fetch(url);
                if (request.status === 200) {
                    let body = await request.json();

                    let subject = [
                        // Name
                        [course.description, group.description].join(" "),
                        // Times
                        Object.values(body).map(time => {
                            if (!campus_options.includes(time.campus_description)) campus_options.push(time.campus_description);
                            
                            let campus_id = campus_options.indexOf(time.campus_description);
                            
                            return [
                                // Day
                                DAYS.indexOf(DAYS.find(d => d.indexOf(time.day_of_week) === 0)),
                                // Time
                                time.start_time.split(":").reduce((total, n, i) => (
                                    total + (Number(n) * [60, 1][i])
                                ), 0),
                                // Length
                                Number(time.duration),
                                // Campus
                                campus_id
                            ];
                        })
                    ];

                    classes.push(subject);
                }
            }
        }

        let encoded_data = btoa(JSON.stringify([campus_options, classes]));

        window.open(`${window.ando_generator_url}/${encoded_data}`, "_blank").focus();
    }

    run();
})();
