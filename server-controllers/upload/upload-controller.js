var UploadModel = require('./upload-class');
var async = require('async'),
    AWS = require('aws-sdk'),
    moment = require('moment'),
    fs = require('fs');

require('dotenv').config();


function UploadController(username, date, file){
    this.uploader = new UploadModel(file.fieldname, file.buffer);
    this.filePath = '';
    this.username = username;

    this.aws = AWS;

    this.mainBuffer = null;
    this.thumbnailBuffer = null;

    this.newdate = moment(date);
    this.date = this.newdate.format("MMM Do YY").replace(/\s/g, '') + '/' + this.newdate.format("h m a").replace(/\s/g, '');
    this.dateKey = (this.newdate.format("MMM Do YY") + this.newdate.format("h m a")).replace(/\s/g, '');

    this.key = Math.random().toString(36).substr(2, 9);
    this.mainKey = "";
    this.thumbnailKey = ""
}

UploadController.prototype.getExtension = function(){
    return this.uploader.getExtension();
};

UploadController.prototype.setMainBuff = function(mainBuff){
    this.mainBuffer = mainBuff;
};

UploadController.prototype.setThumbnailBuff = function(thumbnailBuff){
    this.thumbnailBuffer = thumbnailBuff;
};

UploadController.prototype.getMainBuff = function(){
    return this.mainBuffer;
};

UploadController.prototype.getThumbnailBuff = function(){
    return this.thumbnailBuffer;
};

UploadController.prototype.getMainKey = function(){
    return this.mainKey;
};

UploadController.prototype.getThumbnailKey= function(){
    return this.thumbnailKey;
};

UploadController.prototype.setMainKey = function(){
    this.mainKey = this.username + '/fits/' + this.date + '/main/' + this.dateKey + "." + this.getExtension();
};

UploadController.prototype.setThumbnailKey = function(){
    this.thumbnailKey = this.username + '/fits/' + this.date + '/thumbnail/' + this.dateKey + "." + this.getExtension();
};

UploadController.prototype.getKeys = function(){
    return {
        main: {
            key: this.mainKey,
            link: "https://s3.amazonaws.com/" + process.env.BUCKET_NAME  + "/" + this.mainKey
        },
        thumbnail: {
            key: this.thumbnailKey,
            link: "https://s3.amazonaws.com/" + process.env.BUCKET_NAME  + "/" + this.thumbnailKey
        }
    };
};

UploadController.prototype.scale = function(callback){
    var that = this;

    this.uploader.openFile(function(err){
        if(err){
            callback(err);
        }
        async.parallel([
                function(callback){
                    that.uploader.compressImage('thumbnail', function(err, buff){
                        /*fs.writeFile('output2.jpg', buff, function(err){
                            callback(err, {thumbnail: buff});
                        });*/
                        callback(err, {thumbnail: buff});
                    });
                },
                function(callback){
                    that.uploader.compressImage('main', function(err, buff){
                        /*fs.writeFile('output3.jpg', buff, function(err){
                            callback(err, {main: buff});
                        });*/
                        callback(err, {main: buff});
                    });
                }
            ],
            function(err, buffs){
                callback(err, buffs);
            }
        );

    });
};

UploadController.prototype.uploadBoth = function(callback){
    var that = this;

    async.parallel([
            function(callback){
                that.AWSUpload(that.mainBuffer, that.getMainKey(), callback);
            },
            function(callback){
                that.AWSUpload(that.thumbnailBuffer, that.getThumbnailKey(), callback);
            }
        ],
        function(err, success){
            callback(err, success);
        }
    );
};


UploadController.prototype.AWSUpload = function(buffer, key, callback){
    var s3 = new this.aws.S3();

    //var s3bucket = new this.aws.S3({params: {Bucket: process.env.BUCKET_NAME}});

    s3.putObject({
        Bucket: process.env.BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: 'image/jpeg',
        ACL: 'public-read'
    }, function(err, data){
        if(err){
            callback(err);
        }else{
            callback(err, data);
        }
    });

};

UploadController.prototype.AWSDelete = function(keys, callback){
    var s3 = new this.aws.S3();

    s3.deleteObjects({
        Bucket: process.env.BUCKET_NAME,
        Delete: {
            Objects: keys
        }
    }, function(err, data){
        if(err){
            callback(err, data);
        }else{
            callback(err, data);
        }
    });
};
//hook up to a route

module.exports = UploadController;