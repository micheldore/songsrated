const mysql = require("mysql");
const pool = mysql.createPool({
    connectionLimit: 1,
    connectTimeout: 60,
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
});

class DatabaseConnector {
    // query with params
    query(sql, params) {
        return new Promise((resolve, reject) => {
            pool.query(sql, params, (err, rows) => {
                if (err) {
                    return reject(err);
                }
                resolve(rows);
            });
        });
    }
}

module.exports = DatabaseConnector;
