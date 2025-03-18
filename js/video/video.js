const video = document.getElementById("videoPlayer");
const playPauseBtn = document.getElementById("playPauseBtn");
const progressBar = document.getElementById("progressBar");
const progressBarInner = document.getElementById("progressBarInner");
const progressBarPreview = document.getElementById("progressBarPreview");
const previewImage = document.getElementById("previewImage");
const videoDuration = document.getElementById("videoDuration");
const likeBtn = document.getElementById("likeBtn");
const dislikeBtn = document.getElementById("dislikeBtn");
const subscribeBtn = document.getElementById("subscribeBtn");
const downloadBtn = document.getElementById("downloadBtn");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const settingsBtn = document.getElementById("settingsBtn");
const settingsMenu = document.getElementById("settingsMenu");
const playbackSpeed = document.getElementById("playbackSpeed");
const statsForNerdsBtn = document.getElementById("statsForNerdsBtn");
const captionsBtn = document.getElementById("captionsBtn");
const progressDot = document.getElementById("progressDot");

let likeCount = 0;
let dislikeCount = 0;

// Fetch Video Data
async function getVideoData(videoId) {
    const response = await fetch(`https://vidnestapi.netlify.app/api/getVideoData?id=${videoId}`);
    if (response.ok) {
        const videoData = await response.json();

        // Set video details
        video.src = videoData.video;
        document.getElementById("videoTitle").textContent = videoData.title;
        document.getElementById("videoDescription").textContent = videoData.description;

        // Set Channel details
        const channelResponse = await fetch(`https://vidnestapi.netlify.app/api/getChannelData?channelname=${videoData.creator}`);
        const channelData = await channelResponse.json();
        document.getElementById("channelName").textContent = channelData.channelname;
        document.getElementById("channelProfilePic").src = channelData.profilepicture;
        document.getElementById("channelNameLink").href = `./channel.html?channelname=${channelData.channelname}`;

        // Set initial like and dislike counts
        likeCount = videoData.likes || 0;
        dislikeCount = videoData.dislikes || 0;
        document.getElementById('likeCount').textContent = likeCount;
        document.getElementById('dislikeCount').textContent = dislikeCount;

        // Fetch and display recommended videos
        getRecommendedVideos(videoId);

        // Display comments
        displayComments(videoData.comments);
    } else {
        console.log("Error: Video data not found");
    }
}

// Display comments
function displayComments(comments) {
    const commentsContainer = document.getElementById('comments');
    commentsContainer.innerHTML = '';
    for (const [commentId, comment] of Object.entries(comments)) {
        const commentElement = document.createElement('div');
        commentElement.classList.add('comment');
        commentElement.innerHTML = `
            <img src="${comment.creatorprofile}" alt="Profile Pic" class="comment-profile-pic">
            <div class="comment-content">
                <p class="comment-author">${comment.creatorname}</p>
                <p class="comment-message">${comment.message}</p>
                <div class="comment-actions">
                    <button class="comment-like-btn">👍 ${comment.likes}</button>
                    <button class="comment-dislike-btn">👎 ${comment.dislikes}</button>
                    <span class="comment-date">${new Date(comment.dateCreated).toLocaleString()}</span>
                </div>
            </div>
        `;
        commentsContainer.appendChild(commentElement);
    }
}

// Handle comment submission
const commentForm = document.getElementById('commentForm');
const commentMessage = document.getElementById('commentMessage');
const commentCreatorName = document.getElementById('commentCreatorName');
const commentCreatorProfile = document.getElementById('commentCreatorProfile');

commentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const message = commentMessage.value;
    const creatorName = commentCreatorName.value;
    const creatorProfile = commentCreatorProfile.value;

    const commentData = {
        videoId,
        message,
        creatorName,
        creatorProfile
    };

    const response = await fetch('https://vidnestapi.netlify.app/api/newComment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(commentData)
    });

    if (response.ok) {
        const { commentId, comment } = await response.json();
        addCommentToDOM(commentId, comment);
        commentForm.reset();
    } else {
        console.error('Error posting comment:', await response.json());
    }
});

// Add a new comment to the DOM
function addCommentToDOM(commentId, comment) {
    const commentsContainer = document.getElementById('comments');
    const commentElement = document.createElement('div');
    commentElement.classList.add('comment');
    commentElement.innerHTML = `
        <img src="${comment.creatorprofile}" alt="Profile Pic" class="comment-profile-pic">
        <div class="comment-content">
            <p class="comment-author">${comment.creatorname}</p>
            <p class="comment-message">${comment.message}</p>
            <div class="comment-actions">
                <button class="comment-like-btn">👍 ${comment.likes}</button>
                <button class="comment-dislike-btn">👎 ${comment.dislikes}</button>
                <span class="comment-date">${new Date(comment.dateCreated).toLocaleString()}</span>
            </div>
        </div>
    `;
    commentsContainer.appendChild(commentElement);
}

