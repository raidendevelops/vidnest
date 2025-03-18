function handleCredentialResponse(response) {
    try {
        const data = parseJwt(response.credential);
        console.log("User Data:", data);

        if (data.name && data.picture) {
            localStorage.setItem("username", data.name);
            localStorage.setItem("userPhoto", data.picture);

            document.getElementById("userProfile").innerHTML = 
                `<img src="${data.picture}" class="profile-pic" alt="User Profile">`;
            document.getElementById("signupBtn").style.display = "none";
        } else {
            console.error("Invalid user data:", data);
        }
    } catch (error) {
        console.error("Error handling credential response:", error);
    }
}

function parseJwt(token) {
    try {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error("Error parsing JWT:", error);
        return null;
    }
}

function signOutUser() {
    google.accounts.id.disableAutoSelect();
    localStorage.removeItem("username");
    localStorage.removeItem("userPhoto");
    document.getElementById("userProfile").innerHTML = "";
    document.getElementById("signupBtn").style.display = "flex";
}

window.onload = function() {
    google.accounts.id.initialize({
        client_id: "889377554293-mlcl67svmcge0137up5blie5lqa8j2j5.apps.googleusercontent.com",
        callback: handleCredentialResponse
    });

    google.accounts.id.renderButton(
        document.getElementById("signupBtn"),
        { theme: "outline", size: "large" }
    );

    google.accounts.id.prompt();
    getAllVideosData();
};

async function getAllVideosData() {
    try {
        console.log("Fetching videos data...");
        const response = await fetch('https://vidnestapi.netlify.app/api/getVideoData?getallvideos=true');
        
        if (!response.ok) {
            console.error("Failed to fetch videos, response not ok:", response);
            alert("Failed to fetch videos.");
            return;
        }

        const videosData = await response.json();
        console.log("Fetched videos data:", videosData);

        if (videosData.error) {
            console.error("Failed to fetch videos:", videosData.error);
            alert("Failed to fetch videos.");
            return;
        }

        const videoList = document.getElementById("videoList");
        videoList.innerHTML = '';

        videosData.forEach(video => {
            console.log("Processing video:", video);

            // Calculate the time since the video was created
            const createdAt = new Date(video.createdAt);
            const now = new Date();
            const timeDiff = Math.abs(now - createdAt);
            const timeSince = getTimeSince(timeDiff);

            const videoCard = document.createElement('a');
            videoCard.href = `video.html?id=${video.id}`;
            videoCard.classList.add('video-card');
            videoCard.innerHTML = `
                <img src="${video.thumbnail}" class="thumbnail" alt="Video Thumbnail">
                <div>
                    <h3 class="text-lg font-bold">${video.title}</h3>
                    <p class="text-sm text-gray-400 flex items-center">
                        <img src="${video.creatorProfilePic}" class="profile-pic" alt="Profile">
                        <a href="channel.html?channelname=${video.creator}" class="ml-2 text-blue-500 hover:underline">${video.creator}</a>
                        <span class="verified ml-1">✔</span>
                    </p>
                    <p class="text-sm text-gray-400 mt-1">${video.description}</p>
                    <p class="text-sm text-gray-400 mt-1">${timeSince} ago</p>
                </div>
            `;
            videoList.appendChild(videoCard);
        });
    } catch (error) {
        console.error("Failed to load all videos:", error.message);
        alert("Failed to load all videos:" + error.message);
    }
}


function getTimeSince(timeDiff) {
    const seconds = Math.floor(timeDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) return `${seconds} seconds`;
    if (minutes < 60) return `${minutes} minutes`;
    if (hours < 24) return `${hours} hours`;
    if (days < 7) return `${days} days`;
    if (weeks < 4) return `${weeks} weeks`;
    if (months < 12) return `${months} months`;
    return `${years} years`;
}

// Event listener for search input
document.getElementById('searchInput').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        const searchQuery = event.target.value;
        window.location.href = `search.html?q=${encodeURIComponent(searchQuery)}`;
    }
});

// Event listener for search icon click
document.getElementById('searchIcon').addEventListener('click', function () {
    const searchQuery = document.getElementById('searchInput').value;
    window.location.href = `search.html?q=${encodeURIComponent(searchQuery)}`;
});

document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem("username");
    const userPhoto = localStorage.getItem("userPhoto");

    if (username && userPhoto) {
        document.getElementById("userProfile").innerHTML = 
            `<img src="${userPhoto}" class="profile-pic" alt="User Profile">`;
        document.getElementById("signupBtn").style.display = "none";
    } else {
        google.accounts.id.initialize({
            client_id: "889377554293-mlcl67svmcge0137up5blie5lqa8j2j5.apps.googleusercontent.com",
            callback: handleCredentialResponse
        });
        google.accounts.id.renderButton(
            document.getElementById("signupBtn"),
            { theme: "outline", size: "large" }
        );
        google.accounts.id.prompt();
    }

});

