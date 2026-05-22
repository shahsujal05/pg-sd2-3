const db = require('../services/db');
const { Programme } = require('./programme');
const { Module } = require('./module');

class Student {
    // Student ID
    id;
    // Student name
    name;
    // Student note
    note;
    // Student programme (a Programme object)
    programme;
    // Student modules (array of Module objects)
    modules = [];

    constructor(id) {
        this.id = id;
    }

    // Get name and note from the Students table
    async getStudentDetails() {
        if (typeof this.name !== 'string') {
            var sql = "SELECT * FROM Students WHERE id = ?";
            const results = await db.query(sql, [this.id]);
            this.name = results[0].name;
            this.note = results[0].note;
        }
    }

    // Get the student's programme
    async getStudentProgramme() {
        var sql = "SELECT p.* FROM Programmes p \
                   JOIN Student_Programme sp ON sp.programme = p.id \
                   WHERE sp.id = ?";
        const results = await db.query(sql, [this.id]);
        if (results.length > 0) {
            var prog = new Programme(results[0].id);
            prog.pName = results[0].name;
            this.programme = prog;
        }
    }

    // Get the student's modules via their programme
    async getStudentModules() {
        if (this.programme) {
            var sql = "SELECT m.* FROM Modules m \
                       JOIN Programme_Modules pm ON pm.module = m.code \
                       WHERE pm.programme = ?";
            const results = await db.query(sql, [this.programme.id]);
            this.modules = [];
            for (var row of results) {
                var mod = new Module(row.code);
                mod.name = row.name;
                this.modules.push(mod);
            }
        }
    }

    // Add or update a note for this student
    async addStudentNote(note) {
        var sql = "UPDATE Students SET note = ? WHERE Students.id = ?";
        const result = await db.query(sql, [note, this.id]);
        this.note = note;
        return result;
    }

    // Delete the student's current programme assignment
    async deleteStudentProgramme() {
        var sql = "DELETE FROM Student_Programme WHERE id = ?";
        const result = await db.query(sql, [this.id]);
        this.programme = null;
        return result;
    }

    // Insert a new programme assignment
    async addStudentProgramme(programmeId) {
        var sql = "INSERT INTO Student_Programme (id, programme) VALUES (?, ?)";
        const result = await db.query(sql, [this.id, programmeId]);
        this.programme = programmeId;
        return result;
    }

    // Update the student's programme (delete old, add new)
    async updateStudentProgramme(programmeId) {
        await this.getStudentProgramme();
        if (this.programme) {
            await this.deleteStudentProgramme();
        }
        await this.addStudentProgramme(programmeId);
    }
}

module.exports = { Student };
