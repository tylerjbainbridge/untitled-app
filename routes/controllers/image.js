var express = require('express'),
    passport = require('passport'),
    Brand = require.main.require('./models/brand'),
    Style = require.main.require('./models/style'),
    Image = require.main.require('./models/image'),
    Comment = require.main.require('./models/comment'),
    MainController = require.main.require('./server-controllers/main-controller'),
    validator = require('validator'),
    async = require('async');

exports.getImage = (req, res) => {
    var short_id = req.params.image_short;

    var query = {
        shortid: short_id
    };

    Image.findOne(query, (err, img)=>{
        if(err){
            res.send(err);
        }else if(img){
            var query = {
                image_id: img.short_id
            };
            Comment.find(query, function(err, cmts){
                res.send({img:img, comments: cmts});
            });
        }else{
            res.send(500);
        }
    })
};


exports.uploadImage = (req, res)=>{

    var processCont = new MainController();

    var newDate = new Date();

    processCont.uploadImage(req.user.username, newDate, req.file, (err, keys) => {
        if(err){
            res.send(err);
        }else{

            var brands = req.body.brands.toLowerCase().split(',');
            var styles = req.body.styles.toLowerCase().split(',');

            var newBrands = [];
            var newStyles = [];

            brands.forEach((brand)=>{
                newBrands.push(brand.trim());
            });

            styles.forEach((style)=>{
                newStyles.push(style.trim());
            });

            Image.create(
                {
                    username: req.user.username,
                    user_id: req.user._id,
                    main: keys.keys.main,
                    thumbnail: keys.keys.thumbnail,
                    liked_by: [],
                    styles: newStyles,
                    brands: newBrands,
                    upload_date: newDate
                },
                (err, img) => {
                    if (err){
                        console.log(err);
                    }else{
                        async.each(img.brands, addBrands.bind(null, img.brands, img.styles), (err)=>{
                            async.each(img.styles, addStyles.bind(null, img.brands, img.styles), (err)=>{
                                err ? res.send(err) : res.send({imgObj: img});
                            });
                        });
                    }
                });

        }
    });

};

exports.testImage = (req, res)=>{

    var brands = req.body.brands.toLowerCase().split(',');
    var styles = req.body.styles.toLowerCase().split(',');

    var newBrands = [];
    var newStyles = [];

    var newDate = new Date();

    brands.forEach((brand)=>{
        newBrands.push(brand.trim());
    });

    styles.forEach((style)=>{
        newStyles.push(style.trim());
    });

    Image.create({
            username: req.user.username,
            user_id: req.user._id,
            liked_by: [],
            styles: newStyles,
            brands: newBrands,
            upload_date: newDate
        },
        (err, img) => {
            if (err){
                console.log(err);
            }else{
                async.each(img.brands, addBrands.bind(null, img.brands, img.styles), (err)=>{
                    async.each(img.styles, addStyles.bind(null, img.brands, img.styles), (err2)=>{
                        err || err2 ? res.send(err||err2) : res.send({imgObj: img});
                    });
                });
            }
        })
};

exports.deleteImage = (req, res) =>{
    var processCont = new MainController();
    var image_id = req.params.image_id;

    var query = {
        _id: image_id
    };

    Image.findOne(query, (err, img) => {
        if(img){
            var keys = [];

            keys.push({Key : img.main.key});
            keys.push({Key : img.thumbnail.key});

            processCont.deleteImage(keys, (err, data)=>{
                async.each(img.brands, removeBrands.bind(null, img.brands, img.styles), (err)=>{
                    async.each(img.styles, removeStyles.bind(null, img.brands, img.styles), (err2)=> {

                        if(err){
                            return res.send(err);
                        }else if(err2){
                            return res.send(err);
                        }

                        img.brands.forEach((brand)=> {
                            if (typeof req.user.brands[brand] != 'undefined' && req.user.brands[brand] > 0)
                                req.user.brands[brand]--;
                        });

                        img.styles.forEach((style)=> {
                            if (typeof req.user.styles[style] != 'undefined' && req.user.styles[style] > 0)
                                req.user.styles[style]--;
                        });

                        req.user.markModified('styles');
                        req.user.markModified('brands');

                        req.user.save((err)=> {
                            if (!err) {
                                err ? res.send(err) : res.send({imgObj: data});
                            }
                        });

                        img.remove();
                    });
                });
            });
        }else{
            res.sendStatus(500);
        }
    });

};

