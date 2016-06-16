'use strict';

const express = require('express'),
    passport = require('passport'),
    Account = require.main.require('./models/account'),
    Image = require.main.require('./models/image'),
    validator = require('validator'),
    Comment = require.main.require('./models/comment');

exports.likeImage = (req, res)=> {
    var image_id = req.params.img_short;
    var user_id = req.user._id;

    console.log(`${req.user.username} liked: ${image_id}`);

    /*var query = {
     _id: image_id
     };*/

    let query = {
        short_id: image_id
    };

    let action = {
        $addToSet: {liked_by: user_id}
    };

    let upsert = {
        'new': true
    };

    Image.findOneAndUpdate(query, action, upsert)
    .then((img)=>{
        if (!req.user.brands)
            req.user.brands = {};

        if (!req.user.styles)
            req.user.styles = {};

        img.brands.forEach((brand)=> {
            req.user.brands[brand] ? req.user.brands[brand]++ : req.user.brands[brand] = 1;
        });

        img.styles.forEach((style)=> {
            req.user.styles[style] ? req.user.styles[style]++ : req.user.styles[style] = 1;
        });

        req.user.markModified('styles');
        req.user.markModified('brands');

        req.user.save((err)=> {
            if (!err) {
                res.send(`success: ${img}`);
            } else {
                res.send(err);
            }
        })
    })
    .catch((err)=>{
      res.send(err);
    });
};

exports.unLikeImage = (req, res)=> {
    let image_id = req.params.img_short;
    let user_id = req.user._id;

    console.log(`${req.user.username} unliked: ${image_id}`);

    let query = {
        short_id: image_id
    };

    let action = {
        $pull: {liked_by: user_id}
    };

    let upsert = {
        'new': true
    };

    Image.findOneAndUpdate(query, action, upsert)
    .then((img)=>{
        if (img.liked_by.indexOf(user_id) < 0) {
            if (!req.user.brands)
                res.send('error.');

            img.brands.forEach((brand)=> {
                if (req.user.brands[brand] > 0)
                    req.user.brands[brand]--;
            });

            img.styles.forEach((style)=> {
                if (req.user.styles[style] > 0)
                    req.user.styles[style]--;
            });

            req.user.markModified('brands');
            req.user.markModified('styles');

            req.user.save((err)=> {
                if (!err) {
                    res.send(`success: ${img}`);
                } else {
                    res.send(err);
                }
            })
        }else{
            res.send(new Error(`tried to like twice: ${img}`));
        }
    })
    .catch((err)=>{
        res.send(err);
    })
};

exports.comment = (req, res) => {
    let body = req.body.comment;
    let image_id = req.params.img_short;
    let username = req.user.username;
    let user_id = req.user._id;

    Comment.create({
        username: username,
        user_id: user_id,
        image_id: image_id,
        body: body
    })
    .then((cmt)=>{
        res.send(cmt);
    })
    .catch((err)=>{
        res.send(err);
    });
};

exports.deleteComment = (req, res) => {
    let query = {
        _id: req.params.comment_id
    };

    Comment.findOne(query).remove()
    .then(res.send(200))
    .catch(res.send);
};

exports.follow = (req, res) => {
    let user_id = req.params.user_id;

    let query = {
        _id: user_id
    };

    let action = {
        $addToSet: {followers: req.user.id}
    };

    let upsert = {
        'new': true
    };

    Account.findOneAndUpdate(query, action, upsert)
    .then((usr)=>{
        if (req.user.following.indexOf(usr._id) < 0)
            req.user.following.push(usr._id);
        req.user.save((err)=> {
            if (err) {
                return res.send(err);
            } else {
                res.send(usr);
            }
        });
    })
    .catch(res.send);
};

exports.unfollow = (req, res) => {
    let user_id = req.params.user_id;

    let query = {
        _id: user_id
    };

    let action = {
        $pull: {followers: req.user.id}
    };

    let upsert = {
        'new': true
    };

    Account.findOneAndUpdate(query, action, upsert)
    .then((usr)=>{
        req.user.following.pull(usr._id);

        req.user.save((err)=> {
            if (err) {
                return res.send(err);
            } else {
                res.send(usr);
            }
        });
    })
    .catch(res.send);
};