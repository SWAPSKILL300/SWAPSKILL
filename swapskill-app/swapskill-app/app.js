let profile = null;

function createProfile() {
    const name = document.getElementById("name").value;
    const teach = document.getElementById("teach").value.split(",").map(s => s.trim());
    const learn = document.getElementById("learn").value.split(",").map(s => s.trim());

    if (!name || teach.length === 0 || learn.length === 0) {
        alert("Please fill all fields!");
        return;
    }

    profile = { name, teach, learn };
    alert("Profile saved successfully!");
}

function matchSkills() {
    if (!profile) {
        alert("Create your profile first!");
        return;
    }

    // Demo sample profiles
    const otherUsers = [
        { name: "Asha", teach: ["Photoshop", "UI Design"], learn: ["Python", "SQL"] },
        { name: "Ravi", teach: ["Python", "React"], learn: ["Photoshop"] },
        { name: "Meera", teach: ["SQL", "Excel"], learn: ["Guitar"] }
    ];

    let bestMatch = null;
    let bestScore = 0;

    otherUsers.forEach(user => {
        let score = 0;

        const theyTeachWhatILearn = user.teach.filter(s => profile.learn.includes(s)).length;
        const theyLearnWhatITeach = user.learn.filter(s => profile.teach.includes(s)).length;

        score = theyTeachWhatILearn + theyLearnWhatITeach * 0.8;

        if (score > bestScore) {
            bestScore = score;
            bestMatch = user;
        }
    });

    const resultDiv = document.getElementById("matchResult");
    if (bestMatch) {
        resultDiv.style.display = "block";
        resultDiv.innerHTML = `
            <strong>Best Match Found!</strong><br>
            <br>
            Name: ${bestMatch.name}<br>
            They can teach: ${bestMatch.teach.join(", ")}<br>
            They want to learn: ${bestMatch.learn.join(", ")}
        `;
    } else {
        resultDiv.style.display = "block";
        resultDiv.innerHTML = "No good match found yet.";
    }
}