// Get recommended videos
async function getRecommendedVideos(currentVideoId) {
    const response = await fetch('https://vidnestapi.netlify.app/api/getVideoData?getallvideos=true');
    if (response.ok) {
        const videos = await response.json();

        // Filter out the current video and randomize the rest
        const filteredVideos = videos.filter(video => video.id !== currentVideoId);
        const shuffledVideos = filteredVideos.sort(() => 0.5 - Math.random());
        const recommendedVideos = shuffledVideos.slice(0, 16);

        const recommendedVideosContainer = document.getElementById('recommendedVideos');
        recommendedVideosContainer.innerHTML = '';

        recommendedVideos.forEach(video => {
            const videoCard = document.createElement('a');
            videoCard.href = `video.html?id=${video.id}`;
            videoCard.classList.add('recommended-video-card');
            videoCard.innerHTML = `
                <img src="${video.thumbnail}" alt="Thumbnail">
                <div>
                    <h4>${video.title}</h4>
                    <p>${video.creator}</p>
                </div>
            `;
            recommendedVideosContainer.appendChild(videoCard);
        });
    } else {
        console.log("Error: Failed to fetch recommended videos");
    }
}
// Play/Pause toggle
playPauseBtn.addEventListener("click", () => {
    if (video.paused) {
        video.play();
        playPauseBtn.innerHTML = "<span class='material-icons'>pause</span>";
    } else {
        video.pause();
        playPauseBtn.innerHTML = "<span class='material-icons'>play_arrow</span>";
    }
});

// Update Progress Bar and Duration
video.addEventListener("timeupdate", () => {
    const progress = (video.currentTime / video.duration) * 100;
    progressBarInner.style.width = `${progress}%`;
    progressDot.style.left = `calc(${progress}% - 4px)`; // This centers the dot

    // Update video duration and current time display
    videoDuration.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
});

// Format time (e.g., 3:25 from 205 seconds)
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secondsRemaining = Math.floor(seconds % 60);
    return `${minutes}:${secondsRemaining < 10 ? "0" + secondsRemaining : secondsRemaining}`;
}

// Handle progress bar click
progressBar.addEventListener("click", (e) => {
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / progressBar.offsetWidth) * video.duration;
    video.currentTime = newTime;
});

// Show/hide settings menu
settingsBtn.addEventListener("click", () => {
    settingsMenu.style.display = settingsMenu.style.display === "none" ? "block" : "none";
});

// Change playback speed
playbackSpeed.addEventListener("change", () => {
    video.playbackRate = parseFloat(playbackSpeed.value);
});

// Show stats for nerds
statsForNerdsBtn.addEventListener("click", () => {
    alert(`Stats for nerds: Duration: ${video.duration}, Current Time: ${video.currentTime}`);
});

// Handle captions
captionsBtn.addEventListener("click", () => {
    alert("Captions feature is under development.");
});

// Like/Dislike Counter with API Update
likeBtn.addEventListener('click', async () => {
    const likeToggled = likeBtn.classList.toggle('liked');
    likeCount = likeToggled ? likeCount + 1 : likeCount - 1;
    document.getElementById('likeCount').textContent = likeCount;

    // Update like count in the backend
    await fetch(`https://vidnestapi.netlify.app/api/updateVideoLikes?id=${videoId}&likes=${likeCount}`, { method: 'POST' });
});

dislikeBtn.addEventListener('click', async () => {
    const dislikeToggled = dislikeBtn.classList.toggle('disliked');
    dislikeCount = dislikeToggled ? dislikeCount + 1 : dislikeCount - 1;
    document.getElementById('dislikeCount').textContent = dislikeCount;

    // Update dislike count in the backend
    await fetch(`https://vidnestapi.netlify.app/api/updateVideoDislikes?id=${videoId}&dislikes=${dislikeCount}`, { method: 'POST' });
});

// Subscribe Counter
let subCount = 0;

subscribeBtn.addEventListener('click', () => {
    subCount = subscribeBtn.classList.toggle('subscribed') ? subCount + 1 : subCount - 1;
    document.getElementById('subCount').textContent = subCount;
});

// Download Button
downloadBtn.addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = video.src;
    a.download = 'video.mp4';
    a.click();
});

// Fullscreen toggle
fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        video.requestFullscreen();
        fullscreenBtn.innerHTML = `<span class="material-icons">fullscreen_exit</span>`;
    } else {
        document.exitFullscreen();
        fullscreenBtn.innerHTML = `<span class="material-icons">fullscreen</span>`;
    }
});

// Get video ID from URL and fetch video data
const urlParams = new URLSearchParams(window.location.search);
const videoId = urlParams.get('id'); // Get the videoid from the URL

if (videoId) {
    // Call the function to load video data based on videoId
    getVideoData(videoId);
} else {
    alert('Video ID not provided');
}
