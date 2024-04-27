import express, { Router } from 'express'
import con from '../utils/db.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import multer from 'multer'
import path from 'path'

const router = express.Router()

// Api pour le login
router.post('/adminlogin', (req, res) => {
    const sql = "SELECT * from admin WHERE email = ? and password = ?";
    con.query(sql, [req.body.email, req.body.password], (err, result) => {
        if (err) return res.json({ loginStatus: false, Error: "Query error" });
        if (result.length > 0) {
            const email = result[0].email;
            const token = jwt.sign(
                { role: "admin", email: email, id: result[0].id }, 
                "jwt_secret_key", 
                { expiresIn: '1d' }
            );
            res.cookie('token', token)
            return res.json({ loginStatus: true });
        } else {
            return res.json({ loginStatus: false, Error: "Wrong email or password" });
        }
    });
});

//Api pour recuperer les categories et les affiches sous forme de tableau dans l'onglet categorie
router.get('/category', (req, res) => {
    const sql = "SELECT * FROM category";
    con.query(sql, (err, result) => {
        if (err) {
            console.error("Query Error:", err);
            return res.status(500).json({Status: false, Error: "Database Query Error"});
        }
        return res.json({Status: true, Result: result});
    });
});

// Api pour ajouter une nouvelle categorie
router.post('/add_category', (req, res) => {
    const sql = "INSERT INTO category (`name`) VALUES (?)";
    con.query(sql, [req.body.category], (err, result) => {
        if (err) {
            console.error("Query Error:", err);
            return res.status(500).json({Status: false, Error: "Database Query Error"});
        }
        return res.json({Status: true});
    });
});

// image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'Public/Images')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname))
    }
})
const upload = multer({
    storage: storage
})
// end image upload

// Api pour ajouter un nouvel employee
router.post('/add_employee',upload.single('image'), (req, res) => {
    const sql = `INSERT INTO employee (name, email, password, address, salary, image, category_id)  VALUES (?)`;
    bcrypt.hash(req.body.password.toString(), 10, (err, hash) => {
        if(err) return res.json({Status: false, Error: "Database Query Error"})
        const values = [
            req.body.name,
            req.body.email,
            hash,
            req.body.address,
            req.body.salary,
            req.file.filename,
            req.body.category_id
        ]
        con.query(sql, [values], (err, result) => {
            if (err) {
                console.error("Query Error:", err);
                return res.status(500).json({Status: false, Error: "Database Query Error"});
            }
            return res.json({Status: true});
        })
    })
})

//Api pour recuperer les employee ajouter et les affiches sous forme de tableau dans l'onglet manage employee
router.get('/employee', (req, res) => {
    const sql = "SELECT * FROM employee";
    con.query(sql, (err, result) => {
        if (err) {
            console.error("Query Error:", err);
            return res.status(500).json({Status: false, Error: "Database Query Error"});
        }
        return res.json({Status: true, Result: result});
    });
});

// API  pour recuperer les informations d'employee pour modification
router.get('/employee/:id', (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM employee WHERE id = ?";
    con.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Query Error:", err);
            return res.status(500).json({Status: false, Error: "Database Query Error"});
        }
        return res.json({Status: true, Result: result});
    });
})

//API pour valider les modifications
router.put('/edit_employee/:id', (req, res) => {
    const id = req.params.id;
    const sql = `UPDATE employee set name= ?, email= ?, salary= ?, address= ?, category_id= ? WHERE id= ?`
    const values = [
        req.body.name,
        req.body.email,
        req.body.salary,
        req.body.address,
        req.body.category_id
    ]
    con.query(sql, [...values, id], (err, result) => {
        if (err) {
            console.error("Query Error:", err);
            return res.status(500).json({Status: false, Error: "Database Query Error"});
        }
        return res.json({Status: true, Result: result});
    });
})

router.delete('/delete_employee/:id', (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM employee where id = ?"
    con.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Query Error:", err);
            return res.status(500).json({Status: false, Error: "Database Query Error"});
        }
        return res.json({Status: true, Result: result});
    });
})

router.get('/admin_count', (req, res) => {
    const sql = "SELECT count(id) as admin FROM admin";
    con.query(sql, (err, result) => {
        if (err) {
            console.error("Query Error:", err);
            return res.status(500).json({Status: false, Error: "Database Query Error"});
        }
        return res.json({Status: true, Result: result});
    });
})

router.get('/employee_count', (req, res) => {
    const sql = "SELECT count(id) as employee FROM employee";
    con.query(sql, (err, result) => {
        if (err) {
            console.error("Query Error:", err);
            return res.status(500).json({Status: false, Error: "Database Query Error"});
        }
        return res.json({Status: true, Result: result});
    });
})

router.get('/salary_count', (req, res) => {
    const sql = "SELECT sum(salary) as salary FROM employee";
    con.query(sql, (err, result) => {
        if (err) {
            console.error("Query Error:", err);
            return res.status(500).json({Status: false, Error: "Database Query Error"});
        }
        return res.json({Status: true, Result: result});
    });
})

router.get('/admin_records', (req, res) => {
    const sql = "SELECT * FROM admin";
    con.query(sql, (err, result) => {
        if (err) {
            console.error("Query Error:", err);
            return res.status(500).json({Status: false, Error: "Database Query Error"});
        }
        return res.json({Status: true, Result: result});
    });
})

router.get('/logout', (req, res) => {
    res.clearCookie('token')
    return res.json({Status: true})
})

export { router as adminRouter }