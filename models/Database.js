const mysql = require("mysql");
class Database {
    connection = null;
    constructor() {
        this.connection = mysql.createConnection({
            host: process.env.DATABASE_HOST,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME,
        });
    }

    async query(sql, args) {
        this.connection.connect();

        const result = await this.connection.query(sql, args);

        this.connection.end();
    }
}

module.exports = Database;
