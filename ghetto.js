var ProcessController = require('./server-controllers/main-controller'),
    processCont = new ProcessController();
var moment = require('moment');



var newDate = new Date();

processCont.uploadImage('tyler', newDate, './test/test-images/test.jpg', function(err, keys){
   if(err){
       console.log(err);
   }else{
       console.log(keys);
   }
});

/*uploadCont.scale(function(err, buffs){
 uploadCont.setMainBuff(buffs[1].main);
 uploadCont.setThumbnailBuff(buffs[0].thumbnail);

 uploadCont.uploadBoth(function(err, success){
 if(err){
 console.log(err);
 }else{
 console.log(success.length + " files successfully uploaded.");
 }
 });
 });*/