module.exports = {
    "up": `ALTER TABLE guestcontents
        MODIFY id INT NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1`,
    "down": ''
}