exports.deleteAllImages = (req, res)=>{
    var processCont = new MainController();

    Image.find({user_id: req.user._id}, (err, imgs)=>{
        if(err){
            res.send(err);
        }else{
            var keys = [];

            imgs.forEach((img)=>{
                keys.push({Key: img.main.key});
                keys.push({Key: img.thumbnail.key});
            });

            processCont.deleteImage(keys, (err, data)=>{
                res.send(data);
            });
        }
    });
};

function addBrands(brands, styles, brandName, callback){
    var query = {
        name: brandName
    };

    var action = {
        $inc: {amount: 1}
    };

    var upsert = {
        upsert: true, 'new': true
    };

    Brand.findOneAndUpdate(query, action, upsert, (err, brand)=> {
        if(err)
            callback(err);
        else{
            if(typeof brand.brands_paired_with == 'undefined')
                brand.brands_paired_with = {};
            if(typeof brand.styles == 'undefined')
                brand.styles = {};

            brands.forEach((brand_name)=>{
                if(brand_name != brandName)
                    brand.brands_paired_with[brand_name] ? brand.brands_paired_with[brand_name]++ : brand.brands_paired_with[brand_name] = 1;
            });

            styles.forEach((style_name)=>{
                brand.styles[style_name] ? brand.styles[style_name]++ : brand.styles[style_name] = 1;
            });

            brand.markModified('brands_paired_with');
            brand.markModified('styles');

            brand.save((err)=>{
                if(err)
                    callback(err);
                else
                    callback(err, brand);
            });
        }
    })
}

function addStyles(brands, styles, styleName, callback){
    var query = {
        name: styleName
    };

    var action = {
        $inc: {amount: 1}
    };

    var upsert = {
        upsert: true, 'new': true
    };

    Style.findOneAndUpdate(query, action, upsert, (err, style)=> {
        if(err)
            callback(err);
        else{
            if(typeof style.brands_paired_with == 'undefined')
                style.brands_paired_with = {};
            if(typeof style.styles == 'undefined')
                style.styles = {};

            brands.forEach((brand_name)=>{
                style.brands_paired_with[brand_name] ? style.brands_paired_with[brand_name]++ : style.brands_paired_with[brand_name] = 1;
            });

            styles.forEach((style_name)=>{
                if(style_name != styleName)
                    style.styles[style_name] ? style.styles[style_name]++ : style.styles[style_name] = 1;
            });

            style.markModified('brands_paired_with');
            style.markModified('styles');

            style.save((err)=>{
                if(err)
                    callback(err);
                else
                    callback(err, style);
            });
        }
    })
}

function removeStyles(brands, styles, styleName, callback){
    var query = {
        name: styleName
    };

    var action = {
        $inc: {amount: -1}
    };

    var upsert = {
        upsert: true, 'new': true
    };

    Style.findOneAndUpdate(query, action, upsert, (err, style)=> {
        if(err)
            callback(err);
        else{

            if(style.amount < 0)
                style.amount = 0;
            if(typeof style.brands_paired_with == 'undefined')
                style.brands_paired_with = {};
            if(typeof style.styles == 'undefined')
                style.styles = {};

            brands.forEach((brand_name)=>{
                if(style.brands_paired_with[brand_name] > 0)
                    style.brands_paired_with[brand_name]--;
            });

            styles.forEach((style_name)=>{
                if(style_name != styleName && style.styles[style_name]>0)
                    style.styles[style_name]--;
            });

            style.markModified('brands_paired_with');
            style.markModified('styles');

            style.save((err)=>{
                if(err)
                    callback(err);
                else
                    callback(err, style);
            });
        }
    })
}

function removeBrands(brands, styles, brandName, callback){
    var query = {
        name: brandName
    };

    var action = {
        $inc: {amount: -1}
    };

    var upsert = {
        upsert: true, 'new': true
    };

    Brand.findOneAndUpdate(query, action, upsert, (err, brand)=> {
        if(err)
            callback(err);
        else{
            if(brand.amount < 0)
                brand.amount = 0;
            if(typeof brand.brands_paired_with == 'undefined')
                brand.brands_paired_with = {};
            if(typeof brand.styles == 'undefined')
                brand.styles = {};

            brands.forEach((brand_name)=>{
                if(brand_name != brandName && brand.brands_paired_with[brand_name] > 0)
                    brand.brands_paired_with[brand_name]--;
            });

            styles.forEach((style_name)=>{
                if(brand.styles[style_name]>0)
                    brand.styles[style_name]--;
            });

            brand.markModified('brands_paired_with');
            brand.markModified('styles');

            brand.save((err)=>{
                if(err)
                    callback(err);
                else
                    callback(err, brand);
            });
        }
    })
}