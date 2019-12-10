module.exports = {
    "up": `CREATE TABLE basicusers (
        id INT NOT NULL,
        email VARCHAR(255) COLLATE utf8_unicode_ci NOT NULL,
        name VARCHAR(255) COLLATE utf8_unicode_ci NOT NULL,
        password VARCHAR(255) COLLATE utf8_unicode_ci,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
        )`,
    "down": "DROP TABLE basicusers"
}