var lwip = require('lwip'),
    fs = require('fs'),
    exif = require('exif-parser');

function UploadController(name, fileBuff){
    this.fs = fs;
    this.lwip = lwip;

    this.filePath = name;
    this.reqFile = null;
    this.fileBuffer = fileBuff;
    this.fileSize = 0;

    this.lwipImage = null;

    this.extension = "jpg";

    this.primaryCompression = 2;
    this.thumbnailCompression = 4;

    this.height = 0;
    this.width = 0;
    this.orientation = null;
}

/**
 *
 * GETTERS
 *
 */

UploadController.prototype.getFileBuffer = function(){
    return this.fileBuffer;
};

UploadController.prototype.getLwipImage = function(){
    return this.lwipImage;
};

UploadController.prototype.getReqFile = function(){
    return this.reqFile;
};

UploadController.prototype.getFilePath = function(){
    return this.filePath;
};

UploadController.prototype.getFileName = function(){
    return this.fileName;
};

UploadController.prototype.getFileHeight = function(){
    return this.height;
};

UploadController.prototype.getFileWidth = function(){
    return this.width;
};

UploadController.prototype.getExtension = function(){
    return this.extension;
};

UploadController.prototype.getFileSize = function(){
    return this.fileSize;
};

UploadController.prototype.getRatio = function(){

    var newWidth= this.width/2;
    var newHeight= this.height/2;

    if(this.width > this.height){
        return newWidth / this.width;
    }else{
        return newHeight / this.height;
    }
};

/**
 *
 * SETTERS
 *
 */

UploadController.prototype.setFilePath = function(path){
    this.filePath = path;
    this.setExtension(this.filePath);
};


UploadController.prototype.setExtension = function(path){
    //fileType(this.fileBuffer);
    this.extension = path.split('.').pop().toString().toLowerCase();
};

UploadController.prototype.setFileSize = function(callback){
    var that = this;

    this.fs.stat(this.filePath, function(err, stats){
        if(err){
            throw err
        }else{
            that.fileSize = stats.size;
            callback(err, stats);
        }
    });

};

UploadController.prototype.setFileBuffer = function(file){
    this.fileBuffer = file;
};

UploadController.prototype.setLwipImage = function(image){
    this.lwipImage = image;
};

UploadController.prototype.setExifData = function(image){
    this.exifData = exif.create(image).parse();
    this.orientation = this.exifData.tags.orientation;
};

/**
 *
 * METHODS
 */

UploadController.prototype.openFile = function(callback){
    var data = this.fileBuffer;

    this.setFileBuffer(data);
    this.setExifData(data);
    callback(null, data);
};

UploadController.prototype.openLwip = function(callback){
    var that = this;
    this.lwip.open(this.fileBuffer, this.getExtension(), function(err, image) {
        if(err){
            throw err;
        }else{
            that.width = image.width();
            that.height = image.height();
            image = image.batch();

            image.toBuffer(that.extension, function(err, buff){
                callback(err, buff);
            });

            callback(err, image);
        }
    });
};

UploadController.prototype.fixOrientation = function(image){
    switch( this.orientation ) {
        case 2:
            image = image.batch().flip('x'); // top-right - flip horizontal
            break;
        case 3:
            image = image.batch().rotate(180); // bottom-right - rotate 180
            break;
        case 4:
            image = image.batch().flip('y'); // bottom-left - flip vertically
            break;
        case 5:
            image = image.batch().rotate(90).flip('x'); // left-top - rotate 90 and flip horizontal
            break;
        case 6:
            image = image.batch().rotate(90); // right-top - rotate 90
            break;
        case 7:
            image = image.batch().rotate(270).flip('x'); // right-bottom - rotate 270 and flip horizontal
            break;
        case 8:
            image = image.batch().rotate(270); // left-bottom - rotate 270
            break;
        default:
            image = image.batch();
            break;
    }
    return image;
};

UploadController.prototype.compressImage = function(type, callback){
    var that = this;

    this.lwip.open(this.fileBuffer, this.extension, function(err, image){
        if(err){
            callback(err);
        }else{
            that.width = image.width();
            that.height = image.height();
            image = that.fixOrientation(image);

            if(type == 'thumbnail'){
                image.resize(that.width/that.thumbnailCompression, that.height/that.thumbnailCompression);
            }else{
                image.resize(that.width/that.primaryCompression, that.height/that.primaryCompression);
            }

            image.toBuffer(that.extension, function(err, buff){
                callback(err, buff);
            })
        }
    });

};

module.exports = UploadController;