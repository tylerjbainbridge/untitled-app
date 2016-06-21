const Brand = require('.models/brand');
const Account = require('.models/account');
const Promise = require('bluebird').Promise;

class Suggestions{
    constructor(user_id){
        this.user_id = user_id;
        this.suggestedBrands = [];
        this.suggestedStyles = [];
        this.userBrands = [];
        this.userStyles = [];
    }

    getTastes(){
        return new Promise(resolve, reject){
            Account.find({_id: this.user_id})
            .then((usr)=>{
                resolve(resolve);
            })
            .catch(reject);
        }
    }
}