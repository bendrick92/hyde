const sharp = require('sharp');
const { ipcRenderer } = require('electron');

ipcRenderer.on('load-base64Data', (event, arg) => {
    resizeAndAppendImg(arg);
});

function resizeAndAppendImg(base64Data) {
    var meta = base64Data.split(',')[0];
    var data = base64Data.split(',')[1];
    var buffer = Buffer.from(data, 'base64');

    sharp(buffer)
        .resize(50, 50)
        .toBuffer(function (err, data, info) {
            if (err) {
                console.log(err);
            }

            var newImg = document.createElement('img');
            newImg.src = meta + ',' + new Buffer(data).toString('base64');
            document.body.appendChild(newImg);
        });
}

// For reference, the old resize function from the context menu */
/*
var img = document.createElement('img');
img.src = store.get(s3DomainName) + '/' + store.get(s3BucketName) + '/' + objPath;
img.id = 'temp-img';
img.style.display = 'none';
document.body.append(img);

var can = document.createElement('canvas');
can.width = img.width;
can.height = img.height;
can.id = 'temp-canvas';
can.style.display = 'none';
document.body.append(can);

var canvas = document.getElementById('temp-canvas');
var ctx = canvas.getContext('2d');
var image = document.getElementById('temp-img');
ctx.drawImage(image, 10, 10);

var base64Data = canvas.toDataURL();
*/