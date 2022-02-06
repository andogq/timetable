(() => {
    const TOKEN_NAME = "ss";
    const DAYS = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday"
    ];

    function generate_urls(subject, group) {
        let url = new URL(window.location.href);
        let token = url.searchParams.get(TOKEN_NAME);

        let path_base = window.location.pathname.split("/").slice(0, -1).join("/");

        return ["activities", "popularitiess"].reduce((obj, type) => ({
            ...obj,
            [type]: new URL(
                `${path_base}/rest/student/${window.data.student.student_code}/subject/${subject}/group/${group}/${type}/?${TOKEN_NAME}=${token}`,
                window.location.origin
            )
        }), {});
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
        let semester_options = [];
        let classes = [];

        for (let course of Object.values(window.data.student.student_enrolment)) {
            console.log(`Downloading ${course.description}`);

            if (!class_codes.includes(course.callista_code)) {
                class_codes.push([
                    // Code
                    course.callista_code,
                    // Name
                    course.description,
                ]);
            }

            if (!semester_options.includes(course.semester_description)) {
                semester_options.push(course.semester_description);
            }

            for (let group of Object.values(course.groups)) {
                console.log(`Downloading group ${group.description}`);

                let {
                    activities: activities_url,
                    popularitiess: popularities_url
                } = generate_urls(course.subject_code, group.activity_group_code);

                let [activities_request, popularities_request] = await Promise.all([
                    fetch(activities_url),
                    fetch(popularities_url)
                ]);
                
                if (activities_request.status === 200) {
                    let activities = await activities_request.json();
                    let popularities = popularities_request.status === 200 ? await popularities_request.json() : null;

                    let subject = [
                        // Name
                        group.description,
                        // Subject Code,
                        class_codes.findIndex(c => c[0] === course.callista_code),
                        // Semester
                        semester_options.indexOf(course.semester_description),
                        // Times
                        Object.values(activities).map((time, i) => {
                            if (!campus_options.includes(time.campus_description)) {
                                campus_options.push(time.campus_description);
                            }
                            
                            let campus_id = campus_options.indexOf(time.campus_description);
                            
                            return [
                                // Day
                                DAYS.indexOf(DAYS.find(d => d.indexOf(time.day_of_week) === 0)),
                                // Time
                                time.start_time.split(":").reduce((total, n, j) => (
                                    total + (Number(n) * [60, 1][j])
                                ), 0),
                                // Length
                                Number(time.duration),
                                // Campus
                                campus_id,
                                // Popularities
                                popularities !== null ? popularities[`activity: ${time.activity_code}`].popularity : null
                            ];
                        })
                    ];

                    classes.push(subject);
                }
            }
        }

        let encoded_data = btoa(JSON.stringify([campus_options, class_codes, semester_options, classes]));

        window.open(`${window.ando_generator_url}/${encoded_data}`, "_blank").focus();

        close();
    }

    run();
})();
