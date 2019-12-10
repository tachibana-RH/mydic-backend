/**
 * @file ユーザー情報の管理を行うJSファイル
 */

const express = require('express');
const router = express.Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const mysqlModules = require('../mysqlmodules/models');

const authorizationClass = require('../class/authrizationClass');
const authorizationService = new authorizationClass();

const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
      user: process.env.SENDER_EMAIL_ADDRESS,
      pass: process.env.SENDER_EMAIL_PASSWORD
    }
});

/**
 * 新規登録者のメールアドレスにトークン付きのURLを送信するルーター
 */
router.post('/signup', (req,res)=>{
    mysqlModules.Users.query({where: {email: req.body.email}}).fetch()
    .then(()=>{
        res.status(400).json({message:'既に登録されているメールアドレスです。'});
    })
    .catch(()=>{
        /* 登録されていないメールアドレスだった場合DBへ登録し、
         * トークンの作成とそのトークンを含めたURLをメールで送信する*/
        new mysqlModules.Users({
            name: req.body.name,
            email: req.body.email,
            usertype: 'general'
        })
        .save()
        .then((result) => {
            const token = authorizationService.generateToken(result.attributes.name, result.attributes.id);
            const mailOptions = {
                from: process.env.SENDER_EMAIL_ADDRESS,
                to: req.body.email,
                subject: 'ユーザー登録に関してのご連絡【mydic運営】',
                html: `<br>
                ご登録ありがとうございます。<br>
                下記のURLからパスワードの設定をよろしくお願いいたします。<br>
                ※安全性の問題から登録期限は受信から2時間以内とさせていただいております。<br>
                ${process.env.NODE_CLIENT_ORIGIN}/psregistration/${token}`
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    mysqlModules.Users.query({where: {email: req.body.email}}).fetch()
                    .then((result)=>{
                        result.destroy();
                        res.status(400).json({message:'メールを送信できませんでした。<br>お手数ですが再度のご登録をよろしくお願いします。'});
                    });
                } else {
                    res.status(200).json({message: 'ご登録いただいたアドレスへ<br>メールを送信しました。'});
                }
            });
        })
        .catch(err=>{
            res.status(400).json({message: err});
        });
    });
});

const bcrypt = require('bcrypt');
const rounds = 10;
/**
 * 新規登録者のパスワード登録を行うルーター
 */
router.post('/pwregist', authorizationClass.IsPwToken, (req, res)=>{
    /* 登録されたパスワードを暗号化してDBへ保存する*/
    bcrypt.hash(req.body.password, rounds)
    .then((hashedPassword) => {
        mysqlModules.BasicUsers.query({where: {id: req.jwtPayLoad.id}})
        .fetch()
        .then(user => user.set('password', hashedPassword))
        .then(user => user.update())
        .then(result=>{
            res.status(200).json({message: 'パスワードが登録されました。ログインしてください。'});
        })
        .catch(err=>{
            console.log(err);
            res.status(400).json({message: err});
        });
    });
});

/**
 * ベーシック認証を行ったユーザーへトークンを返却するルーター
 */
router.post('/basic', authorizationClass.IsGuestToken, (req, res)=>{
    mysqlModules.BasicUsers.query({where: {email: req.body.email}})
    .fetch()
    .then((result)=>{
        /* 送信されてきたパスワードと複合したパスワードを照らし合わせる*/
        bcrypt.compare(req.body.password, result.attributes.password, (err, chkresult)=>{
            if (chkresult) {
                /* トークンを生成してクライアントへ返す */
                const token = authorizationService.generateToken(result.attributes.name, result.attributes.email);
                res.status(200).json({token: token});
            } else {
                res.status(401).json({message: 'パスワードに誤りがあります。'});
            }
        });
    })
    .catch((err)=>{
        res.status(401).json({message: 'メールアドレスに誤りがあります。'});
    });
});

// OAuth認証用のJWT(Google)
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_AUTH_CLIENTID,
    clientSecret: process.env.GOOGLE_AUTH_CLIENTSECRET,
    callbackURL: process.env.GOOGLE_AUTH_CALLBACKURL,
    scope: ['email', 'profile']
}, (accessToken, refreshToken, profile, done) => {
    // ここで profile を確認して結果を返す
    if (profile) {
        return done(null, profile);
    } else {
        return done(null, false);
    }
}
));

/**
 * ソーシャルログイン（Google認証）を行ったユーザーを認証ページへリダイレクトするルーター
 */
router.get('/google', passport.authenticate('google', {
    scope: ['email', 'profile'], session: false
}));

/**
 * ソーシャルログイン（Google認証）を行ったユーザーへトークンを返却するルーター
 */
router.get('/google/callback',
    passport.authenticate('google',
    {
        session: false,
        failureRedirect: `${process.env.NODE_CLIENT_ORIGIN}/#/mypage`,
        failureMessage: true
    }
    ),
    (req, res) => {
        /* トークンを生成してクライアントへ返す */
        authorizationService.propSet = {userInfo: req.user};
        authorizationService.generateUserInfo()
        .then(token=>{
            res.redirect(`${process.env.NODE_CLIENT_ORIGIN}/#/mypage/${token}`);
        })
        .catch(err=>{
            console.log(err);
            res.status(400).json({message: err});
        });
    }
);

// OAuth認証用のJWT(GitHub)
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_AUTH_CALLBACKURL,
    scope: ['user:email']
  },
  (accessToken, refreshToken, profile, done) => {
    if (profile) {
        return done(null, profile);
    } else {
        return done(null, false);
    }
  }
));

/**
 * ソーシャルログイン（Github認証）を行ったユーザーを認証ページへリダイレクトするルーター
 */
router.get('/github',
    passport.authenticate('github',{scope: ['user:email']}));

/**
 * ソーシャルログイン（Github認証）を行ったユーザーへトークンを返却するルーター
 */
router.get('/github/callback', 
    passport.authenticate('github',
    {
        session: false,
        failureRedirect: `${process.env.NODE_CLIENT_ORIGIN}/#/mypage`,
        failureMessage: true
    }
    ),
    (req, res) => {
        /* トークンを生成してクライアントへ返す */
        authorizationService.propSet = {userInfo: req.user};
        authorizationService.generateUserInfo()
        .then(token=>{
            res.redirect(`${process.env.NODE_CLIENT_ORIGIN}/#/mypage/${token}`);
        })
        .catch(err=>{
            console.log(err);
            res.status(400).json({message: err});
        });
    }
);

const crypto = require('crypto');
const N = 24;

/**
 * ゲストユーザーへトークンを返却するルーター
 */
router.post('/guestlogin', (req, res) => {
    let guesttoken = crypto.randomBytes(N).toString('base64').substring(0, N);
    new mysqlModules.GuestUsers({token: guesttoken})
    .save()
    .then((result) => {
        guesttoken = authorizationService.generateGuestToken(result.attributes.id);
        res.status(200).json({token: guesttoken});
    })
    .catch(err=>{
        res.status(400).json({message: err});
    });
});

module.exports = router;

// Basic認証用のJWT
// const JwtStrategy = require('passport-jwt').Strategy;
// const ExtractJwt = require('passport-jwt').ExtractJwt;
// const opts = {
//     jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//     secretOrKey: publickey,
//     session: false,
//     jsonwebtoken: {
//         algorithm: 'RS256'
//     }
// };
// passport.use(new JwtStrategy(opts,(payload, done)=>{
//     if (payload) {
//         return done(null, payload);
//     } else {
//         return done(null, false);
//     }
// }));