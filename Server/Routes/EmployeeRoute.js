import express, { Router } from 'express'
import con from '../utils/db.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { PDFDocument, rgb } from 'pdf-lib';
import fs from 'fs';

const router = express.Router()

// Api pour le login
router.post('/employee_login', (req, res) => {
    const sql = "SELECT * from employee WHERE email = ?";
    con.query(sql, [req.body.email], (err, result) => {
        if (err) return res.json({ loginStatus: false, Error: "Query error" });
        if (result.length > 0) {
            bcrypt.compare(req.body.password, result[0].password, (err, response) => {
                if (err) return res.json({ loginStatus: false, Error: "Wrong Password" });
                if (response) {
                    const email = result[0].email;
                    const token = jwt.sign(
                        { role: "employee", email: email, id: result[0].id }, 
                        "jwt_secret_key", 
                        { expiresIn: '1d' }
                    );
                    res.cookie('token', token)
                    return res.json({ loginStatus: true, id: result[0].id});
                }
            })

        } else {
            return res.json({ loginStatus: false, Error: "Wrong email or password" });
        }
    });
});

router.get('/employee_detail/:id', (req, res) => {
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
        const image = await pdfDoc.embedPng(imageBytes)
        page.drawImage(image, {x: 50, y: 740, width: 100, height: 50})
        page.drawText('Fiche de Paie', {
            x: 200,
            y: 760,
            size: 18,
            color: rgb(0, 0, 0),
        });

        // Informations sur l'employé
        page.drawText(`Entreprise : Institut Universitaire de la Cote`, { x: 50, y: 720, size: 12 });
        page.drawText(`Mois : ${payments.raison}`, { x: 50, y: 700, size: 12 });
        page.drawText(`Nom de l'employé : ${employee.name}`, { x: 50, y: 680, size: 12 });
        page.drawText(`Poste : ${employee.poste}`, { x: 50, y: 660, size: 12 });
        page.drawText(`Repartition du salaire`, { x: 200, y: 630, size: 14 });

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
        fs.writeFileSync(`payslip_${employee.name}.pdf`, pdfBytes);
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

router.get('/logout', (req, res) => {
    res.clearCookie('token')
    return res.json({Status: true})
})

export { router as EmployeeRouter }
