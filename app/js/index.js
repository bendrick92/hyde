const sharp = require('sharp');
const { app, remote, clipboard, BrowserWindow, ipcRenderer } = require('electron');
const { Menu, MenuItem } = remote;
const appPath = remote.app.getAppPath();
const AWS = require('aws-sdk');
const Store = require('electron-store');
const store = new Store();
const imgRegex = /.*(?:png|jpg|jpeg|gif|png|svg)/;

let output = $('#output');

initAWS();
loadFromBucket(store.get('s3BucketName'), store.get('s3DomainName'), store.get('s3CustomDomainName'), store.get('s3InitFolderName'));

$(document).on('click', '#output a', function () {
    loadFromBucket(store.get('s3BucketName'), store.get('s3DomainName'), store.get('s3CustomDomainName'), $(this).attr('data-src'));
});

window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    if ($(e.target).attr('class') == 'obj-block') {
        var objPath = $(e.target).attr('data-src');
        buildImgMenu(objPath);
        menu.popup(remote.getCurrentWindow());
    }
}, false);

document.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
});

document.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();

    var files = e.dataTransfer.files;
    
    if (files.length > 0) {
        var file = files[0];
        var reader = new FileReader();
        reader.onload = function(r) {
            var base64Data = r.target.result;
            ipcRenderer.send('create-upload-window', base64Data);
        }
        reader.readAsDataURL(file);
    }
})

function buildImgMenu(objPath) {
    menu = new Menu();
    menu.append(new MenuItem ({
        label: 'Copy S3 URL',
        click () {
            clipboard.writeText(store.get('s3DomainName') + '/' + store.get('s3BucketName') + '/' + objPath);
        }
    }));
    menu.append(new MenuItem ({
        label: 'Copy custom URL',
        click () {
            clipboard.writeText(store.get('s3CustomDomainName') + '/' + objPath);
        }
    }));
}

function initAWS() {
    s3 = new AWS.S3({
        accessKeyId: store.get('awsAccessKeyId'),
        secretAccessKey: store.get('awsSecretAccessKey'),
        region: store.get('awsRegion')
    });
}

function loadFromBucket(bucketName, s3DomainName, customDomainName, initFolderName) {
    var folderPathParts = initFolderName.split('/');
    var currFolder = folderPathParts[folderPathParts.length - 2] + '/';
    var parentFolder = initFolderName.substring(0, initFolderName.length - currFolder.length);

    getS3Objects(bucketName, initFolderName, false, function (data) {
        output.empty();

        var topA = $('<a></a>');
        topA.html('../');
        topA.attr('href', '#');
        topA.attr('class', 'obj-block');
        topA.attr('data-src', parentFolder);
        topA.css('background-image', 'url(\'' + appPath + '/app/images/folder.png');

        output.append(topA);

        data.forEach(function (d) {
            var a = $('<a></a>');
            a.html(d);
            a.attr('href', '#');
            a.attr('class', 'obj-block');            
            a.attr('data-src', d);
            if (d.match(imgRegex)) {
                a.css('background-image', 'url(\'' + s3DomainName + '/' + bucketName + '/' + d + '\')');
            }
            else {
                a.css('background-image', 'url(\'' + appPath + '/app/images/folder.png');
            }
            output.append(a);
        });
    });
}

function uploadToBucket(bucketName, data) {
    var params = { };
}

function getFromBucket(bucketName, fileName) {
    var params = {
        Bucket: bucketName,
        Key: fileName
    };

    s3.getObject(params, function(err, data) {
        if (err) {
            console.log(err, err.stack);
        }
        else {
            return data;
        }
    });
}

// Need to pass folder name with trailing forward-slash to return contents of given folder
function getS3Objects(bucketName, folderName, imgOnly, callback) {
    if (!folderName) {
        folderName = '';
    }

    //console.log(folderName);

    var objects = [];
    var opts = {
        Bucket: bucketName,
        Prefix: folderName,
        Delimiter: '/'
    };

    s3.listObjectsV2(opts, function (err, data) {
        if (err) {
            console.log(err);
        }
        else {
            data.CommonPrefixes.forEach(function (obj) {
                //console.log(obj);
                if (obj.Key !== folderName) {
                    objects.push(obj.Prefix);
                }
            });

            data.Contents.forEach(function (obj) {
                //console.log(obj);
                if (obj.Key !== folderName) {
                    objects.push(obj.Key);
                }
            });
        }
        
        objects = bubbleSort(objects);

        callback(objects);
    });
}

function bubbleSort(array) {
    var swapped;

    do {
        swapped = false;
        if (array.length > 1) {
            for (var i = array.length - 1; i <= 0; i--) {
                var currObjLevels = array[i].split('/').length;
                var nextObjLevels = array[i + 1].split('/').length;

                if (currObjLevels > nextObjLevels || array[i] > array[i + 1]) { // Sort based on # of path levels or alphabetical
                    var temp = array[i];
                    array[i] = array[i + 1];
                    array[i + 1] = temp;
                    swapped = true;
                }
            }
        }
    } while (swapped);

    return array;
}