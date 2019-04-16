/*
██ ███    ██ ██ ████████ ██  █████  ██      ██ ███████ ███████
██ ████   ██ ██    ██    ██ ██   ██ ██      ██    ███  ██
██ ██ ██  ██ ██    ██    ██ ███████ ██      ██   ███   █████
██ ██  ██ ██ ██    ██    ██ ██   ██ ██      ██  ███    ██
██ ██   ████ ██    ██    ██ ██   ██ ███████ ██ ███████ ███████
*/

$("#input-41").fileinput({
    showPreview: true,
    allowedFileExtensions: ["jpg", "jpeg", "gif", "png"],
    elErrorContainer: "#errorBlock"
});

$(document).ready( function() {
    $('.hidden-xs').click( function() {
        upload()
    });
});

var cv = document.getElementById('input-canvas')
cv.addEventListener('mousedown', activateDraw)
cv.addEventListener('touchstart', activateDraw)
cv.addEventListener('mousemove', draw)
cv.addEventListener('touchmove', draw)
cv.addEventListener('mouseup', deactivateDraw)
cv.addEventListener('mouseleave', deactivateDraw)
cv.addEventListener('touchend', deactivateDraw)

var drawing = false
var strokes = []
var ctxSketch = cv.getContext('2d');
var ctxCenter = document.getElementById('input-canvas-centercrop').getContext('2d')
var ctxScaled = document.getElementById('input-canvas-scaled').getContext('2d')
var ctxGraph = document.getElementById('myChart').getContext('2d')
var chart = new Chart(ctxGraph, {
    type: 'bar',
    data: {
        labels: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        datasets: [{
            label: 'ความน่าจะเป็น',
            backgroundColor: '#589FBF',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        }]
    },
    options: {
        responsive: false,
        scales: {
            yAxes: [{
                ticks: {
                    min: 0,
                    max: 1,
                },
            }],
        }
    }
});

/*
███    ███  ██████  ██████  ███████ ██
████  ████ ██    ██ ██   ██ ██      ██
██ ████ ██ ██    ██ ██   ██ █████   ██
██  ██  ██ ██    ██ ██   ██ ██      ██
██      ██  ██████  ██████  ███████ ███████
*/

var model = new KerasJS.Model({
    // load model
    filepaths: {
        model: 'backend/model/model.json',
        weights: 'backend/model/model_weights.buf',
        metadata: 'backend/model/model_metadata.json'
    },
    gpu: false
})

function Predict(input) {
    model.ready()
        .then(() => {
            var inputData = {
                input: input
            }
            // make predictions
            return model.predict(inputData)
        })
        .then(outputData => {
            var max = 0,
                out;
            var score = []
            for (var key in outputData.output) {
                score.push(outputData.output[key])
                if (outputData.output.hasOwnProperty(key) && outputData.output[key] > max) {
                    max = outputData.output[key];
                    out = key;
                }
            }
            // alert('ตอบ : ' + out);
            makeGraph(score)
        })
        .catch(err => {
            //console.log(err);
        })
}

/*
██████  ██████   █████  ██     ██
██   ██ ██   ██ ██   ██ ██     ██
██   ██ ██████  ███████ ██  █  ██
██   ██ ██   ██ ██   ██ ██ ███ ██
██████  ██   ██ ██   ██  ███ ███
*/

function activateDraw(e) {
    drawing = true;
    strokes.push([]);
    var points = strokes[strokes.length - 1]
    points.push(getLine(e))
}

function draw(e) {
    if (!drawing) return

    ctxSketch.lineWidth = 20
    ctxSketch.lineJoin = ctxSketch.lineCap = 'round'
    ctxSketch.strokeStyle = '#393E46'
    ctxSketch.clearRect(0, 0, ctxSketch.canvas.width, ctxSketch.canvas.height)
    var points = strokes[strokes.length - 1]
    points.push(getLine(e))
    // draw points in stroke
    for (var s = 0, slen = strokes.length; s < slen; s++) {
        points = strokes[s]
        var p1 = points[0]
        var p2 = points[1]
        ctxSketch.beginPath()
        ctxSketch.moveTo(...p1)
        for (var i = 1, len = points.length; i < len; i++) {
            // smooth line
            ctxSketch.quadraticCurveTo(...p1, ...getMidpoint(p1, p2))
            p1 = points[i]
            p2 = points[i + 1]
        }
        ctxSketch.lineTo(...p1)
        ctxSketch.stroke()
    }
}

function deactivateDraw(e) {
    if (!drawing) return
    drawing = false
    //load()
}


function clearCanvas() {
    ctxSketch.clearRect(0, 0, ctxSketch.canvas.width, ctxSketch.canvas.height)
    ctxCenter.clearRect(0, 0, ctxCenter.canvas.width, ctxCenter.canvas.height)
    ctxScaled.clearRect(0, 0, ctxScaled.canvas.width, ctxScaled.canvas.height)
    drawing = false
    strokes = []
    clearChart()
}


function getLine(e) {
    var {
        clientX,
        clientY
    } = e
    // for touch event
    if (e.touches && e.touches.length) {
        clientX = e.touches[0].clientX
        clientY = e.touches[0].clientY
    }
    var {
        left,
        top
    } = e.target.getBoundingClientRect()
    var [x, y] = [clientX - left, clientY - top]
    return [x, y]
}


