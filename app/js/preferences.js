const Store = require('electron-store');
const store = new Store();

var s3BucketName = $('#s3-bucket-name');
s3BucketName.val(store.get('s3BucketName'));
var s3DomainName = $('#s3-domain-name');
s3DomainName.val(store.get('s3DomainName'));
var s3CustomDomainName = $('#s3-custom-domain-name');
s3CustomDomainName.val(store.get('s3CustomDomainName'));
var s3InitFolderName = $('#s3-init-folder-name');
s3InitFolderName.val(store.get('s3InitFolderName'));
