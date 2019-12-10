module.exports = {
    "up": `CREATE TABLE users (
        id INT NOT NULL,
        name VARCHAR(255) COLLATE utf8_unicode_ci NOT NULL,
        email VARCHAR(255) COLLATE utf8_unicode_ci NOT NULL,
        usertype VARCHAR(255) COLLATE utf8_unicode_ci NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
        )`,
    "down": "DROP TABLE users"
}