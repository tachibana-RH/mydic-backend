module.exports = {
    "up": `ALTER TABLE users
        MODIFY id INT NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1`,
    "down": ''
}