/**
 * @file ユーザー情報の登録と認証を行うクラスファイル
 */

const Promise = require('bluebird');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const mysqlModules = require('../mysqlmodules/models');

// 公開鍵を読み込む
const publickey = fs.readFileSync(process.env.NODE_JWT_PUBLICKEY, { encoding: 'utf8'});
const privatekey = fs.readFileSync(process.env.NODE_JWT_PRIVATEKEY, { encoding: 'utf8'});

/**
 * @class　ユーザー認証とトークン作成を行うクラス
 */
module.exports = class authrization {
    /**
     * プロパティを定義するコンストラクター
     * @memberOf authrization
     * @name　constructor
     * @param {object} userInfo - ユーザー情報のオブジェクト
     * @param {string} userName - ユーザー情報から取得したユーザー名
     */
    constructor() {
        this.userInfo = "";
        this.userName = "";
    }
    /**
     * プロパティに値を設定するセッター
     * @memberOf authrization
     * @name　propSet
     * @param　{object} props - 設定する値のオブジェクト
     * @return {void}
     * @example
     * propSet = {userInfo: exampleUserInfo};
     */
    set propSet (props) {
        this.userInfo = props.userInfo;
        props.userInfo.displayName === null ?
            this.userName = props.userInfo.username:
            this.userName = props.userInfo.displayName;
    }
    /**
     * ゲストユーザーのトークンを作成する関数
     * @param id {int} - トークンを作成するゲストユーザーのID
     * @return {string} - 作成したjwtトークン
     * @example
     * generateGuestToken(1);
     */
    generateGuestToken(id) {
        return jwt.sign({
            id: id
        }, publickey, {
            expiresIn: '7d',
            audience: 'Mrs guestuser secret audience'
        });
    }
    /**
     * ログイン後のユーザーのトークンを作成する関数
     * @param userName {string} - ユーザー名
     * @param id {int} - トークンを作成するユーザーのID
     * @return {string} - 作成したjwtトークン
     * @example
     * generateToken('ユーザー名', 1);
     */
    generateToken(userName, id) {
        return jwt.sign({
            name: userName,
            id: id
        }, publickey, {
            expiresIn: '2h',
            audience: 'Mrs user secret audience'
        });
    }
    /**
     * ユーザー名の更新または新規登録を行う関数
     * @return {string} - 作成したトークン
     * @example
     * generateUserInfo().then(result=>{console.log(result);});
     */
    generateUserInfo() {
        return new Promise((resolve, reject) => {
            mysqlModules.Users.query({where: {email: this.userInfo.emails[0].value.toString()}})
            .fetch()
            .then(model => {
                return mysqlModules.Users.where({email: this.userInfo.emails[0].value.toString()})
                .fetch()
                .then(user => user.set('name', this.userName))
                .then(user => user.update())
                .then(result => {
                    resolve(this.generateToken(result.attributes.name, model.attributes.id));
                })
                .catch(err=>{
                    reject(err);
                });
            })
            .catch(() => {
                return new mysqlModules.Users({
                    name: this.userName.toString(),
                    email: this.userInfo.emails[0].value.toString(),
                    usertype: 'general'
                })
                .save()
                .then((result) => {
                    resolve(this.generateToken(result.attributes.name, result.attributes.id));
                })
                .catch(err=>{
                    reject(err);
                });
            });
        });
    }
    /**
     * ゲストユーザーの認証を行う関数
     * @return {void}
     * @example
     * router.get('/example', IsGuestToken, (req, res) => {res.json({message: 'OK'})});
     */
    static IsGuestToken(req, res, next) {
        if(!req.headers.authorization) {
            return res.status(401).json({message:'トークンが作成されていません。'});
        }
        const authToken = req.headers.authorization.split(' ')[1];
        jwt.verify(authToken, publickey, { audience: 'Mrs guestuser secret audience' },
        (err, decoded) => {
            if (err) {
                res.status(401).json({message:'ゲストユーザーの利用期限が過ぎています。'});
            } else {
                req.jwtPayLoad = decoded;
                next();
            }
        });
    }
    /**
     * パスワード登録時のユーザー認証を行う関数
     * @return {void}
     * @example
     * router.get('/example', IsPwToken, (req, res) => {res.json({message: 'OK'})});
     */
    static IsPwToken(req, res, next) {
        if(!req.headers.authorization) {
            return res.status(401).json({message:'トークンが作成されていません。'});
        }
        const authToken = req.headers.authorization.split(' ')[1];
        jwt.verify(authToken, publickey, { audience: 'Mrs user secret audience' },
        (err, decoded) => {
            if (err) {
                console.log(err);
                res.status(401).json({message:'パスワードの登録期限が過ぎています。'});
            } else {
                req.jwtPayLoad = decoded;
                next();
            }
        });
    }
    /**
     * ログイン後のユーザー認証を行う関数
     * @return {void}
     * @example
     * router.get('/example', IsAuthorizationToken, (req, res) => {res.json({message: 'OK'})});
     */
    static IsAuthorizationToken(req, res, next) {
        if(!req.headers.authorization) {
            return res.status(401).json({message:'トークンが作成されていません。'});
        }
        const authToken = req.headers.authorization.split(' ')[1];
        jwt.verify(authToken, publickey, { audience: 'Mrs user secret audience' },
        (err, decoded) => {
            if (err) {
                res.status(401).json({message:'認証期限が切れています。ログインし直してください。'});
            } else {
                req.jwtPayLoad = decoded;
                next();
            }
        });
    }
}