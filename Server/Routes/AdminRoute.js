import express, { Router } from 'express'
import con from '../utils/db.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import multer from 'multer'
import path from 'path'

const router = express.Router()

// Api pour le login
router.post('/adminlogin', (req, res) => {
    const sql = "SELECT * FROM admin WHERE email = ?";
    
    // Récupération de l'utilisateur par email
    con.query(sql, [req.body.email], (err, result) => {
        if (err) {
            console.error("Query error:", err);
            return res.json({ loginStatus: false, Error: "Query error" });
        }
        
        if (result.length > 0) {
            const user = result[0];

            // Comparaison des mots de passe
            bcrypt.compare(req.body.password, user.password, (err, isMatch) => {
                if (err) {
                    console.error("Bcrypt error:", err);
                    return res.json({ loginStatus: false, Error: "Password comparison error" });
                }
                
                if (isMatch) {
                    const email = user.email;
                    const token = jwt.sign(
                        { role: "admin", email: email, id: user.id },
                        "jwt_secret_key",
                        { expiresIn: '1d' }
                    );
                    
                    res.cookie('token', token);
                    return res.json({ loginStatus: true, id: user.id });
                } else {
                    // Mot de passe incorrect
                    return res.json({ loginStatus: false, Error: "Wrong email or password" });
                }
            });
        } else {
            // Utilisateur non trouvé
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
            return res.status(500).json({ Status: false, Error: "Database Query Error" });
        }
        return res.json({ Status: true, Result: result });
    });
});

// Api pour ajouter une nouvelle categorie
router.post('/add_category', (req, res) => {
    const sql = "INSERT INTO category (`name`) VALUES (?)";
    con.query(sql, [req.body.category], (err, result) => {
        if (err) {
            console.error("Query Error:", err);
            return res.status(500).json({ Status: false, Error: "Database Query Error" });
        }
        return res.json({ Status: true });
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
router.post('/add_employee', upload.single('image'), (req, res) => {
    const sql = `INSERT INTO employee (name, email, password, address, salary, image, category_id)  VALUES (?)`;
    bcrypt.hash(req.body.password.toString(), 10, (err, hash) => {
        if (err) return res.json({ Status: false, Error: "Database Query Error" })
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
                return res.status(500).json({ Status: false, Error: "Database Query Error" });
            }
            return res.json({ Status: true });
        })
    })
})

// Api pour ajouter un nouvel admin
router.post('/add_admin', async (req, res) => {
    try {
        // Validation des données entrantes
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ Status: false, Error: "Email et mot de passe requis" });
        }

        // Hashage du mot de passe
        const hash = await bcrypt.hash(password.toString(), 10);

        // Insertion des données dans la base
        const sql = `INSERT INTO admin (email, password) VALUES (?, ?)`;
        const values = [email, hash];

        con.query(sql, values, (err, result) => {
            if (err) {
                console.error("Query Error:", err.message);
                return res.status(500).json({ Status: false, Error: "Erreur lors de l'insertion dans la base de données" });
            }

            return res.status(200).json({ Status: true, Result: result });
        });
    } catch (error) {
        console.error("Internal Error:", error.message);
        return res.status(500).json({ Status: false, Error: "Erreur interne du serveur" });
    }
});

//Api pour recuperer les employee ajouter et les affiches sous forme de tableau dans l'onglet manage employee
router.get('/employee', (req, res) => {
    const sql = "SELECT * FROM employee";
    con.query(sql, (err, result) => {
        if (err) {
            console.error("Query Error:", err);
            return res.status(500).json({ Status: false, Error: "Database Query Error" });
        }
        return res.json({ Status: true, Result: result });
    });
});

// API  pour recuperer les informations d'employee pour modification
router.get('/employee/:id', (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM employee WHERE id = ?";
    con.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Query Error:", err);
            return res.status(500).json({ Status: false, Error: "Database Query Error" });
        }
        return res.json({ Status: true, Result: result });
    });
})

// API  pour recuperer les informations d'admin pour modification
router.get('/admin/:id', (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM admin WHERE id = ?";
    con.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Query Error:", err);
            return res.status(500).json({ Status: false, Error: "Database Query Error" });
        }
        return res.json({ Status: true, Result: result });
    });
})

