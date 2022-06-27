const { Sequelize } = require("sequelize")



module.exports = new Sequelize(
  'd1t0b7b7tb7u12',
  'hvpakdxsrzwyam',
  'b04516f0f18cf5eba56d664850d5d7a4587cead7a632b89ec335bf3cc951e110',
  {
    host: '34.247.72.29',
    port: '5432',
    dialect: 'postgres',
    define: {
      timestamps: false
    },
    dialectOptions: {
      ssl: {
          rejectUnauthorized: false
      }
    }
  },
)
