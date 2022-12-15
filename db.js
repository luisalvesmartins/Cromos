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
          var r=await this.queryAsync('PRAGMA journal_mode=WAL;');
          try {
            var r=await this.queryAsync("SELECT 1 FROM cromos");
          } catch (error) {
            await this.run(`CREATE TABLE cromos (
                colecao text not null,
                email text not null,
                password text not null,
                data text not null,
                lastupdate text,
                PRIMARY KEY(colecao,email,password))`);
              await this.run(`CREATE TABLE asks (
                colecao text not null,
                row number not null,
                email text not null,
                lastupdate text,
                PRIMARY KEY(colecao,row,email))`);
          }

    }

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

    async insertAsync(colecao, email, password, data){
        console.log("INSERTING")
        return await this.run(`INSERT INTO cromos
        (colecao,email,password,data,lastupdate) 
        VALUES(?,?,?,?,?) 
        ON CONFLICT(colecao,email,password) 
        DO UPDATE SET data=excluded.data`, colecao,email,password,data, Date.now());
    }

    async queryOneAsync(colecao, email, password){
        var sql=`SELECT rowid,data
            FROM cromos 
            WHERE colecao=? 
                AND email=?
                AND password=?`
        //console.log(sql)
        var row=await this.queryAsync(sql,colecao,email,password);
        return row;
    }

    async queryRowAsync(rowId){
      var sql=`SELECT rowid,colecao,data
          FROM cromos 
          WHERE rowid=?`;
      var row=await this.queryAsync(sql,rowId);
      return row;
  }

    async queryColecao(colecao, email){
      var sql=`SELECT rowid,email,data
          FROM cromos 
          WHERE colecao=? 
              AND email<>?`
      //console.log(sql)
      var row=await this.all(sql,colecao,email);
      return row;
  }

  async insertAskAsync(colecao, row, email){
    console.log("INSERTING ASK")
    console.log(colecao, row, email)
    try {
      return await this.run(`INSERT INTO asks(colecao, row, email, lastupdate)
      VALUES(?,?,?,?)`,
      colecao, row, email, Date.now());
    } catch (error) {
      console.log(error);
    }
}

   
}

exports.DB=DB;
