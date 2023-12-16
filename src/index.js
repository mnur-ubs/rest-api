import express, { json, urlencoded } from 'express';
import bodyParser from 'body-parser';
import url from 'url';
import querystring from 'querystring';
import db from './database/sqlite.js';
import { body, validationResult } from 'express-validator';
import AuthMiddleware from './middleware/auth.middleware.js';
import jwt from './helper/jwt.helper.js';
import { log } from 'console';
import sha256 from 'sha256';

const app = express();
const PORT = 3000;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(AuthMiddleware);

app.get('/', (req, res) => {
    res.status(200).json({
        status: 200,
        success: true,
        message: 'Welcome to Web Service Univ. Bani Saleh'
    });
});

app.post('/login', [
    body('email', 'Email is required').notEmpty(),
    body('email', 'Email is not valid').isEmail(),
    body('password', 'Password is required').notEmpty(),
], (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        const {email, password} = req.body;
        db.get("SELECT * FROM user WHERE email=?", [email], (err, data) => {
            if (err) {
                if (err) {
                    return res.status(500).json({
                        status: 500,
                        success: false,
                        message: err?.message || 'Internal server error'
                    })
                } 
            } else { 
                if (!data) {
                    return res.status(401).json({
                        status: 401,
                        success: false,
                        message: err?.message || 'User not found'
                    })
                }
                const userPassword = data?.password;
                if (sha256(password) == userPassword) {
                    delete data.password;
                    const [payload, token] = jwt.createToken({
                        data
                    });
                    res.json({ success: true, user: data, access_token: token });
                } else {
                    res.status(401).json({
                        status: 401,
                        success: false, 
                        message: 'Incorrect password'
                    });
                } 
            }
        })
    } else {
        return res.status(422).json({ errors: errors.array() });
    }
});

app.get('/products', (req, res) => {
    const page = parseInt(req.query.page || 1);
    const perPage = parseInt(req.query.perpage || 10);
    const offset = (page - 1) * perPage;

    db.all(`select * from product limit ${perPage} offset ${offset}`, (err, data) => {
        if (err) {
            res.status(500).json({
                status: 500,
                success: false,
                message: err.message
            });
            return;
        } else {
            db.get(`select count(*) as total from product`, (err, count) => {
                res.json({
                    data,
                    totalRows: count.total,
                    page,
                    perPage
                });
            });

        }
    });
})

app.get('/products/:id', (req, res) => {
    const id = req.params.id;
    db.get(`select * from product where id=?`, [id], (err, data) => {
        if (err || !data) {
            res.status(404).json({
                status: 404,
                success: false,
                message: err?.message || 'Data not found'
            })
        } else {
            res.json(data)
        }
    })
})

app.post('/products/', [
    body('title', 'Title has to be filled').notEmpty(),
    body('description', 'Description has to be filled').notEmpty(),
    body('brand', 'Brand has to be filled').notEmpty(),
    body('category', 'Category has to be filled').notEmpty(),
    body('thumbnail', 'Thumbnail has to be filled').notEmpty(),
    body('price', 'Price has to be filled').notEmpty(),
    body('price', 'Price has to be greater than 0').isInt({ min: 0 }),
    body('stock', 'Stock has to be filled').notEmpty(),
    body('stock', 'Stock has to be greater than 0').isInt({ min: 0 })
], (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        const data = req.body;
        const insert = `insert into product (title,description,price,discountPercentage,rating,stock,brand,category,thumbnail,images) values (?,?,?,?,?,?,?,?,?,?)`;
        const params = [
            data.title, data.description, data.price, data.discountPercentage,
            data.rating, data.stock, data.brand, data.category, data.thumbnail, data.images
        ];

        db.run(insert, params, async function (err) {

            if (err) {
                res.status(400).json({ status: 400, success: false, error: err.message })
            } else {
                if (this.changes == 0) {
                    return res.json({ status: 200, success: false, affected: this.changes, message: 'no data inserted', data })
                }
                res.json({ status: 200, success: true, affected: this.changes, message: 'Insert data success', data })
            }
        })
    } else {
        res.status(422).json({ errors: errors.array() })
        return;
    }
})

app.put('/products/:id', [
    body('title', 'Title has to be filled').notEmpty(),
    body('description', 'Description has to be filled').notEmpty(),
    body('brand', 'Brand has to be filled').notEmpty(),
    body('category', 'Category has to be filled').notEmpty(),
    body('thumbnail', 'Thumbnail has to be filled').notEmpty(),
    body('price', 'Price has to be filled').notEmpty(),
    body('price', 'Price has to be greater than 0').isInt({ min: 0 }),
    body('stock', 'Stock has to be filled').notEmpty(),
    body('stock', 'Stock has to be greater than 0').isInt({ min: 0 })
], (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        const id = parseInt(req.params.id);
        db.get(`select * from product where id=?`, [id], (err, data) => {
            if (err || !data) {
                return res.status(404).json({
                    status: 404,
                    success: false,
                    message: err?.message || 'Data not found'
                })
            } else {
                const data = req.body;
                delete data.id;
                const sql = Object.entries(data).map(([key, value]) => `${key}=?`).join(',');
                const params = Object.entries(data).map(([key, value]) => value);
                params.push(id);
                const update = `update product set ${sql} where id=?`;
                db.run(update, params, async function (err) {
                    if (err) {
                        res.status(400).json({ status: 400, success: false, error: err.message })
                    } else {
                        if (this.changes == 0) {
                            return res.json({ status: 200, success: false, affected: this.changes, message: 'no data updated', data })
                        }
                        res.json({ status: 200, success: true, affected: this.changes, message: 'Update data success', data })
                    }
                })
            }
        })
    } else {
        res.status(422).json({ errors: errors.array() })
        return;
    }
})

app.delete('/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    db.run('delete from product where id=?', [id], async function (err) {
        if (err) {
            res.status(400).json({ status: 400, success: false, error: err.message })
        } else {
            if (this.changes == 0) {
                return res.json({ status: 200, success: false, affected: this.changes, message: 'no data deleted' })
            }
            res.json({ status: 200, success: true, affected: this.changes, message: 'Delete data success' })
        }
    })
});

app.listen(PORT, () => {
    console.log('Server running on port', PORT);
})
