const Sequelize = require('sequelize');

// Create sequelize instance
const sequelize = new Sequelize('5750kellyfadelsp25_bistrosequelizetemp', '5750kellyfadelsp25', 'A00547972', {
    dialect: 'mysql',
    host: 'is-5750.ckm1cfmd3i4j.us-west-2.rds.amazonaws.com'
});

module.exports = sequelize;


// const mysql = require('mysql2');

// const pool = mysql.createPool({
//     host: 'is-5750.ckm1cfmd3i4j.us-west-2.rds.amazonaws.com',
//     user: '5750kellyfadelsp25',
//     database: '5750kellyfadelsp25_bistrotemp',
//     password: 'A00547972'
// });

// module.exports = pool.promise();