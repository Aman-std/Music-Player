console.log("lets start the js..");

let currentSong = new Audio()
let songs;
let currfolder;

function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSong(folder) {
    currfolder = folder;
    let a = await fetch(`./${folder}`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    songs = []
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3") && !element.href.endsWith(".json")) {
            let decoded = decodeURIComponent(element.href)   // %5C becomes \
            let parts = decoded.split(/[\\/]/).filter(Boolean)
            songs.push(parts[parts.length - 1])
        }
    }

    //adding song to library
    let songUl = document.querySelector(".songplaylist ul")
    songUl.innerHTML = ""
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `<li><img class="invert" width="34" src="images/music.svg" alt="">
                            <div class="song-info">
                                <div> ${song}</div>
                                <div>Aman</div>
                            </div>
                            <div class="playnow ">
                                <span>Play Now</span>
                                <img class="invert" src="images/play.svg " alt="">
                            </div> </li>`
    }

    //Attach a event listner for all song
    Array.from(document.querySelector(".songplaylist").getElementsByTagName("li"), (e) => {
        e.addEventListener("click", () => {
            playsong(e.querySelector(".song-info div").innerHTML.trim())
        })
    })

    return songs;
}

function playsong(track, pause = false) {
    currentSong.src = `/${currfolder}/${track}`
    if (!pause) {
        currentSong.play()
        play.src = "images/pause.svg"
    }
    document.querySelector(".song-info12").innerHTML = `${track}`
    document.querySelector(".song-time").innerHTML = "00:00/00:00"

}

async function displayAlbum() {
    let a = await fetch(`./songs`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    Array.from(div.getElementsByTagName("a")).forEach(async e => {
        // console.log(e)
        let album = document.querySelector(".playlist")

        if (e.href.includes('songs') && !e.href.includes('.json')) {
            let decoded = decodeURIComponent(e.href)
            let parts = decoded.split(/[\\/]/).filter(Boolean)
            let folder = parts[parts.length - 1]

            //get info of the folder
            let info1 = await fetch(`/songs/${folder}/info.json`)
            info = await info1.json()
            // console.log(info)
            //adding card in html file
            album.innerHTML = album.innerHTML + `<div data-folder="${folder}" ="" class="card">
                    <img class="playbtn"  src="images/playbtn.svg" alt="image">
                    <img class="song-image" src="/songs/${folder}/cover.png"
                        alt="image">
                    <span class=""><strong>${info.title}</strong></span>
                    <span>
                        <p>${info["desc"]}</p>
                    </span>
                </div>`
        }

        //adding listner to card to get the folder
        Array.from(document.getElementsByClassName("card")).forEach(e => {
            // console.log("This is card", e)
            e.addEventListener("click", async item => {
                // console.log(item.currentTarget.dataset)
                songs = await getSong(`songs/${item.currentTarget.dataset.folder}`)
                playsong(songs[0])
            })
        });
    })
    return
}

async function main() {
    // gets the list of all song 
    await getSong('songs/ncs')
    playsong(songs[0], true)

    //get the playlist folder
    displayAlbum();

    //Attach a event listner for all song
    Array.from(document.querySelector(".songplaylist").getElementsByTagName("li"), (e) => {
        e.addEventListener("click", () => {
            playsong(e.querySelector(".song-info div").innerHTML.trim())
        })
    })

    //Attach event listner for next,previous and play
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "images/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "images/play.svg"
        }
    })

    //Listen time update event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".song-time").innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`

        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })

    //adding event listner to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = currentSong.duration * percent / 100
    })

    //add a event listner to previous
    previous.addEventListener('click', () => {
        console.log("previous was clicked")
        let index = songs.indexOf(currentSong.src.split(`/${currfolder}/`)[1])
        if ((index - 1) >= 0) {
            playsong(songs[index + 1])
        }

    })

    //add a event listner to next
    next.addEventListener('click', () => {
        console.log("next was clicked")
        // console.log("current song is: ",currentSong.src.split(`/${currfolder}/`)[1]);
        let index = songs.indexOf(currentSong.src.split(`/${currfolder}/`)[1])
        if ((index + 1) < songs.length) {
            playsong(songs[index + 1])
        }
    })

    //add event listner to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to :", e.target.value);

        currentSong.volume = parseInt(e.target.value) / 100
        let em = document.querySelector(".volume img")
        if(em.src.includes("mute")){
        em.src = em.src.replace("images/mute.svg", "images/volume.svg")
        }
        if(e.target.value == 0){
            em.src = em.src.replace( "images/volume.svg","images/mute.svg")
        }
    })

    //adding event listner to mute the volume
    document.querySelector(".volume img").addEventListener("click", e => {
        if (e.target.src.includes("images/volume.svg")) {
            e.target.src = e.target.src.replace("images/volume.svg", "images/mute.svg")
            currentSong.volume = 0
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }
        else {
            e.target.src = e.target.src.replace("images/mute.svg", "images/volume.svg")
            currentSong.volume = 0.1
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10
        }
    })

    //adding event listner on hamburger for nav
    document.querySelector('.hamburger').addEventListener("click", e => {
        console.log(e.target.src)
        if (e.target.src.includes("hamburger")) {
            e.target.src = "images/cross.svg"
            document.querySelector(".leftPart").style.right = "9px"
        }
        else {
            e.target.src = "images/hamburger.svg"
            document.querySelector(".leftPart").style.right = "-150px"
        }
    })

    //adding event listner for the left sidbar slide
    document.querySelector('.ham-left img').addEventListener("click", e => {
        document.querySelector(".left").style.left = 0
    })
    document.querySelector(".close-left").addEventListener("click", e => {
        document.querySelector(".left").style.left = 100 + "%"
    })
}

main()