//API pour valider les modifications
router.put('/edit_admin/:id', async (req, res) => {
    const id = req.params.id;
    const { email, password } = req.body;

    try {
        // Hash du mot de passe
        const hashedPassword = await bcrypt.hash(password.toString(), 10);

        const sql = `UPDATE admin SET email = ?, password = ? WHERE id = ?`;
        const values = [email, hashedPassword];

        con.query(sql, [...values, id], (err, result) => {
            if (err) {
                console.error("Query Error:", err.message);
                return res.status(500).json({ Status: false, Error: "Database Query Error" });
            }

            return res.status(200).json({ Status: true, Result: result });
        });
    } catch (error) {
        console.error("Internal Error:", error.message);
        return res.status(500).json({ Status: false, Error: "Erreur interne du serveur" });
    }
});

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
            return res.status(500).json({ Status: false, Error: "Database Query Error" });
        }
        return res.json({ Status: true, Result: result });
    });
})

router.delete('/delete_employee/:id', (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM employee where id = ?"
    con.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Query Error:", err);
            return res.status(500).json({ Status: false, Error: "Database Query Error" });
        }
        return res.json({ Status: true, Result: result });
    });
})

router.delete('/delete_admin/:id', (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM admin where id = ?"
    con.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Query Error:", err);
            return res.status(500).json({ Status: false, Error: "Database Query Error" });
        }
        return res.json({ Status: true, Result: result });
    });
})

// API  pour recuperer les informations d'un service pour modification
router.get('/category/:id', (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM category WHERE id = ?";
    con.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Query Error:", err);
            return res.status(500).json({ Status: false, Error: "Database Query Error" });
        }
        return res.json({ Status: true, Result: result });
    });
})

//API pour valider les modifications
router.put('/edit_category/:id', (req, res) => {
    const id = req.params.id;
    const sql = `UPDATE category set name= ? WHERE id= ?`
    const values = [
        req.body.name
    ]
    con.query(sql, [...values, id], (err, result) => {
        if (err) {
            console.error("Query Error:", err);
            return res.status(500).json({ Status: false, Error: "Database Query Error" });
        }
        return res.json({ Status: true, Result: result });
    });
})

router.delete('/delete_category/:id', (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM category where id = ?"
    con.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Query Error:", err);
            return res.status(500).json({ Status: false, Error: "Database Query Error" });
        }
        return res.json({ Status: true, Result: result });
    });
})

// API  pour recuperer les informations d'un service pour modification
router.get('/profil/:id', (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM admin WHERE id = ?";
    con.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Query Error:", err);
            return res.status(500).json({ Status: false, Error: "Database Query Error" });
        }
        return res.json({ Status: true, Result: result });
    });
})

router.get('/admin_count', (req, res) => {
    const sql = "SELECT count(id) as admin FROM admin";
    con.query(sql, (err, result) => {
        if (err) {
            console.error("Query Error:", err);
            return res.status(500).json({ Status: false, Error: "Database Query Error" });
        }
        return res.json({ Status: true, Result: result });
    });
})

router.get('/employee_count', (req, res) => {
    const sql = "SELECT count(id) as employee FROM employee";
    con.query(sql, (err, result) => {
        if (err) {
            console.error("Query Error:", err);
            return res.status(500).json({ Status: false, Error: "Database Query Error" });
        }
        return res.json({ Status: true, Result: result });
    });
})

router.get('/salary_count', (req, res) => {
    const sql = "SELECT sum(salary) as salary FROM employee";
    con.query(sql, (err, result) => {
        if (err) {
            console.error("Query Error:", err);
            return res.status(500).json({ Status: false, Error: "Database Query Error" });
        }
        return res.json({ Status: true, Result: result });
    });
})

router.get('/admin_records', (req, res) => {
    const sql = "SELECT * FROM admin";
    con.query(sql, (err, result) => {
        if (err) {
            console.error("Query Error:", err);
            return res.status(500).json({ Status: false, Error: "Database Query Error" });
        }
        return res.json({ Status: true, Result: result });
    });
})

router.get('/logout', (res) => {
    res.clearCookie('token')
    return res.json({ Status: true })
})

export { router as adminRouter }