const sqlite3 = require('sqlite3');

class DB
{
    constructor(){
        //:memory:
    }

    async open(){
        this.db = new sqlite3.Database('./db/cromos.db', (err) => {
            if (err) {
              return console.error(err.message);
            }
          });
        
        //   await this.exec(`CREATE TABLE cromos (
        //     colecao text not null,
        //     email text not null,
        //     password text not null,
        //     data text not null,
        //     PRIMARY KEY(colecao,email,password))`);
    }
        // this.db.queryAsync = function (...args) {
        //     var that = this;
        //     return new Promise(function (resolve, reject) {
        //       that.all(args, function (error, rows) {
        //         if (error)
        //           reject(error);
        //         else
        //           resolve({ rows: rows });
        //       });
        //     });
        //   };
        // this.db.runAsync = function (sql, params) {
        // var that = this;
        // return new Promise(function (resolve, reject) {
        //     that.run(sql, params, function (error, rows) {
        //     if (error)
        //         reject(error);
        //     else
        //         resolve(true);
        //     });
        // });
        // };
        run(...args) {
            return new Promise((resolve, reject) => {
              if (!this.db) {
                return reject(new Error('Database.run: database is not open'));
              }
              // Need a real function because 'this' is used.
              let callback = function (err) {
                if (err) {
                  reject(err);
                } else {
                  resolve({
                    lastID: this.lastID,
                    changes: this.changes
                  });
                }
              };
              args.push(callback);
              this.db.run.apply(this.db, args);
            });
          }

          queryAsync(...args) {
            return new Promise((resolve, reject) => {
              if (!this.db) {
                return reject(new Error('Database.get: database is not open'));
              }
              let callback = (err, row) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(row);
                }
              };
              args.push(callback);
              this.db.get.apply(this.db, args);
            });
          }
        
          all(...args) {
            return new Promise((resolve, reject) => {
              if (!this.db) {
                return reject(new Error('Database.all: database is not open'));
              }
              let callback = (err, rows) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(rows);
                }
              };
              args.push(callback);
              this.db.all.apply(this.db, args);
            });
          }

          exec(sql) {
            return new Promise((resolve, reject) => {
              if (!this.db) {
                return reject(new Error('Database.exec: database is not open'));
              }
              this.db.exec(sql, (err) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(this);
                }
              });
            });
          }

    async insertAsync(colecao, email, password, data){
        console.log("INSERTING")
        return await this.run(`INSERT INTO cromos
        (colecao,email,password,data) 
        VALUES(?,?,?,?) 
        ON CONFLICT(colecao,email,password) 
        DO UPDATE SET data=excluded.data`, colecao,email,password,data);
    }

    async queryOneAsync(colecao, email, password){

        var sql=`SELECT data
            FROM cromos 
            WHERE colecao=? 
                AND email=?
                AND password=?`
        //console.log(sql)
        var row=await this.queryAsync(sql,colecao,email,password);
        return row;
    }
    

    queryOne(colecao, email, password){

        this.db.serialize(() => {
        var sql=`SELECT data
            FROM cromos 
            WHERE colecao='${colecao}' 
                AND email='${email}' 
                AND password='${password}'`
        //db.each
        this.db.get(sql, (err, row) => {
            if (err) {
                console.error(err.message);
                return null;
            }
            if (row)
                return row;
            else
                return null;
            });
        });
        }
        
        close(fn) {
            if (!this.db) {
              return Promise.reject(new Error('Database.close: database is not open'));
            }
            if (fn) {
              return fn(this)
                .then((result) => {
                  return this.close().then((_) => {
                    return result;
                  });
                })
                .catch((err) => {
                  return this.close().then((_) => {
                    return Promise.reject(err);
                  });
                });
            }
            return new Promise((resolve, reject) => {
              this.db.close((err) => {
                if (err) {
                  reject(err);
                } else {
                  this.db = null;
                  resolve(this);
                }
              });
            });
          }
}

exports.DB=DB;
