var UploadController = require('./upload/upload-controller');

function ProcessController(){}

ProcessController.prototype.uploadImage = function(username, date, file, callback){
    var scaleError = 'Error scaling image';
    var uploadError = 'Error uploading image';

    var uploadCont = new UploadController(username, date, file);
    uploadCont.setThumbnailKey();
    uploadCont.setMainKey();

    uploadCont.scale(function(err, buffs){
        if(err){
            callback(err);
        }else{
            uploadCont.setMainBuff(buffs[1].main);
            uploadCont.setThumbnailBuff(buffs[0].thumbnail);

            uploadCont.uploadBoth(function(err, success){
                if(err){
                    callback(err);
                }else{
                    console.log(success.length + " files successfully uploaded.");
                    callback(err, {
                        keys: uploadCont.getKeys(),
                        extension: uploadCont.getExtension()
                    });
                }
            });
        }
    });
};

ProcessController.prototype.deleteImage = function(keys, callback){

    var uploadCont = new UploadController('n/a', new Date(), 'n/a');

    uploadCont.AWSDelete(keys, function(err, data){
       if(err){
           callback(err)
       }else{
           callback(err, data);
       }
    });

};

module.exports = ProcessController;