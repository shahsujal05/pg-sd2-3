const db = require('../services/db');

class Programme {
    // Programme ID
    id;
    // Programme name
    pName;

    constructor(id) {
        this.id = id;
    }

    async getProgrammeName() {
        if (typeof this.pName !== 'string') {
            var sql = "SELECT * FROM Programmes WHERE id = ?";
            const results = await db.query(sql, [this.id]);
            this.pName = results[0].name;
        }
    }
}

module.exports = { Programme };
