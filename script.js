let currentSong = new Audio();
let songs = [];
let currFolder;

function formatTime(seconds) {
    seconds = Math.floor(seconds);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = remainingSeconds.toString().padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    try {
        const response = await fetch(`/${currFolder}/`);
        const text = await response.text();
        const div = document.createElement('div');
        div.innerHTML = text;
        const links = div.getElementsByTagName('a');
        songs = [];

        for (let link of links) {
            if (link.href.endsWith('.mp3')) {
                songs.push(link.href.split(`/${folder}/`)[1]);
            }
        }

        const songUL = document.querySelector('.songList ul');
        songUL.innerHTML = '';
        for (const song of songs) {
            songUL.innerHTML += `<li>
                <img src="img/music.svg" alt="Music Icon" style="width: 50px;">
                <div class="info">
                    <div>${song.replaceAll('%20', ' ').split(' - ')[0]}</div>
                    <div class="artistName">${song.replaceAll('%20', ' ').split(' - ')[1].replace('.mp3', '')}</div>
                </div>
            </li>`;
        }

        Array.from(document.querySelector('.songList').getElementsByTagName('li')).forEach(e => {
            e.addEventListener('click', () => {
                playSongs(`${e.querySelector('.info').firstElementChild.innerHTML.trim()} - ${e.querySelector('.info').lastElementChild.innerHTML.trim()}.mp3`);
            });
        });

        return songs;
    } catch (error) {
        console.error('Error fetching songs:', error);
    }
}

const playSongs = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        document.getElementById('play').src = 'img/pause.svg';
    }
    document.querySelector('.songName').innerHTML = decodeURI(track).split(' - ')[0];
    document.querySelector('.artistName2').innerHTML = decodeURI(track).split(' - ')[1].replace('.mp3', '');
};

async function displayAlbums() {
    try {
        const response = await fetch('/songs/');
        const text = await response.text();
        const div = document.createElement('div');
        div.innerHTML = text;
        const anchors = div.getElementsByTagName('a');
        const cardContainer = document.querySelector('.cardContainer');

        for (let anchor of anchors) {
            if (anchor.href.includes('/songs') && !anchor.href.includes('.htaccess')) {
                const folder = anchor.href.split('/').slice(-2)[0];
                const responseJson = await (await fetch(`/songs/old/info.json`)).json();
        //         cardContainer.innerHTML += `<div data-folder=old class="card">
        //     <svg
        //       height="100"
        //       viewBox="0 0 100 100"
        //       width="100"
        //       xmlns="http://www.w3.org/2000/svg"
        //     >
        //       <circle cx="50" cy="50" fill="#1fdf64" r="50" />
        //       <polygon fill="black" points="35,25 35,75 75,50" />
        //     </svg>
        //     <img  alt="Cover photo" src="/songs/old/Cover.jpeg" />
        //     <h3>Old Hits</h3>
        //     <p>Babbu Maan, Wazir, Diljit Dosanjh</p>
        //   </div>`;
            }
        }

        Array.from(document.getElementsByClassName('card')).forEach(e => {
            e.addEventListener('click', async (item) => {
                const folder = item.currentTarget.dataset.folder;
                songs = await getSongs(`songs/${folder}`);
                playSongs(songs[0]);
            });
        });
    } catch (error) {
        console.error('Error displaying albums:', error);
    }
}

async function main() {
    await getSongs('songs/old');
    playSongs(songs[0], true);
    await displayAlbums();

    document.getElementById('play').addEventListener('click', () => {
        if (currentSong.paused) {
            currentSong.play();
            document.getElementById('play').src = 'img/pause.svg';
        } else {
            currentSong.pause();
            document.getElementById('play').src = 'img/play.svg';
        }
    });

    currentSong.addEventListener('timeupdate', () => {
        document.querySelector('.songTime').innerHTML = formatTime(currentSong.currentTime);
        document.querySelector('.songDuration').innerHTML = formatTime(currentSong.duration);
        document.querySelector('.circle').style.left = (currentSong.currentTime / currentSong.duration) * 100 + '%';
    });

    document.querySelector('.seekbar').addEventListener('click', (e) => {
        const percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector('.circle').style.left = percent + '%';
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    document.querySelector('.hamburger').addEventListener('click', () => {
        document.querySelector('.left').style.left = '0';
    });

    document.querySelector('.cross').addEventListener('click', () => {
        document.querySelector('.left').style.left = '-120%';
    });

    document.getElementById('previous').addEventListener('click', () => {
        const index = songs.indexOf(currentSong.src.split('/').slice(-1)[0]);
        if (index > 0) {
            playSongs(songs[index - 1]);
        }
    });

    document.getElementById('next').addEventListener('click', () => {
        const index = songs.indexOf(currentSong.src.split('/').slice(-1)[0]);
        if (index < songs.length - 1) {
            playSongs(songs[index + 1]);
        }
    });
    
    document.querySelector(".range input").addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        const volumeIcon = document.getElementById('volumeIcon');
        if (currentSong.volume === 0) {
            volumeIcon.src = 'img/mute.svg';
        } else {
            volumeIcon.src = 'img/volume.svg';
        }
    });

    document.getElementById('volumeIcon').addEventListener('click', (e) => {
        const volumeIcon = e.target;
        if (volumeIcon.src.includes('volume.svg')) {
            volumeIcon.src = 'img/mute.svg';
            currentSong.volume = 0;
            document.querySelector('.range input').value = 0;
        } else {
            volumeIcon.src = 'img/volume.svg';
            currentSong.volume = 0.1; // Set to a reasonable default volume level when unmuting
            document.querySelector('.range input').value = 10;
        }
    });

    
}

document.addEventListener('DOMContentLoaded', main);
