/**
 * @file コンテンツのCRUD処理を行うクラスファイル
 */

const webshot = require('webshot');
const Promise = require('bluebird');
const mysqlModules = require('../mysqlmodules/models');
const fs = require('fs');
const shotOptions = {
    screenSize: {width: 1024, height: 600},
    shotSize: {width: 1024, height: 600}
}

/**
 * @class　マイページのコンテンツをCRUDするクラス
 */
module.exports = class mypage {
    /**
     * プロパティを定義するコンストラクター
     * @memberOf mypage
     * @name　constructor
     * @param {object} req - クライアントからのリクエスト
     * @param {string} shotName - 取得したスクリーンショットにつけるファイル名
     * @param {string} type - ユーザーのタイプ
     */
    constructor() {
        this.req = "";
        this.shotName = "";
        this.type = "";
    }
    /**
     * プロパティに値を設定するセッター
     * @memberOf mypage
     * @name　propSet
     * @param　{object} props - 設定する値のオブジェクト
     * @return {void}
     * @example
     * propSet = {req: req, shotname: 'example', type:'example'};
     */
    set propSet (props) {
        this.req = props.req;
        this.shotName = props.shotname;
        this.type = props.type;
    }
    /**
     * コンテンツの登録を行う関数の呼び出し元
     * @memberOf mypage
     * @name　createContents
     * @return {object} - 登録したコンテンツの内容
     * @example
     * createContents().then(result=>{console.log(result);});
     */
    createContents() {
        return new Promise((resolve, reject)  => {
            Promise.all([
                this.getShot(),
                this.dbRegist()
            ]).spread((shotResult, registResult) => {
                resolve(registResult);
            })
            .catch(err=>{
                reject(err);
            });
        });
    }
    /**
     * コンテンツの読み込みを行う関数
     * @memberOf mypage
     * @name　readContents
     * @return {object} - 登録している全てのコンテンツ内容
     * @example
     * readContents().then(result=>{console.log(result);});
     */
    readContents() {
        return new Promise((resolve, reject)  => {
            if(this.type === 'guest') {
                new mysqlModules.GuestContents()
                .orderBy('created_at', 'DESC')
                .where('user_id', '=', this.req.jwtPayLoad.id)
                .fetchAll()
                .then((result)=>{
                    resolve({username: 'Guest', contents:result});
                })
                .catch(err=>{
                    reject(err);
                });
            } else {
                new mysqlModules.Contents()
                .orderBy('created_at', 'DESC')
                .where('user_id', '=', this.req.jwtPayLoad.id)
                .fetchAll()
                .then((result)=>{
                    resolve({username: this.req.jwtPayLoad.name, contents:result});
                })
                .catch(err=>{
                    reject(err);
                });
            }
        });
    }
    /**
     * コンテンツの更新を行う関数の呼び出し元
     * @memberOf mypage
     * @name　updateContents
     * @return {object} - 更新したコンテンツの内容
     * @example
     * updateContents().then(result=>{console.log(result);});
     */
    updateContents() {
        return new Promise((resolve, reject)  => {
            this.req.body.contentsInfo.tags = this.req.body.contentsInfo.tags.replace(/ /g,',');
            //　ゲストユーザーであった場合はゲストユーザー用のテーブルを参照する
            if(this.type === 'guest') {
                mysqlModules.GuestContents.where({
                    id: this.req.body.contentsId,
                    user_id: this.req.jwtPayLoad.id
                }).fetch()
                .then(result => {
                    return this.updateMethod(result.attributes.url)
                    .then(result=>{
                        resolve(result);
                    })
                    .catch(err=>{
                        reject(err);
                    });
                })
                .catch(err => {
                    reject(err);
                });
            } else {
                mysqlModules.Contents.where({
                    id: this.req.body.contentsId,
                    user_id: this.req.jwtPayLoad.id
                }).fetch()
                .then(result => {
                    return this.updateMethod(result.attributes.url)
                    .then(result=>{
                        resolve(result);
                    })
                    .catch(err=>{
                        reject(err);
                    });
                })
                .catch(err => {
                    reject(err);
                });
            }
        });
    }
    /**
     * コンテンツの削除を行う関数
     * @memberOf mypage
     * @name　deleteContents
     * @return {object} - 削除したコンテンツの内容
     * @example
     * deleteContents().then(result=>{console.log(result);});
     */
    deleteContents() {
        return new Promise((resolve, reject)=>{
            //　ゲストユーザーであった場合はゲストユーザー用のテーブルを参照する
            if(this.type === 'guest') {
                mysqlModules.GuestContents.where({
                    id: this.req.params.contentsid,
                    user_id: this.req.jwtPayLoad.id
                }).fetch()
                .then(record => {
                    fs.unlink(`./public/shots/${record.attributes.imageurl.split('/').slice(-1)[0]}`,
                    (err) => {
                        if(err){console.log(err);}
                    });
                    return record.destroy().then(result=>{
                        resolve(result._previousAttributes);
                    });
                })
                .catch(err=>{
                    reject(err);
                });
            } else {
                mysqlModules.Contents.where({
                    id: this.req.params.contentsid,
                    user_id: this.req.jwtPayLoad.id
                }).fetch()
                .then(record => {
                    fs.unlink(`./public/shots/${record.attributes.imageurl.split('/').slice(-1)[0]}`,
                    (err) => {
                        if(err){console.log(err);}
                    });
                    return record.destroy().then(result=>{
                        resolve(result._previousAttributes);
                    });
                })
                .catch(err=>{
                    reject(err);
                });
            }
        });
    }
    /**
     * コンテンツのスクリーンショットを取得する関数
     * @memberOf mypage
     * @name　getShot
     * @return {void} - コンソールで表示
     * @example
     * getShot().then(()=>{console.log('example');});
     */
    getShot() {
        return new Promise((resolve, reject)=>{
            webshot(this.req.body.contentsInfo.url,`./public/shots/${this.shotName}`, shotOptions,
            (err) => {
                if(err) {
                    reject(err);
                    console.log(err);
                }
            });
            resolve();
        });
    }
    /**
     * コンテンツの登録を行う関数
     * @memberOf mypage
     * @name　dbRegist
     * @return {object} - 登録したコンテンツの内容
     * @example
     * dbRegist().then((result)=>{console.log(result);});
     */
    dbRegist() {
        return new Promise((resolve, reject)=>{
            this.req.body.contentsInfo.tags = this.req.body.contentsInfo.tags.replace(/ /g,',');
            const contentsRec = {
                user_id: this.req.jwtPayLoad.id,
                url: this.req.body.contentsInfo.url,
                imageurl: `${process.env.NODE_SERVER_ORIGIN}/app/images/${this.shotName}`,
                genre: this.req.body.contentsInfo.genre,
                tags: this.req.body.contentsInfo.tags,
                title: this.req.body.contentsInfo.title,
                overview: this.req.body.contentsInfo.overview
            };
            if(this.type === 'guest') {
                return new mysqlModules.GuestContents(contentsRec).save()
                .then(result => {
                    resolve(result.attributes);
                })
                .catch(err=>{
                    reject(err);
                });
            } else {
                return new mysqlModules.Contents(contentsRec).save()
                .then(result => {
                    resolve(result.attributes);
                })
                .catch(err=>{
                    reject(err);
                });
            }
        });
    }
    /**
     * コンテンツの更新を行う関数
     * @memberOf mypage
     * @name　dbUpdate
     * @return {object} - 更新したコンテンツの内容
     * @example
     * dbUpdate().then((result)=>{console.log(result);});
     */
    dbUpdate() {
        return new Promise((resolve, reject)=>{
            if(this.type === 'guest') {
                return mysqlModules.GuestContents.where({
                    id: this.req.body.contentsId,
                    user_id: this.req.jwtPayLoad.id
                }).fetch()
                .then(user => user.set(this.req.body.contentsInfo))
                .then(user => user.update())
                .then(result => {
                    resolve(result);
                })
                .catch(err=>{
                    reject(err);
                });
            } else {
                return mysqlModules.Contents.where({
                    id: this.req.body.contentsId,
                    user_id: this.req.jwtPayLoad.id
                }).fetch()
                .then(user => user.set(this.req.body.contentsInfo))
                .then(user => user.update())
                .then(result => {
                    resolve(result);
                })
                .catch(err=>{
                    reject(err);
                });
            }
        });
    }
    /**
     * コンテンツの更新処理の内容を分ける関数
     * @memberOf mypage
     * @name　updateMethod
     * @return {object} - 更新したコンテンツの内容
     * @example
     * updateMethod('更新される前のURL').then((result)=>{console.log(result);});
     */
    updateMethod(beforeUrl) {
        return new Promise((resolve, reject) => {
            if (beforeUrl === this.req.body.contentsInfo.url) {
                return this.dbUpdate()
                .then(result => {
                    resolve(result);
                })
                .catch(err => {
                    reject(err);
                });
            } else {
                this.req.body.contentsInfo.imageurl = `${process.env.NODE_SERVER_ORIGIN}/app/images/${this.shotName}`;
                return Promise.all([
                    this.getShot(),
                    this.dbUpdate()
                ]).spread((shotResult, updateResult) => {
                    fs.unlink(`./public/shots/${updateResult._previousAttributes.imageurl.split('/').slice(-1)[0]}`,
                    (err) => {
                        if(err){console.log(err);}
                    });
                    resolve(updateResult);
                })
                .catch(err => {
                    reject(err);
                });
            }
        });
    }
}