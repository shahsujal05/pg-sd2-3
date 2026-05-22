const db = require('../services/db');
const bcrypt = require('bcryptjs');

class User {
    // ID of the user
    id;
    // Email of the user
    email;

    constructor(email) {
        this.email = email;
    }

    // Get existing user ID from email, or return false if not found
    async getIdFromEmail() {
        var sql = "SELECT id FROM Users WHERE Users.email = ?";
        const result = await db.query(sql, [this.email]);
        if (JSON.stringify(result) != '[]') {
            this.id = result[0].id;
            return this.id;
        } else {
            return false;
        }
    }

    // Hash and set password for an existing user
    async setUserPassword(password) {
        const pw = await bcrypt.hash(password, 10);
        var sql = "UPDATE Users SET password = ? WHERE Users.id = ?";
        await db.query(sql, [pw, this.id]);
        return true;
    }

    // Add a brand new user record with hashed password
    async addUser(password) {
        const pw = await bcrypt.hash(password, 10);
        var sql = "INSERT INTO Users (email, password) VALUES (?, ?)";
        const result = await db.query(sql, [this.email, pw]);
        this.id = result.insertId;
        return true;
    }

    // Compare submitted password against stored hashed password
    async authenticate(submitted) {
        var sql = "SELECT password FROM Users WHERE id = ?";
        const result = await db.query(sql, [this.id]);
        const match = await bcrypt.compare(submitted, result[0].password);
        return match === true;
    }
}

module.exports = { User };
