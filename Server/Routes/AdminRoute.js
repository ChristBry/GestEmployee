import express, { Router } from 'express'
import con from '../utils/db.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import multer from 'multer'
import path from 'path'
import { PDFDocument, rgb } from 'pdf-lib';
import fs from 'fs';
import util from 'util'
import { console } from 'inspector'

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
        // Convertir les RowDataPacket en tableau JSON standard
        const formattedResult = JSON.parse(JSON.stringify(result));

        return res.json({ Status: true, Result: formattedResult });
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
    const sql = `INSERT INTO employee (name, email, password, poste, address, salary, image, category_id)  VALUES (?)`;
    bcrypt.hash(req.body.password.toString(), 10, (err, hash) => {
        if (err) return res.json({ Status: false, Error: "Database Query Error" })
        const values = [
            req.body.name,
            req.body.email,
            hash,
            req.body.poste,
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

        // Convertir les RowDataPacket en tableau JSON standard
        const formattedResult = JSON.parse(JSON.stringify(result));
        return res.json({ Status: true, Result: formattedResult });
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

// API  pour recuperer les informations d'employee pour modification
router.get('/payment:id', (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM salary_history WHERE employee_id = ?";
    con.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Query Error:", err);
            return res.status(500).json({ Status: false, Error: "Database Query Error" });
        }
        return res.json({ Status: true, Result: result });
    });
})

router.post('/payment_extra', (req, res) => {
    const sql = `INSERT INTO salary_history (employee_id, salary_amount, salary_type, raison) VALUES (?, ?, ?, ?)`
    const values = [
        req.body.employee_id,
        req.body.salary_amount,
        req.body.salary_type,
        req.body.raison
    ]
    con.query(sql, values, (err, result) => {
        if (err) {
            console.error("Query Error:", err);
            return res.status(500).json({ Status: false, Error: "Database Query Error" });
        }
        return res.json({ Status: true, Result: result });
    })
})

router.post('/payment_salaire', (req, res) => {
    const sql = `INSERT INTO salary_history (employee_id, salary_amount, salary_type, raison) VALUES (?, ?, ?, ?)`
    const values = [
        req.body.employee_id,
        req.body.salary_amount,
        req.body.salary_type,
        req.body.reason
    ]
    con.query(sql, values, (err, result) => {
        if (err) {
            console.error("Query Error:", err);
            return res.status(500).json({ Status: false, Error: "Database Query Error" });
        }
        return res.json({ Status: true, Result: result });
    })
})

