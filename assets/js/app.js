let playBtn = document.getElementById('play-btn');
let slider = document.getElementById("volume-slider");
let progressFill = document.getElementById("progress-fill");
let progressContainer = document.getElementById("progress-container");
let currentTimeEl = document.getElementById("current-time");
let durationEl = document.getElementById("duration");
let nextBtn = document.getElementById('next-btn');
let prevBtn = document.getElementById('prev-btn');
let playIcon = playBtn.querySelector('i');
let shuffleBtn = document.getElementById('shuffle-btn');
let repeatBtn = document.getElementById('repeat-btn');
let selectList = Array.from(document.getElementsByClassName('list-group-item'));
let header = document.querySelector('.playlist-header');
let activeAudio = getActiveAudio();
let isShuffle = false ; 
let isRepeat = false;


// Event Listeners ==============================================================
nextBtn.addEventListener('click', nextMusic);

prevBtn.addEventListener('click', prevMusic);

shuffleBtn.addEventListener('click', shuffleMusic);

repeatBtn.addEventListener('click', repeatMusic);

playBtn.addEventListener('click', playMusic);

slider.addEventListener("input", updateVolume);

selectList.forEach((music, index) => {
    music.addEventListener('click', () => selectMusic(index));

    let audio = music.querySelector('audio')
    audio.addEventListener('ended', () => {
        if (isRepeat) {
            audio.currentTime = 0;
            audio.play();
        } else {
            nextMusic();
        }
    })

});

progressContainer.addEventListener("click", (e) => {
    let activeAudio = getActiveAudio();
    if (!activeAudio) return;

    const width = progressContainer.clientWidth;
    const clickX = e.offsetX;
    const duration = activeAudio.duration;

    activeAudio.currentTime = (clickX / width) * duration;
});

activeAudio.addEventListener("loadedmetadata", () => {
    durationEl.textContent = formatTime(activeAudio.duration);
});

header.querySelector('span').innerHTML = selectList.length + " Tracks ";

// functions ===================================================================
function selectMusic(index) {
    selectList.forEach((element, i) => {
        let audio = element.querySelector('audio');

        if (i === index) {
            element.classList.add("active");
            audio.setAttribute("data-selected", "true");
            document.getElementById('track-title').innerHTML = selectList[index].querySelector('h6').textContent;
            document.getElementById('track-artist').innerHTML = selectList[index].querySelector('small').textContent;
            document.getElementById('cover-art-container').querySelector('img').src = selectList[index].querySelector('img').src;
            durationEl.textContent = formatTime(audio.duration);
            setTimeout(() => {
                playMusic();
            }, 5)
        } else {
            element.classList.remove("active");
            audio.setAttribute("data-selected", "false");
            audio.pause();
            audio.currentTime = 0;
            playIcon.classList.replace('fa-pause', 'fa-play');
        }
    })
}

function playMusic() {
    let musicList = getActiveAudio();

    if (!musicList) return;

    if (playIcon.classList.contains('fa-play')) {
        musicList.play();
        playIcon.classList.replace('fa-play', 'fa-pause');
        startTimerInterval();
    } else {
        musicList.pause();
        playIcon.classList.replace('fa-pause', 'fa-play');
    }
}

function updateVolume() {
    const value = slider.value;
    const max = slider.max;
    const percent = (value / max) * 100;

    slider.style.background = `
    linear-gradient(to right,
      #6504c0d5 0%,
      #4f0099 ${percent}%,
      #bebebe ${percent}%,
      #929292 100%)
  `;

    selectList.forEach((element, i) => {
        let audio = element.querySelector('audio');
        audio.volume = percent / 100;
    })
}

function getActiveAudio() {
    return document.querySelector('audio[data-selected="true"]');
}

function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

function attachTimeUpdate(audio) {
    audio.addEventListener("timeupdate", () => {
        const percent = (audio.currentTime / audio.duration) * 100;
        progressFill.style.width = percent + "%";
        currentTimeEl.textContent = formatTime(audio.currentTime);
    });
}

function nextMusic() {
    let currentIndex = selectList.findIndex(item =>
        item.classList.contains("active")
    )

    if (currentIndex === -1) return;

    let nextIndex;

    if (!isShuffle) {
        nextIndex = (currentIndex + 1) % selectList.length;
    } else {
        do {
            nextIndex = Math.floor(Math.random() * selectList.length);
        } while (nextIndex === currentIndex);
    }

    selectMusic(nextIndex);
}

function prevMusic() {

    let currentIndex = selectList.findIndex(item =>
        item.classList.contains("active")
    )

    if (currentIndex === -1) return;

    let prevIndex = currentIndex - 1;

    if (currentIndex - 1 < 0) {
        prevIndex = selectList.length - 1;
    }

    selectMusic(prevIndex);
}

function shuffleMusic() {
    isShuffle = !isShuffle;
    shuffleBtn.classList.toggle("active");
}

function repeatMusic() {
    isRepeat = !isRepeat;
    repeatBtn.classList.toggle("active");
}

function startTimerInterval() {
    timerInterval = setInterval(() => {

        let activeAudio = getActiveAudio();
        if (!activeAudio || activeAudio.paused) {
            clearInterval(timerInterval);
            return;
        }

        const percent = (activeAudio.currentTime / activeAudio.duration) * 100;
        progressFill.style.width = percent + "%";

        currentTimeEl.textContent = formatTime(activeAudio.currentTime);
    }, 500);
}

// =============================================================================
attachTimeUpdate(activeAudio);
updateVolume();