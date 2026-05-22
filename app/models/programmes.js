const db = require('../services/db');
const { Programme } = require('./programme');

async function getAllProgrammes() {
    var sql = "SELECT * FROM Programmes";
    const results = await db.query(sql);
    var rows = [];
    for (var row of results) {
        var prog = new Programme(row.id);
        await prog.getProgrammeName();
        rows.push(prog);
    }
    return rows;
}

module.exports = { getAllProgrammes };
