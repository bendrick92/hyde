const sharp = require('sharp');
const { ipcRenderer } = require('electron');
const AWS = require('aws-sdk');
const Store = require('electron-store');
const store = new Store();

var imgMeta = '';
var imgContentType = '';
var imgData = '';
var imgContainer = $('#img-container');
var fileNameInput = $('#file-name');
var widthInput = $('#width');
var heightInput = $('#height');
var uploadForm = $('#upload-form');
var validationMessage = $('#validation-message');
var preview = $('#preview');
var cancel = $('#cancel');

ipcRenderer.on('load-base64Data', (event, arg) => {
    init(arg.base64Data, arg.fileName, arg.path);
});

initAWS();

uploadForm.on('submit', function(e) {
    e.preventDefault();

    if (validate()) {
        var sharpWidth = parseInt(widthInput.val());
        var sharpHeight = parseInt(heightInput.val());
        var buffer = Buffer.from(imgData, 'base64');

        sharp(buffer)
            .resize(sharpWidth, sharpHeight)
            .toBuffer(function (err, resizedData, info) {
                if (err) {
                    console.log(err);
                }

                s3.upload({
                    Bucket: store.get('s3BucketName'),
                    Key: fileNameInput.val(),
                    Body: resizedData,
                    ACL: 'public-read',
                    ContentType: imgContentType
                }, function (err, data) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        // TODO: Display success message
                        ipcRenderer.send('reload-main-window');
                        ipcRenderer.send('close-upload-window');
                    }
                });
            });
    }
    else {
        validationMessage.html('Please complete all fields');
    }
});

cancel.on('click', function(e) {
    e.preventDefault();

    ipcRenderer.send('close-upload-window');
});

preview.on('click', function(e) {
    e.preventDefault();

    var newWidth = parseInt(widthInput.val()) || null;
    var newHeight = parseInt(heightInput.val()) || null;
    refreshPreview(newWidth, newHeight);
});

function init(base64Data, fileName, path) {
    var meta = base64Data.split(',')[0];
    var data = base64Data.split(',')[1];
    imgMeta = meta;
    imgContentType = meta.split(':')[1].split(';')[0];
    imgData = data;

    fileNameInput.val(path + fileName);

    refreshPreview();
}

function refreshPreview(newWidth, newHeight) {
    var buffer = Buffer.from(imgData, 'base64');

    sharp(buffer)
        .resize(newWidth, newHeight)
        .toBuffer(function (err, resizedData, info) {
            if (err) {
                console.log(err);
            }

            var newImg = $('<img>');
            newImg.attr('src', imgMeta + ',' + new Buffer(resizedData).toString('base64'));
            imgContainer.empty();
            imgContainer.append(newImg);
            setTimeout(function() {
                widthInput.val(newImg.width());
                heightInput.val(newImg.height());
            }, 0);
        });
}

function validate() {
    if (
        fileNameInput.val() &&
        widthInput.val() &&
        heightInput.val()
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