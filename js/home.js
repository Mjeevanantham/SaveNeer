document.addEventListener("DOMContentLoaded", function () {


  let video = document.getElementById("video");
  let videoHolder = document.getElementById("video-holder");
  let startBtn = document.getElementById("start-stop");
  let volume = document.getElementById("volume");
  let muteControl = document.getElementById("mute-control");
  let volumeInput = document.getElementById("volume-level");
  let activeArea = document.getElementById("input-area");
  let inputThumn = document.getElementById("input-thumb");
  let line = document.getElementById("line");
  let hoveredLine = document.getElementById("hovered-line");
  let loadedLine = document.getElementById("loaded-line");
  let watchedLine = document.getElementById("watched-line");
  let watchedThumb = document.getElementById("watched-thumb");
  let screenBtn = document.getElementById("screen-btn");
  let isChanging = false;
  let fullscreen = false;

  function startVideo() {
    startBtn.classList.toggle("active");
    if (startBtn.classList.contains("active")) {
      video.play();
      videoHolder.classList.remove("stop");
    } else {
      video.pause();
      videoHolder.classList.add("stop");
    }
  }

  function setVolume(vol = 50) {

    lastVolume = video.volume;

    activeArea.style.width = `${Math.ceil(vol / 100 * volumeInput.clientWidth)}px`;
    inputThumn.style.left = `${Math.ceil(vol / 100 * (volumeInput.clientWidth - 8))}px`;

    video.volume = vol / 100;

    if (vol >= 50) {
      volume.classList.add("high");
      volume.classList.remove("low");
      volume.classList.remove("mute");
    } else if (vol < 50 && vol > 0) {
      volume.classList.remove("high");
      volume.classList.add("low");
      volume.classList.remove("mute");
    } else if (vol == 0) {
      volume.classList.remove("high");
      volume.classList.remove("low");
      volume.classList.add("mute");
    } else {
      volume.classList.remove("high");
      volume.classList.remove("low");
      volume.classList.add("mute");
    }
  }

  function mute() {
    if (volume.classList.contains("mute")) {
      volume.classList.remove("mute");
      video.volume = volumeInput.value / 100;
    } else {
      volume.classList.add("mute");
      video.volume = 0;
    }
  }

  function toggleFullScreen() {
    if (fullscreen) {
      if (video.webkitExitFullscreen) {
        video.webkitExitFullscreen();
      } else if (video.mozCancelFullscreen) { /* Safari */
        video.mozCancelFullscreen();
      } else if (video.exitFullscreen) { /* IE11 */
        video.exitFullscreen();
      }
    } else {
      if (video.requestFullscreen) {
        video.requestFullscreen();
      } else if (video.webkitRequestFullscreen) { /* Safari */
        video.webkitRequestFullscreen();
      } else if (video.msRequestFullscreen) { /* IE11 */
        video.msRequestFullscreen();
      }
    }
  }

  function setBuffer(buffer) {
    const percentage = (buffer / video.duration);
    loadedLine.style.width = `${percentage * line.clientWidth}px`;
    console.log(`percentage is ${percentage * 100}%`);
  }

  function updateWatched() {
    const duration = video.duration;
    if (duration > 0) {
      line.style.setProperty('--watched-width', `${(video.currentTime / duration) * line.clientWidth}px`);
    }
  }

  function setWatched(percent) {
    video.currentTime = percent * video.duration;
    updateWatched();
  }

  video.addEventListener("contextmenu", e => e.preventDefault());

  video.addEventListener("click", function (e) {
    startVideo();
  });
  startBtn.addEventListener("click", function (e) {
    startVideo();
  });

  volumeInput.addEventListener("input", function (e) {
    setVolume(this.value);
  });
  muteControl.addEventListener("click", function () {
    mute();
  });

  line.addEventListener("mousemove", function (e) {
    let { x } = line.getBoundingClientRect();
    hoveredLine.style.width = `${e.clientX - x}px`;
    if (e.buttons == 1 && e.button == 0) {
      let percentage = ((e.clientX - x) / line.clientWidth);
      setWatched(percentage);
    }
  });
  line.addEventListener("mouseleave", () => hoveredLine.style.width = "0");
  line.addEventListener("click", function (e) {
    let { x } = line.getBoundingClientRect();
    let percentage = ((e.clientX - x) / line.clientWidth);
    setWatched(percentage);
  });

  screenBtn.addEventListener("click", function (e) {
    toggleFullScreen();
  });

  video.addEventListener("fullscreenchange", function (e) {
    fullscreen = !fullscreen;
  });
  video.addEventListener("webkitfullscreenchange", function (e) {
    fullscreen = !fullscreen;
  });
  video.addEventListener("mozfullscreenchange", function (e) {
    fullscreen = !fullscreen;
  });

  window.addEventListener("keydown", function (e) {
    if (e.key == " " || e.key == "k" || e.key == "K" || e.key == "ن") {
      startVideo();
    } else if (e.key == "f" || e.key == "F" || e.key == "ب") {
      toggleFullScreen();
    } else if (e.key == "ArrowUp") {
      vol = Math.round(+video.volume * 100);
      if (vol < 100) {
        setVolume(vol + 5);
      }
    } else if (e.key == "ArrowDown") {
      vol = Math.round(+video.volume * 100);
      if (vol > 5) {
        setVolume(vol - 5);
      } else {
        setVolume(0);
      }
    } else if (e.key == "ArrowRight") {
      setWatched((+video.currentTime + 5) / video.duration);
    } else if (e.key == "ArrowLeft") {
      setWatched((+video.currentTime - 5) / video.duration);
    } else if (e.key == "l" || e.key == "L" || e.key == "م") {
      setWatched((+video.currentTime + 10) / video.duration);
    } else if (e.key == "j" || e.key == "J" || e.key == "ت") {
      setWatched((+video.currentTime - 10) / video.duration);
    } else if (parseInt(e.key) >= 0 && parseInt(e.key) <= 9) {
      setWatched(parseInt(e.key) / 10);
      console.log(video.duration);
      console.log(parseInt(e.key) / 10);
    }
  });

  video.addEventListener("progress", () => {

    console.log("video progressing");

    if (video.duration > 0) {
      for (let i = 0; i < video.buffered.length; i++) {// search for last downloaded buffere and get its end() 
        if (video.buffered.start(video.buffered.length - 1 - i) < video.currentTime) {
          setBuffer(video.buffered.end(video.buffered.length - 1 - i));
          break;
        }
      }
    }

  });

  video.addEventListener("timeupdate", () => {
    updateWatched();
  });

  window.onload = function () {

    setVolume(60);
    console.log("window loaded");

  }















  // const apiKey = 'ab62faa0a18a4a05a831fb2fde0a9105';
  const apiUrl = `https://newsapi.org/v2/everything?q=water&sortBy=publishedAt&apiKey=${apiKey}`;

  let articlesLoaded = 0; // Track the number of articles loaded
  const articlesPerPage = 10; // Number of articles to load per page

  const loadMoreButton = document.getElementById('show-more-btn');
  loadMoreButton.addEventListener('click', loadMoreArticles);

  function loadMoreArticles() {
    fetch(`${apiUrl}&pageSize=${articlesPerPage}&page=${Math.ceil((articlesLoaded + 1) / articlesPerPage)}`)
      .then(response => response.json())
      .then(data => {
        const newsContainer = document.getElementById('news-container');
        data.articles.forEach(article => {
          const articleCard = document.createElement('div');
          articleCard.classList.add('card');
          articleCard.style.opacity = '0';
          articleCard.innerHTML = `
                    <img src="${article.urlToImage}" alt="${article.title}" loading="lazy">
                    <div class="card-content">
                        <h2>${article.title}</h2>
                        <p>${article.description}</p>
                        <a href="${article.url}" target="_blank">Read More</a>
                    </div>
                `;
          newsContainer.appendChild(articleCard);

          // Lazy load news articles using Intersection Observer
          const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                observer.unobserve(entry.target);
              }
            });
          });
          observer.observe(articleCard);
        });
        articlesLoaded += data.articles.length;
        if (articlesLoaded >= data.totalResults) {
          loadMoreButton.style.display = 'none'; // Hide the button if all articles are loaded
        }
      })
      .catch(error => {
        console.error('Error fetching news:', error);
      });
  }


  // Initial loading of articles
  loadMoreArticles();



});
