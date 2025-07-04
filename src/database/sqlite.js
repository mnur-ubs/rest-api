import sqlite3 from 'sqlite3';
import sha256 from 'sha256';

const DBSOURCE = "db.sqlite";
sqlite3.verbose();

let db = new sqlite3.Database(DBSOURCE, err => {
    if (err) {
        // Cannot open database
        console.error(err.message)
        throw err
    } else {
        console.log('Connected to the SQLite database.')
        db.run(`CREATE TABLE user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT, 
            email TEXT UNIQUE, 
            password TEXT, 
            CONSTRAINT email_unique UNIQUE (email)
            )`,
            (err) => {
                if (err) {
                    // Table already created
                    console.log('Error on create table user', err.message);
                    return
                } else {
                    // Table just created, creating some rows
                    var insert = 'INSERT INTO user (name, email, password) VALUES (?,?,?)'
                    db.run(insert, ["admin", "admin@example.com", sha256("P@ssw0rd")])
                    db.run(insert, ["user", "user@example.com", sha256("P@ssw0rd")])
                }
            });
        console.log('Continue create table products');
        db.run(`CREATE TABLE product (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT,
                description TEXT,
                price REAL,
                discountPercentage REAL,
                rating REAL,
                stock INTEGER,
                brand TEXT,
                category TEXT,
                thumbnail TEXT,
                images TEXT,
                CONSTRAINT title_unique UNIQUE (title)
            )`, err => {
            if (err) {
                console.log('Error on create table product', err.message);
                return
            } else {
                var insert = `INSERT INTO product (title, description, price, discountPercentage,rating, stock,brand,category,thumbnail,images) 
                VALUES (?,?,?,?,?,?,?,?,?,?)`;
                db.run(insert, ["iPhone 9", "An apple mobile which is nothing like apple", 549, 12.96, 4.69, 94, "Apple", "smartphones", "https://i.dummyjson.com/data/products/1/thumbnail.jpg", "https://i.dummyjson.com/data/products/1/1.jpg"]);
                db.run(insert, ["iPhone X", "SIM-Free, Model A19211 6.5-inch Super Retina HD display with OLED technology A12 Bionic chip with ...", 899, 17.94, 4.44, 34, "Apple", "smartphones", "https://i.dummyjson.com/data/products/2/thumbnail.jpg", "https://i.dummyjson.com/data/products/2/1.jpg"])
                db.run(insert, ["Samsung Universe 9", "Samsung's new variant which goes beyond Galaxy to the Universe", 1249, 15.46, 4.09, 36, "Samsung", "smartphones", "https://i.dummyjson.com/data/products/3/thumbnail.jpg", "https://i.dummyjson.com/data/products/3/1.jpg"]);
                db.run(insert, ["OPPOF19", "OPPO F19 is officially announced on April 2021.", 280, 17.91, 4.3, 123, "OPPO", "smartphones", "https://i.dummyjson.com/data/products/4/thumbnail.jpg", "https://i.dummyjson.com/data/products/4/1.jpg"]);
                db.run(insert, ["Huawei P30", "Huawei’s re-badged P30 Pro New Edition was officially unveiled yesterday in Germany and now the device has made its way to the UK.", 499, 10.58, 4.09, 32, "Huawei", "smartphones", "https://i.dummyjson.com/data/products/5/thumbnail.jpg", "https://i.dummyjson.com/data/products/5/1.jpg"]);
            }
        })
    }
});

export default db;

