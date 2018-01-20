const { ipcRenderer } = require('electron');
const Store = require('electron-store');
const store = new Store();

var awsAccessKeyId = $('#aws-access-key-id');
var awsSecretAccessKey = $('#aws-secret-access-key');
var awsRegion = $('#aws-region');
var s3BucketName = $('#s3-bucket-name');
var s3DomainName = $('#s3-domain-name');
var s3CustomDomainName = $('#s3-custom-domain-name');
var s3InitFolderName = $('#s3-init-folder-name');
var preferencesForm = $('#preferences-form');
var validationMessage = $('#validation-message');

init();

preferencesForm.on('submit', function(e) {
    e.preventDefault();
    
    console.log(validate());

    if (validate()) {
        store.set('awsAccessKeyId', awsAccessKeyId.val());
        store.set('awsSecretAccessKey', awsSecretAccessKey.val());
        store.set('awsRegion', awsRegion.val());
        store.set('s3BucketName', s3BucketName.val());
        store.set('s3DomainName', s3DomainName.val());
        store.set('s3CustomDomainName', s3CustomDomainName.val());
        store.set('s3InitFolderName', s3InitFolderName.val());

        ipcRenderer.send('setup-complete');
        ipcRenderer.send('close-preferences-window');
        ipcRenderer.send('reload-main-window');
    }
    else {
        validationMessage.html('Please complete all fields');
    }
});

function init() {
    awsAccessKeyId.val(store.get('awsAccessKeyId'));
    awsSecretAccessKey.val(store.get('awsSecretAccessKey'));
    awsRegion.val(store.get('awsRegion'));
    s3BucketName.val(store.get('s3BucketName'));
    s3DomainName.val(store.get('s3DomainName'));
    s3CustomDomainName.val(store.get('s3CustomDomainName'));
    s3InitFolderName.val(store.get('s3InitFolderName'));
}

function validate() {
    if (
        awsAccessKeyId.val() &&
        awsSecretAccessKey.val() &&
        awsRegion.val() &&
        s3BucketName.val() &&
        s3DomainName.val() &&
        s3CustomDomainName.val() &&
        s3InitFolderName.val()
    ) {
        return true;
    }
    else {
        return false;
    }
}