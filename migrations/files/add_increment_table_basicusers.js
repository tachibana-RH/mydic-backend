module.exports = {
    "up": `ALTER TABLE basicusers
        MODIFY id INT NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1`,
    "down": ''
}