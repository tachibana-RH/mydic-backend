module.exports = {  
    "up": `CREATE TABLE contents (
        id INT NOT NULL,
        user_id INT(11) NOT NULL,
        url TEXT COLLATE utf8_unicode_ci NOT NULL,
        imageurl VARCHAR(255) COLLATE utf8_unicode_ci NOT NULL,
        genre VARCHAR(255) COLLATE utf8_unicode_ci NOT NULL,
        tags VARCHAR(255) COLLATE utf8_unicode_ci NOT NULL,
        title VARCHAR(255) COLLATE utf8_unicode_ci NOT NULL,
        overview TEXT COLLATE utf8_unicode_ci NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
        )`,
    "down": "DROP TABLE contents"
}