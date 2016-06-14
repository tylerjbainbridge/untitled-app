var assert = require('assert');
var sinon = require('sinon');

var UploadController = require('../server-controllers/upload/upload-controller');

describe('Upload-Controller-Tests', function(){
    var user = 'tyler';
    var testFilePath = './test/test-images/test.jpg';
    var date = new Date();
    var uploadCont = new UploadController(user, date, testFilePath);

    var scaleError;
    var buffers;

    describe('#getExtension()', function(){
        it('should return the extension of the file', function(){
            assert(uploadCont.getExtension());
        });
    });


    before(function(done){
        uploadCont.scale(function(err, buffs){
            scaleError = err;
            buffers = buffs;
            done();
        });
    });

    describe('#Scale()', function(){

        it('should have no error', function(){
            assert.equal(null, scaleError);
        });

        it('should return two buffers', function(){
            assert.equal(buffers.length, 2);
        });

        it('should not have an undefined thumbnail', function(){
            assert.ok(typeof buffers[0].thumbnail != 'undefined');
        });

        it('should not have an undefined main', function(){
            assert.ok(typeof buffers[1].main != 'undefined');
        });
    });

    before(function(){
        uploadCont.setMainBuff(buffers[1].main);
        uploadCont.setThumbnailBuff(buffers[0].thumbnail);
    });

    describe('#SetGetBuffers()', function(){

        it('should set the main buff', function(){
            assert.ok(typeof uploadCont.getMainBuff() != 'undefined');
        });

        it('should set the thumbnail buff', function(){
            assert.ok(typeof uploadCont.getThumbnailBuff() != 'undefined');
        });
    });

    var uploadError;
    var uploadRes;

    before(function(done){
        uploadCont.uploadBoth(function(err, success){
            uploadError = err;
            uploadRes = success;
            done();
        });
    });

    describe('#Upload()', function(){
        it('should should no errors', function(){
            assert.ok(uploadError == null);
        });
        it('should should have successfully uploaded two files', function(){
            assert.ok(uploadRes.length == 2);
        });
    });

});