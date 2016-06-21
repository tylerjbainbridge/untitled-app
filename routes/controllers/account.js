'use strict';

const express = require('express'),
    passport = require('passport'),
    _ = require('lodash'),
    Account = require.main.require('./models/account'),
    Image = require.main.require('./models/image'),
    Comment = require.main.require('./models/comment'),
    moment = require('moment'),
    validator = require('validator');

exports.getUserProfile = (req, res)=>{
    Account.findByUsername(req.params.username)
    .then((usr)=>{
        Image.find({user_id: usr._id})
        .then((imgs)=>{
            return res.send({user: usr, images: imgs});
        })
        .catch((err)=>{
            return res.send(err);
        });
    })
    .catch((err)=>{
        return res.send(err);
    });
};

exports.getUserFeed = (req, res) => {
    let pageLength = 5;

    /**
     * Aggregate can't be promisefyed.
     * First retrieve all the images from the user's req.user follows.
     * Second sort them in all in descending order based on createdAt date.
     * Third only return the first $pageLength images.
     */
    Image.aggregate([
        {$match: { user_id: { $in: req.user.following}}},
        {$sort: {createdAt: -1}},
        {$limit: pageLength}
    ], (err, imgs) => {
        let image_ids = [];

        _.forEach(imgs, (img)=>{
            image_ids.push(img.short_id);
        });

        Comment.find({image_id: {$in: image_ids}}, (err, cmts)=>{
            let comments = {};
            _.forEach(cmts, (cmt)=>{
                let newCmt = cmt;
                newCmt['fromNow'] = moment(cmt.createdAt).fromNow();

                //TODO: FIGURE OUT WHY THIS DOESNT WORK

                comments[cmt.image_id] ?
                    comments[cmt.image_id].push(newCmt) :
                    comments[cmt.image_id] = [newCmt];
            });
            res.send({
                images: imgs,
                comments: comments
            });
        });
    })
};

exports.getUserImages = (req, res)=>{
    Image.find(req.params.username)
    .then((imgs)=>{
        res.send(imgs);
    })
    .catch((err)=>{
        res.send(err);
    });
};

exports.createAccount = (req, res)=>{
    var username = req.body.username.replace(/\s/g, '').toLowerCase();
    var email = req.body.email;
    var name = req.body.name;
    var password = req.body.password;

    Account.register(new Account({username: username, name: name}), password, (err, account) => {
        if(err){
            res.send(err);
        }else if(account){
            res.send(account);
        }
    });
};

exports.login = (req, res, next)=>{
    req.body.username = req.body.username.toLowerCase();

    passport.authenticate('local', (err, user)=>{
        if (err)
            res.send(err);
        if (!user)
            res.send(new Error('Incorrect Credentials.'));

        req.login(user, (err)=>{
            if (err)
                res.send(err);
            else
                res.send(user);
        });

    })(req, res);
};

exports.newFit = (req, res) => {
    var processCont = new MainController();

    var newDate = new Date();

    processCont.uploadImage('tyler', newDate, req.file.path, (err, keys)=>{
        if(err){
            console.log(err);
        }else{
            res.send(keys);
        }
    });
};

exports.getSuggestions = (req, res)=>{

};