router.post('/generate_pdf', async (req, res) => {
    const employee = req.body.employee;
    const payments = req.body.payment;
    console.log(payments)
    try {

        const imagePath = './Logos_afrijet.png'
        const imageBytes = fs.readFileSync(imagePath)
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 800]);

        // Titre
        const image = await pdfDoc.embedPng(imageBytes)
        page.drawImage(image, { x: 50, y: 740, width: 100, height: 50 })
        page.drawText('Historique des Paiements', {
            x: 200,
            y: 760,
            size: 18,
            color: rgb(0, 0, 0),
        });

        // Informations sur l'employé
        page.drawText(`Nom de l'employé : ${employee.name}`, { x: 50, y: 720, size: 12 });
        page.drawText(`Poste : ${employee.poste}`, { x: 50, y: 700, size: 12 });

        // En-tête du tableau
        const tableStartY = 660;
        let currentY = tableStartY;

        page.drawText('Date', { x: 50, y: currentY, size: 12, fontWeight: 'bold' });
        page.drawText('Type de Paiement', { x: 200, y: currentY, size: 12 });
        page.drawText('Montant (FCFA)', { x: 400, y: currentY, size: 12 });

        // Ligne de séparation
        currentY -= 20;
        page.drawLine({ start: { x: 50, y: currentY }, end: { x: 550, y: currentY }, thickness: 1 });

        // Contenu du tableau
        for (const payment of payments) {
            currentY -= 20; // Descendre d'une ligne

            if (currentY < 50) {
                // Si la position est trop basse, ajouter une nouvelle page
                const page = pdfDoc.addPage([600, 800]);
                currentY = 760; // Réinitialiser la position sur la nouvelle page
            }

            page.drawText(payment.effective_date, { x: 50, y: currentY, size: 12 });
            page.drawText(payment.salary_type, { x: 240, y: currentY, size: 12 });
            page.drawText(payment.salary_amount.toString(), { x: 400, y: currentY, size: 12 });
        }


        // Sauvegarde du fichier PDF
        const pdfBytes = await pdfDoc.save();
        fs.writeFileSync('test.pdf', pdfBytes);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="payment_history_${employee.name}.pdf"`,
        });
        res.send(pdfBytes);
    } catch (err) {
        console.error('Erreur lors de la génération du PDF :', err);
        res.status(500).send('Erreur lors de la génération du PDF');
    }
});

router.post('/salary_payment', (req, res) => {
    const { employee_id, reason } = req.body; // Récupération des paramètres dans le corps

    const sql = "SELECT * FROM salary_history WHERE employee_id = ? AND raison = ?";
    const values = [employee_id, reason];

    con.query(sql, values, (err, result) => {
        if (err) {
            console.error("Query Error:", err);
            return res.status(500).json({ Status: false, Error: "Database Query Error" });
        }
        res.json({ Status: true, Result: result });
    });
});

router.post('/payslip_pdf', async (req, res) => {
    const employee = req.body.employee;
    const payments = req.body.payment
    const imagePath = './Logos_afrijet.png'
    const imageBytes = fs.readFileSync(imagePath)
    try {
        const salaryBase = payments.salary_amount; // Salaire de base
        const cnpsRate = 0.15; // Taux CNPS
        const taxRate = 0.1; // Taux d'impôt sur salaire

        const cnpsDeduction = salaryBase * cnpsRate;
        const taxDeduction = salaryBase * taxRate;
        const salaryNet = salaryBase - cnpsDeduction - taxDeduction;

        // Créer le PDF
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 800]);

        // Titre
        page.drawText('Fiche de Paie', {
            x: 250,
            y: 760,
            size: 18,
            color: rgb(0, 0, 0),
        });

        // Informations sur l'employé
        const image = await pdfDoc.embedPng(imageBytes);
        page.drawImage(image, { x: 50, y: 740, width: 100, height: 50 });
        page.drawText(`Entreprise : Afrijet Business Service`, { x: 50, y: 720, size: 12 });
        page.drawText(`Mois : ${payments.raison}`, { x: 50, y: 700, size: 12 });
        page.drawText(`Nom de l'employé : ${employee.name}`, { x: 50, y: 680, size: 12 });
        page.drawText(`Poste : ${employee.poste}`, { x: 50, y: 660, size: 12 });
        page.drawText(`Repartition du salaire`, { x: 250, y: 630, size: 14 });

        // Informations sur le salaire
        page.drawText(`La repartion du salaire de ${employee.name} se fait comme suit :`, { x: 50, y: 610, size: 12 });
        page.drawText(`Salaire de base = ${salaryBase} FCFA`, { x: 70, y: 590, size: 12 });
        page.drawText(`Cotisation CNPS (15%) = ${cnpsDeduction} FCFA`, { x: 70, y: 570, size: 12 });
        page.drawText(`Impôt sur salaire (10%) = ${taxDeduction} FCFA`, { x: 70, y: 550, size: 12 });
        page.drawText(`Salaire net = ${salaryNet} FCFA`, { x: 70, y: 530, size: 12 });

        page.drawText(`Direction`, { x: 400, y: 460, size: 12 });
        page.drawLine({ start: { x: 400, y: 455 }, end: { x: 450, y: 455 }, thickness: 1 });
        // Ligne de séparation
        let currentY = 1000;
        page.drawLine({ start: { x: 50, y: currentY }, end: { x: 550, y: currentY }, thickness: 1 });

        // Sauvegarder le fichier PDF
        const pdfBytes = await pdfDoc.save();
        fs.writeFileSync('payslip.pdf', pdfBytes);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="payment_history_${employee.name}.pdf"`,
        });
        res.send(pdfBytes);
    } catch (err) {
        console.error('Erreur lors de la génération du PDF :', err);
        res.status(500).send('Erreur lors de la génération du PDF');
    }
});

router.get('/logout', (res) => {
    res.clearCookie('token')
    return res.json({ Status: true })
})

export { router as adminRouter }