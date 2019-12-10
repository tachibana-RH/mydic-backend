/**
 * @file DB接続用のモデル定義を行う設定ファイル
 */

const mysql = require('mysql');
if (process.env.NODE_ENV.trim() === 'development') {
    require('dotenv').config();
}

const opts = {
    host    : process.env.NODE_DB_HOST,
    user    : process.env.NODE_DB_USER,
    password: process.env.NODE_DB_PASSWORD,
    database: process.env.NODE_DB_NAME,
    charset : 'utf8'
}

const knex = require('knex') ({
    client: 'mysql',
    connection: opts
});

const Bookshelf = require('bookshelf')(knex);
// Bookshelf.plugin('pagination');
// Bookshelf.plugin('registry');
// Bookshelf.plugin('bookshelf-transaction-manager');
Bookshelf.plugin('bookshelf-update');

const Contents = Bookshelf.Model.extend({
    tableName: 'contents',
    hasTimestamps: true
});

const Users = Bookshelf.Model.extend({
    tableName: 'users',
    hasTimestamps: true,
    contents: function() {
        return this.belongsToMany(Contents);
    }
});

const BasicUsers = Bookshelf.Model.extend({
    tableName: 'basicusers',
    hasTimestamps: true
});

const GuestContents = Bookshelf.Model.extend({
    tableName: 'guestcontents',
    hasTimestamps: true
});

const GuestUsers = Bookshelf.Model.extend({
    tableName: 'guestusers',
    hasTimestamps: true,
    guestcontents: function() {
        return this.belongsToMany(GuestContents);
    }
});

module.exports.opts = opts;
module.exports.Users = Users;
module.exports.Contents = Contents;
module.exports.BasicUsers = BasicUsers;
module.exports.GuestUsers = GuestUsers;
module.exports.GuestContents = GuestContents;