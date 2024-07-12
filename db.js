const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, 'database.db');
const schemaPath = path.resolve(__dirname, 'db_schema.sql');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        console.log('Connected to the SQLite database.');
        initializeDatabase();
    }
});

function initializeDatabase() {
    fs.readFile(schemaPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading schema file:', err);
        } else {
            db.exec(data, (err) => {
                if (err) {
                    console.error('Error initializing database:', err);
                } else {
                    console.log('Database initialized successfully.');
                }
            });
        }
    });
}

module.exports = db;
