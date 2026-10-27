```javascript
// 1. Get HTML elements
const studentForm = document.getElementById("studentForm");
const studentName = document.getElementById("studentName");
const studentCourse = document.getElementById("studentCourse");
const studentPhone = document.getElementById("studentPhone");
const studentEmail = document.getElementById("studentEmail");

const editId = document.getElementById("editId");
const formTitle = document.getElementById("formTitle");
const saveButton = document.getElementById("saveButton");
const cancelEditButton = document.getElementById("cancelEditButton");

const studentList = document.getElementById("studentList");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const message = document.getElementById("message");

const totalStudents = document.getElementById("totalStudents");
const subscribedStudents = document.getElementById("subscribedStudents");
const unsubscribedStudents = document.getElementById("unsubscribedStudents");
const resultCount = document.getElementById("resultCount");

document.getElementById("currentYear").textContent =
    new Date().getFullYear();


// 2. Load students from localStorage
function loadStudents() {
    try {
        const savedData = localStorage.getItem("studentManagementData");

        if (savedData) {
            const data = JSON.parse(savedData);

            if (Array.isArray(data)) {
                return data.filter(function(student) {
                    return student &&
                        Number.isSafeInteger(student.id) &&
                        student.id > 0 &&
                        typeof student.name === "string" &&
                        typeof student.course === "string";
                });
            }
        }
    } catch (error) {
        console.error("Error loading students:", error);
    }

    return [];
}

let students = loadStudents();

let nextId = Math.max(
    0,
    ...students.map(function(student) {
        return student.id;
    })
) + 1;


// 3. Save students
function saveStudents() {
    try {
        localStorage.setItem(
            "studentManagementData",
            JSON.stringify(students)
        );

        return true;
    } catch (error) {
        showMessage("Unable to save student data.", "danger");
        return false;
    }
}


// 4. Display messages
function showMessage(text, type) {
    message.textContent = text;
    message.className = "alert alert-" + type + " mt-3";
}

function clearMessage() {
    message.textContent = "";
    message.className = "";
}


// 5. Add or edit a student
studentForm.addEventListener("submit", function(event) {
    event.preventDefault();
    clearMessage();

    const name = studentName.value.trim();
    const course = studentCourse.value.trim();
    const phone = studentPhone.value.trim();
    const email = studentEmail.value.trim();

    if (!name || !course) {
        showMessage("Enter the student name and course.", "warning");
        return;
    }

    // Update an existing student
    if (editId.value !== "") {
        const id = Number(editId.value);

        const student = students.find(function(item) {
            return item.id === id;
        });

        if (!student) {
            showMessage("Student not found.", "danger");
            resetForm();
            return;
        }

        const previousStudent = { ...student };

        student.name = name;
        student.course = course;
        student.phone = phone;
        student.email = email;

        if (!saveStudents()) {
            Object.assign(student, previousStudent);
            return;
        }

        resetForm();
        renderStudents();
        showMessage("Student updated successfully.", "success");
        return;
    }

    // Create a new student
    const newStudent = {
        id: nextId,
        name: name,
        course: course,
        phone: phone,
        email: email,
        subscribed: false,
        createdAt: new Date().toISOString()
    };

    students.push(newStudent);

    if (!saveStudents()) {
        students.pop();
        return;
    }

    nextId++;

    studentForm.reset();
    renderStudents();

    showMessage(
        "Student added successfully! ID: " + newStudent.id,
        "success"
    );
});


// 6. Render student cards
function renderStudents() {
    studentList.replaceChildren();

    const searchText = searchInput.value.trim().toLowerCase();
    const filter = statusFilter.value;

    const filteredStudents = students.filter(function(student) {
        const searchableText = [
            student.id,
            student.name,
            student.course,
            student.phone || "",
            student.email || ""
        ].join(" ").toLowerCase();

        const matchesSearch = searchableText.includes(searchText);

        const matchesStatus =
            filter === "all" ||
            (filter === "subscribed" && student.subscribed === true) ||
            (filter === "unsubscribed" && student.subscribed !== true);

        return matchesSearch && matchesStatus;
    });

    // Update statistics
    totalStudents.textContent = students.length;

    subscribedStudents.textContent = students.filter(function(student) {
        return student.subscribed === true;
    }).length;

    unsubscribedStudents.textContent = students.filter(function(student) {
        return student.subscribed !== true;
    }).length;

    resultCount.textContent =
        filteredStudents.length +
        (filteredStudents.length === 1 ? " Student" : " Students");

    // Empty list message
    if (filteredStudents.length === 0) {
        const column = document.createElement("div");
        column.className = "col-12";

        const box = document.createElement("div");
        box.className = "main-card empty-state";

        const title = document.createElement("h5");
        title.textContent = students.length === 0
            ? "No Students Yet"
            : "No Matching Students";

        const description = document.createElement("p");
        description.textContent = students.length === 0
            ? "Add your first student using the form above."
            : "Try another search or change the filter.";

        box.append(title, description);
        column.appendChild(box);
        studentList.appendChild(column);

        return;
    }

    // Create each student card
    filteredStudents.forEach(function(student) {
        const column = document.createElement("div");
        column.className = "col-md-6 col-lg-4";

        const card = document.createElement("div");
        card.className = "student-card";

        const heading = document.createElement("h5");
        heading.className = "fw-bold";
        heading.textContent = student.name;

        const idText = document.createElement("p");
        idText.className = "student-id mb-3";
        idText.textContent = "Student ID: " + student.id;

        const courseText = document.createElement("p");
        courseText.className = "mb-2";
        courseText.textContent = "Course: " + student.course;

        const phoneText = document.createElement("p");
        phoneText.className = "mb-2";
        phoneText.textContent =
            "Phone: " + (student.phone || "Not provided");

        const emailText = document.createElement("p");
        emailText.className = "mb-3 text-break";
        emailText.textContent =
            "Email: " + (student.email || "Not provided");

        // Subscription status
        const status = document.createElement("span");

        if (student.subscribed === true) {
            status.className = "status-active";
            status.textContent = "Subscribed";
        } else {
            status.className = "status-inactive";
            status.textContent = "Not Subscribed";
        }

        const statusContainer = document.createElement("div");
        statusContainer.className = "mb-3";
        statusContainer.appendChild(status);

        // Subscribe / Unsubscribe button
        const subscribeButton = document.createElement("button");
        subscribeButton.type = "button";
        subscribeButton.className = student.subscribed
            ? "btn btn-warning btn-sm"
            : "btn btn-success btn-sm";

        subscribeButton.textContent = student.subscribed
            ? "Unsubscribe"
            : "Subscribe";

        subscribeButton.addEventListener("click", function() {
            const previousValue = student.subscribed;

            student.subscribed = !student.subscribed;

            if (!saveStudents()) {
                student.subscribed = previousValue;
                return;
            }

            renderStudents();
        });

        // Edit button
        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "btn btn-primary btn-sm";
        editButton.textContent = "Edit";

        editButton.addEventListener("click", function() {
            studentName.value = student.name;
            studentCourse.value = student.course;
            studentPhone.value = student.phone || "";
            studentEmail.value = student.email || "";
            editId.value = student.id;

            formTitle.textContent = "Edit Student #" + student.id;
            saveButton.textContent = "Save Changes";
            cancelEditButton.classList.remove("d-none");

            clearMessage();

            studentForm.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

            studentName.focus();
        });

        // Delete button
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "btn btn-outline-danger btn-sm";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function() {
            const confirmed = confirm(
                "Are you sure you want to delete " + student.name + "?"
            );

            if (!confirmed) {
                return;
            }

            const previousStudents = students;

            students = students.filter(function(item) {
                return item.id !== student.id;
            });

            if (!saveStudents()) {
                students = previousStudents;
                return;
            }

            if (Number(editId.value) === student.id) {
                resetForm();
            }

            renderStudents();
            showMessage("Student deleted successfully.", "success");
        });

        // Arrange buttons
        const buttons = document.createElement("div");
        buttons.className = "d-flex flex-wrap gap-2";

        buttons.append(
            subscribeButton,
            editButton,
            deleteButton
        );

        // Assemble card
        card.append(
            heading,
            idText,
            courseText,
            phoneText,
            emailText,
            statusContainer,
            buttons
        );

        column.appendChild(card);
        studentList.appendChild(column);
    });
}


// 7. Reset the form
function resetForm() {
    studentForm.reset();
    editId.value = "";

    formTitle.textContent = "Add New Student";
    saveButton.textContent = "Add Student";

    cancelEditButton.classList.add("d-none");
    clearMessage();
}

cancelEditButton.addEventListener("click", function() {
    resetForm();
});


// 8. Search and filter
searchInput.addEventListener("input", renderStudents);
statusFilter.addEventListener("change", renderStudents);


// 9. Show saved students when the page opens
renderStudents();
```