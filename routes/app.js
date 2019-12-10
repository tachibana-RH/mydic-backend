/**
 * @file マイページのコンテンツ管理を行うJSファイル
 */

const express = require('express');
const router = express.Router();
const authorizationClass = require('../class/authrizationClass');
const mypageClass = require('../class/mypageClass');
const mypageService = new mypageClass();
require('date-utils');

/**
 * ログイン後のユーザーにコンテンツを表示するルーター
 */
router.get('/getContents', authorizationClass.IsAuthorizationToken, (req, res) => {
    /**
     * ログイン後ユーザー用のテーブルからコンテンツデータの読み込みを行うインスタンス
     * @param {object} req - クライアントからのリクエスト
     * @param {string} shotname - URLから取得する画像の名前
     * @param {string} type - ユーザーのタイプ
     * @return {object} - ユーザーがDBに登録している全てのコンテンツデータ
     */
    mypageService.propSet = {req: req, shotname: '', type:'general'};
    mypageService.readContents()
    .then(result=>{
        res.status(200).json(result);
    })
    .catch(err=>{
        res.status(400).json({message: err});
    });
});

/**
 * ログイン後のユーザーがコンテンツ登録を行うルーター
 */
router.post('/registContents', authorizationClass.IsAuthorizationToken, (req, res) => {
    const nowtime = new Date().toFormat("YYYYMMDDHH24MISS");
    const shotName = `img-${req.jwtPayLoad.id}-${nowtime}.jpeg`;
    /**
     * ログイン後ユーザー用のテーブルへコンテンツデータの登録を行うインスタンス
     * @param {object} req - クライアントからのリクエスト
     * @param {string} shotname - URLから取得する画像の名前
     * @param {string} type - ユーザーのタイプ
     * @return {object} - DBに登録したコンテンツデータの内容
     */
    mypageService.propSet = {req: req, shotname: shotName, type:'general'};
    mypageService.createContents()
    .then(result=>{
        res.status(200).json(result);
    })
    .catch(err=>{
        res.status(400).json({message: err});
    });
});

/**
 * ログイン後のユーザーがコンテンツの更新を行うルーター
 */
router.put('/editContents', authorizationClass.IsAuthorizationToken, (req, res)=>{
    const nowtime = new Date().toFormat("YYYYMMDDHH24MISS");
    const shotName = `img-${req.jwtPayLoad.id}-${nowtime}.jpeg`;
    /**
     * ログイン後ユーザー用のテーブルへコンテンツデータの更新を行うインスタンス
     * @param {object} req - クライアントからのリクエスト
     * @param {string} shotname - URLから取得する画像の名前
     * @param {string} type - ユーザーのタイプ
     * @return {object} - DBへ更新したコンテンツデータの内容
     */
    mypageService.propSet = {req: req, shotname: shotName, type:'general'};
    mypageService.updateContents()
    .then(result=>{
        res.status(200).json(result);
    })
    .catch(err=>{
        res.status(400).json({message: err});
    });
});

/**
 * ログイン後のユーザーがコンテンツの削除を行うルーター
 */
router.delete('/deleteContents/:contentsid', authorizationClass.IsAuthorizationToken, (req, res) => {
    /**
     * ログイン後ユーザー用のテーブルからコンテンツデータの削除を行うインスタンス
     * @param {object} req - クライアントからのリクエスト
     * @param {string} shotname - URLから取得する画像の名前
     * @param {string} type - ユーザーのタイプ
     * @return {object} - DBから削除したコンテンツデータの内容
     */
    mypageService.propSet = {req: req, shotname: '', type:'general'};
    mypageService.deleteContents()
    .then(result=>{
        res.status(200).json(result);
    })
    .catch(err=>{
        res.status(400).json({message: err});
    });
});

/**
 * ログインしていないユーザーにコンテンツを表示するルーター
 */
router.get('/guestGetContents', authorizationClass.IsGuestToken, (req, res, next) => {
    /**
     * ゲストユーザー用のテーブルからコンテンツデータの読み込みを行うインスタンス
     * @param {object} req - クライアントからのリクエスト
     * @param {string} shotname - URLから取得する画像の名前
     * @param {string} type - ユーザーのタイプ
     * @return {object} - ゲストユーザーがDBに登録している全てのコンテンツデータ
     */
    mypageService.propSet = {req: req, shotname: '', type:'guest'};
    mypageService.readContents()
    .then(result=>{
        res.status(200).json(result);
    })
    .catch(err=>{
        res.status(400).json({message: err});
    });
});

/**
 *　ログインしていないユーザーがコンテンツの登録を行うルーター
 */
router.post('/guestRegistContents', authorizationClass.IsGuestToken, (req, res, next) => {
    const nowtime = new Date().toFormat("YYYYMMDDHH24MISS");
    const shotName = `guest-img-${req.jwtPayLoad.id}-${nowtime}.jpeg`;
    /**
     * ゲストユーザー用のテーブルへコンテンツデータの登録を行うインスタンス
     * @param {object} req - クライアントからのリクエスト
     * @param {string} shotname - URLから取得する画像の名前
     * @param {string} type - ユーザーのタイプ
     * @return {object} - ゲストユーザーがDBに登録したコンテンツデータの内容
     */
    mypageService.propSet = {req: req, shotname: shotName, type:'guest'};
    mypageService.createContents()
    .then(result=>{
        res.status(200).json(result);
    })
    .catch(err=>{
        res.status(400).json({message: err});
    });
});

/**
 * ログインしていないユーザーがコンテンツの更新を行うルーター
 */
router.put('/guestEditContents', authorizationClass.IsGuestToken, (req, res, next) => {
    const nowtime = new Date().toFormat("YYYYMMDDHH24MISS");
    const shotName = `guest-img-${req.jwtPayLoad.id}-${nowtime}.jpeg`;
    /**
     * ゲストユーザー用のテーブルへコンテンツデータの更新を行うインスタンス
     * @param {object} req - クライアントからのリクエスト
     * @param {string} shotname - URLから取得する画像の名前
     * @param {string} type - ユーザーのタイプ
     * @return {object} - ゲストユーザーがDBへ更新したコンテンツデータの内容
     */
    mypageService.propSet = {req: req, shotname: shotName, type:'guest'};
    mypageService.updateContents()
    .then(result=>{
        res.status(200).json(result);
    })
    .catch(err=>{
        res.status(400).json({message: err});
    });
});

/**
 * ログインしていないユーザーがコンテンツの削除を行うルーター
 */
router.delete('/guestDeleteContents/:contentsid', authorizationClass.IsGuestToken, (req, res, next) => {
    /**
     * ゲストユーザー用のテーブルからコンテンツデータの削除を行うインスタンス
     * @param {object} req - クライアントからのリクエスト
     * @param {string} shotname - URLから取得する画像の名前
     * @param {string} type - ユーザーのタイプ
     * @return {object} - ゲストユーザーがDBから削除したコンテンツデータの内容
     */
    mypageService.propSet = {req: req, shotname: '', type:'guest'};
    mypageService.deleteContents()
    .then(result=>{
        res.status(200).json(result);
    })
    .catch(err=>{
        res.status(400).json({message: err});
    });
});

/**
 * コンテンツ画像の表示を行うルーター
 */
router.get('/images/:name', (req, res, next)=>{
    res.download(`./public/shots/${req.params.name}`, (err) => {
        if(err) {
            res.download(`./public/shots/noimage.png`);
        }
    });
});

module.exports = router;