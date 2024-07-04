document.addEventListener("DOMContentLoaded", function() {
    const muchachos = document.getElementById('muchachos');
    const playMute = document.getElementById('playMute');
    const playImage = 'https://i.ibb.co/9bRNYX8/sonido.png'; // Ruta de la imagen para reproducir
    const pauseImage = 'https://i.ibb.co/YTzKpjc/mute.png'; // Ruta de la imagen para pausar

    playMute.addEventListener('click', toggleMusic);

    function toggleMusic() {
        if (muchachos.paused) {
            muchachos.play();
            playMute.querySelector('img').src = pauseImage;
        } else {
            muchachos.pause();
            playMute.querySelector('img').src = playImage;
        }
    }

    // Slideshow
    let slideIndex = 0;
    const slides = document.getElementsByClassName("slides");

    function showSlides() {
        for (let i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";
        }
        slideIndex++;
        if (slideIndex > slides.length) {
            slideIndex = 1;
        }
        slides[slideIndex - 1].style.display = "block";
        setTimeout(showSlides, 2000);
    }

    showSlides();
});
