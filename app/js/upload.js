const sharp = require('sharp');
const { ipcRenderer } = require('electron');
const AWS = require('aws-sdk');
const Store = require('electron-store');
const store = new Store();

var imgContentType = '';
var imgData = '';
var imgContainer = $('#img-container');
var fileName = $('#file-name');
var width = $('#width');
var height = $('#height');
var uploadForm = $('#upload-form');
var validationMessage = $('#validation-message');
var close = $('#close');

ipcRenderer.on('load-base64Data', (event, arg) => {
    resizeAndAppendImg(arg);
});

initAWS();

uploadForm.on('submit', function(e) {
    e.preventDefault();

    if (validate()) {
        var sharpWidth = parseInt(width.val());
        var sharpHeight = parseInt(height.val());
        var buffer = Buffer.from(imgData, 'base64');

        sharp(buffer)
            .resize(sharpWidth, sharpHeight)
            .toBuffer(function (err, resizedData, info) {
                if (err) {
                    console.log(err);
                }

                s3.upload({
                    Bucket: store.get('s3BucketName'),
                    Key: fileName.val(),
                    Body: resizedData,
                    ACL: 'public-read',
                    ContentType: imgContentType
                }, function (err, data) {
                    console.log(err, data);
                });
            });
    }
    else {
        validationMessage.html('Please complete all fields');
    }
});

close.on('click', function() {
    ipcRenderer.send('close-upload-window');
});

function resizeAndAppendImg(base64Data) {
    var meta = base64Data.split(',')[0];
    var data = base64Data.split(',')[1];
    imgContentType = meta.split(':')[1].split(';')[0];
    imgData = data;
    var buffer = Buffer.from(data, 'base64');

    sharp(buffer)
        .resize(50, 50)
        .toBuffer(function (err, resizedData, info) {
            if (err) {
                console.log(err);
            }

            var newImg = document.createElement('img');
            newImg.src = meta + ',' + new Buffer(resizedData).toString('base64');
            imgContainer.append(newImg);
        });
}

function validate() {
    if (
        fileName.val() &&
        width.val() &&
        height.val()
    ) {
        return true;
    }
    else {
        return false;
    }
}

function initAWS() {
    s3 = new AWS.S3({
        accessKeyId: store.get('awsAccessKeyId'),
        secretAccessKey: store.get('awsSecretAccessKey'),
        region: store.get('awsRegion')
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