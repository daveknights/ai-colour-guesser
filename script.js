const network = new brain.NeuralNetwork();
const width = 320;
const guessResult = document.getElementById('guess-result');
const guess = document.getElementById('guess');
let height = 0;
let streaming = false;
let video = null;
let canvas = null;
let photo = null;
let photoButton = null;

network.train([
    {input: {r:1.0,g:0.0,b:0.0}, output:{Red: 1}},
    {input: {r:0.5,g:0.0,b:0.0}, output:{Red: 1}},
    {input: {r:1.0,g:1.0,b:0.0}, output:{yellow: 1}},
    {input: {r:0.7,g:0.5,b:0.0}, output:{yellow: 1}},
    {input: {r:0.0,g:1.0,b:0.0}, output:{Green: 1}},
    {input: {r:0.1,g:0.5,b:0.1}, output:{Green: 1}},
    {input: {r:0.0,g:0.0,b:1.0}, output:{Blue: 1}},
    {input: {r:0.0,g:0.0,b:0.5}, output:{Blue: 1}},
    {input: {r:1.0,g:0.0,b:1.0}, output:{Pink: 1}},
    {input: {r:0.5,g:0.0,b:0.5}, output:{Pink: 1}},
    {input: {r:0.5,g:0.5,b:0.5}, output:{Grey: 1}},
    {input: {r:0.1,g:0.1,b:0.1}, output:{Grey: 1}},
]);

function convertNumber(num) {
    return (num / 255).toFixed(1);
}

function getColour() {
    checkPhotoLoaded().then(img => {
        const colorThief = new ColorThief();
        const dominantColour = colorThief.getColor(img);
        const colorObj = {
            r: convertNumber(dominantColour[0]),
            g: convertNumber(dominantColour[1]),
            b: convertNumber(dominantColour[2])
        };
        const result = brain.likely(colorObj, network);

        guess.textContent = `I guess this is ${result}`;
        guessResult.classList.add('border');
    });
}

function checkPhotoLoaded() {
    const img = document.querySelector('img');

    return new Promise(resolve => {
        img.addEventListener('load', () => resolve(img));
    });
}

function takepicture() {
    const context = canvas.getContext('2d');

    canvas.width = width;
    canvas.height = height;
    context.drawImage(video, 0, 0, width, height);

    const data = canvas.toDataURL('image/png');
    photo.setAttribute('src', data);

    getColour();
}

function startup() {
    video = document.getElementById('video');
    canvas = document.getElementById('canvas');
    photo = document.getElementById('photo');
    photoButton = document.getElementById('take-photo');

    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(function(stream) {
            video.srcObject = stream;
            video.play();
        })
        .catch(function(err) {
            console.log("An error occurred: " + err);
        });

    video.addEventListener('canplay', function(ev){
        if (!streaming) {
            height = video.videoHeight / (video.videoWidth/width);

            video.setAttribute('width', width);
            video.setAttribute('height', height);
            canvas.setAttribute('width', width);
            canvas.setAttribute('height', height);
            streaming = true;
        }
    }, false);

    photoButton.addEventListener('click', function(ev){
        takepicture();
        ev.preventDefault();
    }, false);
}

function init() {
    if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
        startup();
    } else {
        document.querySelector('h1').textContent = 'No camera found for this device';
    }
}

window.addEventListener('load', function(){
    init();
});
