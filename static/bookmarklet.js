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

        let path_base = window.location.pathname.split("/").slice(0, -1).join("/");

        return new URL(
            `${path_base}/rest/student/${window.data.student.student_code}/subject/${subject}/group/${group}/activities/?${TOKEN_NAME}=${token}`,
            window.location.origin
        );
    }

    function create_window() {
        let container = document.createElement("div");

        // Container styling
        container.style.position = "fixed";
        container.style.top = "0";
        container.style.left = "0";
        container.style.right = "0";
        container.style.bottom = "0";
        container.style.background = "rgba(0, 0, 0, 0.5)";
        container.style.zIndex = "1000";
        container.style.display = "flex";
        container.style.justifyContent = "space-around";
        container.style.alignItems = "center";

        let loader = document.createElement("div");
        loader.style.padding = "5%";
        loader.innerText = "Loading...";
        loader.style.background = "white";
        loader.style.fontFamily = "sans-serif";

        container.append(loader);
        document.body.append(container);

        return () => {
            container.remove();
        }
    }

    async function run() {
        console.log("Running");

        let close = create_window();

        // Determine available semesters
        console.log("Available Semesters");
        console.log(window.data.student.student_enrolment);

        let campus_options = [];
        let class_codes = [];
        let classes = [];

        for (let course of Object.values(window.data.student.student_enrolment)) {
            console.log(`Downloading ${course.description}`);

            if (!class_codes.includes(course.callista_code)) {
                class_codes.push([
                    // Code
                    course.callista_code,
                    // Name
                    course.description
                ]);
            }

            for (let group of Object.values(course.groups)) {
                console.log(`Downloading group ${group.description}`);

                let url = generate_url(course.subject_code, group.activity_group_code);

                let request = await fetch(url);
                if (request.status === 200) {
                    let body = await request.json();

                    let subject = [
                        // Name
                        group.description,
                        // Subject Code,
                        class_codes.findIndex(c => c[0] === course.callista_code),
                        // Times
                        Object.values(body).map(time => {
                            if (!campus_options.includes(time.campus_description)) {
                                campus_options.push(time.campus_description);
                            }
                            
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

        let encoded_data = btoa(JSON.stringify([campus_options, class_codes, classes]));

        window.open(`${window.ando_generator_url}/${encoded_data}`, "_blank").focus();

        close();
    }

    run();
})();
