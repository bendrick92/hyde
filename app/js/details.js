const { ipcRenderer } = require('electron');
const AWS = require('aws-sdk');
const Store = require('electron-store');
const store = new Store();

let imgContainer = $('#img-container');
let ogFileNameInput = $('#og-file-name');
let fileNameInput = $('#file-name');
let detailsForm = $('#details-form');
let deleteButton = $('#delete');
let cancelButton = $('#cancel');

ipcRenderer.on('load-s3Data', (event, arg) => {
    init(arg.fileName);
});

initAWS();

detailsForm.on('submit', function(e) {
    e.preventDefault();

    if (validate()) {
        let imgContentType = '';

        s3.getObject({
            Bucket: store.get('s3BucketName'),
            Key: fileNameInput.val()
        }, function(err, data) {
            if (err) {
                console.log('Load Error: ' + err);
            }
            else {
                imgContentType = data.ContentType;
            }
        });
        s3.copyObject({
            Bucket: store.get('s3BucketName'),
            CopySource: store.get('s3BucketName') + '/' + ogFileNameInput.val(),
            Key: fileNameInput.val(),
            ACL: 'public-read',
            ContentType: imgContentType
        }, function(err, data) {
            if (err) {
                console.log('Copy Error: ' + err);
            }
            else {
                s3.deleteObject({
                    Bucket: store.get('s3BucketName'),
                    Key: ogFileNameInput.val()
                }, function(err, data) {
                    if (err) {
                        console.log('Delete Error: ' + err);
                    }
                    else {
                        // TODO: Display changes saved message
                        ipcRenderer.send('reload-main-window');
                        ipcRenderer.send('close-details-window');
                    }
                });
            }
        });
    }
    else {
        validationMessage.html('Please complete all fields');
    }
});

deleteButton.on('click', function(e) {
    e.preventDefault();

    // TODO: Prompt with confirm
    s3.deleteObject({
        Bucket: store.get('s3BucketName'),
        Key: ogFileNameInput.val()
    }, function(err, data) {
        if (err) {
            console.log(err);
        }
        else {
            // TODO: Display deleted message
            ipcRenderer.send('reload-main-window');
            ipcRenderer.send('close-details-window');
        }
    });
});

cancelButton.on('click', function(e) {
    e.preventDefault();

    ipcRenderer.send('close-details-window');
});

function init(fileName) {
    ogFileNameInput.val(fileName);
    fileNameInput.val(fileName);

    var newImg = $('<img>');
    newImg.attr('src', store.get('s3DomainName') + '/' + store.get('s3BucketName') + '/' + fileName);
    imgContainer.empty();
    imgContainer.append(newImg);
}

function validate() {
    if (
        fileNameInput.val()
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