function getMidpoint(p1, p2) {
    var [x1, y1] = p1
    var [x2, y2] = p2
    return [x1 + (x2 - x1) / 2, y1 + (y2 - y1) / 2]
}

function makeGraph(score) {
    chart.data.datasets[0].data = score;
    chart.update();
}

/*
███████ ███████ ████████ ██    ██ ██████
██      ██         ██    ██    ██ ██   ██
███████ █████      ██    ██    ██ ██████
     ██ ██         ██    ██    ██ ██
███████ ███████    ██     ██████  ██
*/

function load() {
    // center crop
    var imageDataCenterCrop = centerCrop(ctxSketch.getImageData(0, 0, ctxSketch.canvas.width, ctxSketch.canvas.height))
    ctxCenter.canvas.width = imageDataCenterCrop.width
    ctxCenter.canvas.height = imageDataCenterCrop.height
    ctxCenter.putImageData(imageDataCenterCrop, 0, 0)

    // scaled to 28 x 28
    ctxScaled.save()
    ctxScaled.scale(28 / ctxCenter.canvas.width, 28 / ctxCenter.canvas.height)
    ctxScaled.clearRect(0, 0, ctxCenter.canvas.width, ctxCenter.canvas.height)
    ctxScaled.drawImage(document.getElementById('input-canvas-centercrop'), 0, 0)
    var imageDataScaled = ctxScaled.getImageData(0, 0, ctxScaled.canvas.width, ctxScaled.canvas.height)
    ctxScaled.restore()

    // new format for model
    var {
        data
    } = imageDataScaled
    // console.log(data);
    var input = new Float32Array(784)
    for (var i = 0, len = data.length; i < len; i += 4) {
        input[i / 4] = data[i + 3] / 255
    }
    // console.log(input)
    Predict(input)
}

function centerCrop(imageData) {
    var {
        data,
        width,
        height
    } = imageData
    // console.log(imageData);
    var [xmin, ymin] = [width, height]
    var [xmax, ymax] = [-1, -1]
    for (var i = 0; i < width; i++) {
        for (var j = 0; j < height; j++) {
            var idx = i + j * width
            if (data[4 * idx + 3] > 0) {
                if (i < xmin) xmin = i
                if (i > xmax) xmax = i
                if (j < ymin) ymin = j
                if (j > ymax) ymax = j
            }
        }
    }

    // add a little padding
    xmin -= 55
    xmax += 55
    ymin -= 55
    ymax += 55

    // make bounding box
    var [widthNew, heightNew] = [xmax - xmin + 1, ymax - ymin + 1]
    if (widthNew < heightNew) {

        var halfBefore = Math.floor((heightNew - widthNew) / 2)
        var halfAfter = heightNew - widthNew - halfBefore
        xmax += halfAfter
        xmin -= halfBefore
    } else if (widthNew > heightNew) {

        var halfBefore = Math.floor((widthNew - heightNew) / 2)
        var halfAfter = widthNew - heightNew - halfBefore
        ymax += halfAfter
        ymin -= halfBefore
    }

    widthNew = xmax - xmin + 1
    heightNew = ymax - ymin + 1
    var dataNew = new Uint8ClampedArray(widthNew * heightNew * 4)
    for (var i = xmin; i <= xmax; i++) {
        for (var j = ymin; j <= ymax; j++) {
            if (i >= 0 && i < width && j >= 0 && j < height) {
                var idx = i + j * width
                var idxNew = i - xmin + (j - ymin) * widthNew
                dataNew[4 * idxNew + 3] = data[4 * idx + 3]
            }
        }
    }

    return new ImageData(dataNew, widthNew, heightNew)
}

/*
██    ██ ████████ ██ ██      ██ ████████ ██    ██
██    ██    ██    ██ ██      ██    ██     ██  ██
██    ██    ██    ██ ██      ██    ██      ████
██    ██    ██    ██ ██      ██    ██       ██
 ██████     ██    ██ ███████ ██    ██       ██
*/


function clearChart() {
    chart.data.datasets[0].data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    chart.update();
}


function upload() {
    // toggle
    document.getElementById('loader').style.display = 'block'
    document.getElementById('overlay').style.display = 'block'

    // read imgage
    var preview = document.querySelector('img')
    var file = document.querySelector('input[type=file]').files[0]
    var reader = new FileReader()
    var formData = new FormData()

    // sent data to app.py for calculate
    formData.append('image', file, 'test.jpeg')

    axios.post('http://localhost:5000', formData)
        .then(res => {
            const data = res.data
            // toggle
            document.getElementById('loader').style.display = 'none'
            document.getElementById('overlay').style.display = 'none'
            document.getElementById('pred').src = 'data:image/png;base64,' + data
            // popup modal
            popup()
            // document.getElementById('ball').id = 'ba';
            // console.log(data)
        })
        .catch(err => console.log(err))

    reader.onloadend = function() {
        preview.src = reader.result
    }

    if (file) {
        reader.readAsDataURL(file)
    } else {
        preview.src = ''
    }


}

function popup() {
    // display image
    var modal = document.getElementById('myModal');
    var img = document.getElementById('pred');
    var modalImg = document.getElementById('img01');

    modal.style.display = 'block';
    modalImg.src = img.src;

    var span = document.getElementsByClassName('close')[0];

    span.onclick = function() {
        modal.style.display = 'none';
    }
}
