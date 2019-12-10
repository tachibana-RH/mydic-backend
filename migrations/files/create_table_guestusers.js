module.exports = {
    "up": `CREATE TABLE guestusers (
        id INT NOT NULL,
        token VARCHAR(255) COLLATE utf8_unicode_ci,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
        )`,
    "down": "DROP TABLE guestusers"
}