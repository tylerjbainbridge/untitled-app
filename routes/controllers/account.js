'use strict';

const express = require('express'),
    passport = require('passport'),
    Account = require.main.require('./models/account'),
    Image = require.main.require('./models/image'),
    validator = require('validator');

exports.getUserProfile = (req, res)=>{
    let username = req.params.username;

    Account.findByUsername(username, (err, usr) => {
        if(usr){

            let query = {
                user_id: usr._id
            };

            Image.find(query, (err, imgs)=>{
                if(err){
                    return res.send(usr);
                }else if(imgs){

                    return res.send(
                        {
                            user: usr,
                            images: imgs
                        }

                    )
                }else{
                    return res.send(usr);
                }

            });

        }else if(err){
            res.send(err);
        }else{
            res.send('Did not find user.')
        }
    });
};

exports.getUserFeed = (req, res) => {
    let query = {
        $in: {user_id: req.user.following}
    };

    Image.aggregate([
        {$find: query}
    ], (err, docs) => {
        res.send(docs);
    })
};

exports.getUserImages = (req, res)=>{
    let query = {
      username: req.params.username
    };

    Image.find(query, (err, imgs)=>{
        if(imgs.length > 0){
            res.send(imgs);
        }else if(err){
            res.send(err);
        }else{
            res.send('No images to retrieve');
        }
    });
};

exports.createAccount = (req, res)=>{
    var username = req.body.username.replace(/\s/g, '').toLowerCase();
    var email = req.body.email;
    var name = req.body.name;
    var password = req.body.password;


    Account.register(
        new Account({
            username: username,
            name: name
        }), password, (err, account) => {
            if(err){
                res.send(err);
            }else if(account){
                res.send(account);
            }else{
                res.send('An unknown error occurred');
            }
        });
};

exports.login = (req, res, next)=>{
    req.body.username = req.body.username.toLowerCase();

    passport.authenticate('local', (err, user)=>{
        if (err)
            res.send(err);
        if (!user)
            res.send('Incorrect Credentials.');

        req.login(user, (err)=>{
            if (err) {
                res.send(err);
            }
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