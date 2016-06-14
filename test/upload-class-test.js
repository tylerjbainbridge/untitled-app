var assert = require('assert');

var UploadController = require('../server-controllers/upload/upload-class'),
    uploadCont = new UploadController("tyler");

describe('Upload-Class-Test', function(){
    var testFilePath = './test/test-images/test.jpg';

    it('should return 0', function(){
       assert.ok(uploadCont.getFileHeight() == 0);
    });

    it('should set the filePath', function(){

        uploadCont.setFilePath(testFilePath);

        assert.equal(testFilePath, uploadCont.getFilePath());
    });

    describe('#openFile()', function(){
        var error;
        var file;

        before(function(done){
            uploadCont.openFile(function(err, data){
                error = err;
                file = data;

                uploadCont.setFileBuffer(data);
                done();
            });
        });

        it('should have no error', function(){
            assert.equal(null, error);
        });

        it('should return the file', function(){
            assert.ok(uploadCont.getFileBuffer());
        });

        it('should have a file size > 0', function(){
            assert.ok(uploadCont.getFileSize() > 0);
        });

        it('should return a image buffer', function(done){
            uploadCont.compressImage('main',function(err, buff){
                assert.equal(null, err);
                assert(buff);
                done();
            })
        });

        it('should return a image buffer', function(done){
            uploadCont.compressImage('thumbnail',function(err, buff){
                assert.equal(null, err);
                assert(buff);
                done();
            })
        });

    });
});