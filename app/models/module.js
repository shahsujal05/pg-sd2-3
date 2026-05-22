const db = require('../services/db');

class Module {
    // Module code
    code;
    // Module name
    name;

    constructor(code) {
        this.code = code;
    }

    async getModuleName() {
        if (typeof this.name !== 'string') {
            var sql = "SELECT * FROM Modules WHERE code = ?";
            const results = await db.query(sql, [this.code]);
            this.name = results[0].name;
        }
    }
}

module.exports = { Module };
