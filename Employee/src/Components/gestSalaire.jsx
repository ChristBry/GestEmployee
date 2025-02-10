import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import './Style.css'

const gestSalaire = () => {
    const [employee, setEmployee] = useState([])
    const [isPaySlip, setIsPaySlip] = useState(false)
    const [isPaymentVisible, setIsPaymentVisible] = useState(false)
    const [isPaymentPopUp, setIsPaymentPopUp] = useState(false)
    const [user, setUser] = useState(null)
    const [ID, setID] = useState(null)
    const [reason, setReason] = useState(null)
    const [paymentData, setPaymentData] = useState([]);
    useEffect(() => {
        axios.get('http://localhost:3000/auth/employee')
            .then(result => {
                if (result.data.Status) {
                    setEmployee(result.data.Result);
                } else {
                    alert(result.data.Error)
                }
            }).catch(err => console.log(err))
    }, [])
    const popUpGestion = (employeeId, salary) => {
        setIsPaymentVisible(true)
        const employee = {
            employee_id: employeeId,
            salary_amount: salary,
            salary_type: 'Salaire',
        }
        setUser(employee)
        setID(employeeId)
    }
    const payment = () => {
        axios.post('http://localhost:3000/auth/payment_salaire', { ...user, reason })
            .then(result => {
                if (result.data.Status) {
                    setIsPaymentPopUp(false)
                } else {
                    alert(result.data.Error)
                }
            })
            .catch(err => console.log(err))
    }
    const popUpSalaire = () => {
        setIsPaymentPopUp(true);
        setIsPaymentVisible(false)
    }
    const popUpPaySlip = () => {
        setIsPaySlip(true);
        // setIsPaymentVisible(false)
    }
    const closeModal = () => {
        setIsPaymentVisible(false);
    }
    const generateHistory = async (id) => {
        try {
            console.log("ID employé :", id);

            // Récupération des informations de l'employé
            const employeeResponse = await axios.get('http://localhost:3000/auth/employee/' + id);
            if (employeeResponse.data.Status) {
                const employee = employeeResponse.data.Result[0];
                console.log("Données de l'employé :", employee);
            } else {
                alert("Erreur lors de la récupération des informations de l'employé : " + employeeResponse.data.Error);
                return;
            }

            // Récupération des paiements
            const paymentResponse = await axios.get('http://localhost:3000/auth/payment' + id);
            if (paymentResponse.data.Status) {
                const payment = paymentResponse.data.Result;
                setPaymentData(payment); // Mettre à jour les données des paiements
                console.log("Données des paiements :", payment);
            } else {
                alert("Erreur lors de la récupération des paiements : " + paymentResponse.data.Error);
                return;
            }

            // Génération du PDF
            const pdfResponse = await axios.post(
                'http://localhost:3000/auth/generate_pdf',
                { employee: employeeResponse.data.Result[0], payment: paymentResponse.data.Result },
                { responseType: 'arraybuffer' } // Récupérer le PDF sous forme de buffer
            );

            console.log("Réponse PDF :", pdfResponse);
            console.log("Type de données PDF :", typeof pdfResponse.data);
            console.log("Taille du buffer :", pdfResponse.data.byteLength);

            // Télécharger le PDF
            const pdfBlob = new Blob([new Uint8Array(pdfResponse.data)], { type: 'application/pdf' });
            const pdfURL = URL.createObjectURL(pdfBlob);
            /* window.open(pdfURL);
            const link = document.createElement('a');
            link.href = pdfURL;
            link.download = `historique_${employeeResponse.data.Result[0].name}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link); */
        } catch (error) {
            console.error("Erreur :", error);
            alert("Une erreur s'est produite lors du traitement.");
        }
    };

    const generatePaySlip = async () => {
        try {
            console.log("ID employé :", ID)

            // Récupération des informations de l'employé
            const employeeResponse = await axios.get('http://localhost:3000/auth/employee/' + ID);
            if (employeeResponse.data.Status) {
                const employee = employeeResponse.data.Result[0];
                console.log("Données de l'employé :", employee);
            } else {
                alert("Erreur lors de la récupération des informations de l'employé : " + employeeResponse.data.Error);
                return;
            }

            // Construction du corps de la requête
            const requestBody = {
                employee_id: ID,  // Assurez-vous d'envoyer l'ID de l'employé
                reason: reason     // Le motif envoyé dans le corps de la requête
            };

            // Effectuer la requête POST avec axios
            const paymentResponse = await axios.post('http://localhost:3000/auth/salary_payment', requestBody);

            console.log("Motif de la requête:", requestBody); // Vérification du motif

            // Vérification du statut de la réponse
            if (paymentResponse.data.Status) {
                const payment = paymentResponse.data.Result;
                setPaymentData(payment); // Mettre à jour les données des paiements
                console.log("Données des paiements :", payment); // Log pour vérifier les données récupérées
            } else {
                // En cas d'erreur dans la réponse
                alert("Erreur lors de la récupération des paiements : " + paymentResponse.data.Error);
            }

        // Génération du PDF
        const pdfResponse = await axios.post(
            'http://localhost:3000/auth/payslip_pdf',
            { employee: employeeResponse.data.Result[0], payment: paymentResponse.data.Result[0] },
            { responseType: 'arraybuffer' } // Récupérer le PDF sous forme de buffer
        );

        console.log("Réponse PDF :", pdfResponse);
        console.log("Type de données PDF :", typeof pdfResponse.data);
        console.log("Taille du buffer :", pdfResponse.data.byteLength);

        // Télécharger le PDF
        const pdfBlob = new Blob([new Uint8Array(pdfResponse.data)], { type: 'application/pdf' });
        const pdfURL = URL.createObjectURL(pdfBlob);
        /* window.open(pdfURL);
        const link = document.createElement('a');
        link.href = pdfURL;
        link.download = `fiche de paie ${employeeResponse.data.Result[0].name}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link); */
    } catch (error) {
        console.error("Erreur :", error);
        alert("Une erreur s'est produite lors du traitement.");
    }
};

return (
    <div className='px-5 mt-3'>
        <div className='d-flex justify-content-center'>
            <h2 className='fs-4 mt-2 small'>Gestion de la paie</h2>
        </div>
        <div className='mt-3'>
            <table className='table'>
                <thead>
                    <tr>
                        <th className='w-25 text-center'>Photo</th>
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Poste</th>
                        <th>Salaire de base</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {
                        employee.map(e => (
                            <tr className=''>
                                <td><img src={`http://localhost:3000/Images/` + e.image} className='employee_image w-25 h-25'></img></td>
                                <td className='pt-4'>{e.name}</td>
                                <td className='pt-4'>{e.email}</td>
                                <td className='pt-4'>{e.poste}</td>
                                <td className='pt-4'>{e.salary} FCFA</td>
                                <td className='pt-4'>
                                    <Link className='me-2 pt-4' onClick={() => popUpGestion(e.id, e.salary)}>Gérer la paie</Link>
                                    <Link onClick={() => generateHistory(e.id)} className='me-2 mx-2 pt-4 text-warning'>Historique</Link>
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </div>
        {isPaymentVisible && (
            <div className="modal d-block" tabIndex="-1" role="dialog">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Gérer la paie</h5>
                            <button
                                type="button"
                                className="btn-close"
                                aria-label="Close"
                                onClick={closeModal}
                            ></button>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-primary" onClick={popUpPaySlip}>
                                Générer la fiche paie
                            </button>
                            <button type="button" className="btn btn-success" onClick={popUpSalaire}>
                                Paiement du salaire
                            </button>
                            <Link to={`/dashboard/extra/` + ID} type="button" className="btn btn-warning">
                                Extras
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )}
        {isPaymentPopUp && (
            <div className="modal d-block" tabIndex="-1" role="dialog">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Paiement du salaire</h5>
                            <button
                                type="button"
                                className="btn-close"
                                aria-label="Close"
                                onClick={() => setIsPaymentPopUp(false)}
                            ></button>
                        </div>
                        <div className='modal-body'>
                            <label for="inputExtra" className='form-label'>
                                Quelle mois voulez-vous payer ?
                            </label>
                            <select name='inputExtra' id='inputExtra' className='form-select' onChange={(e) => setReason(e.target.value)}>
                                <option selected disabled>Veuillez sélectionner le mois</option>
                                <option>Janvier</option>
                                <option>Février</option>
                                <option>Mars</option>
                                <option>Avril</option>
                            </select>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-success" onClick={payment}>
                                Payer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
        {isPaySlip && (
            <div className="modal d-block" tabIndex="-1" role="dialog">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Fiche de paie</h5>
                            <button
                                type="button"
                                className="btn-close"
                                aria-label="Close"
                                onClick={() => setIsPaySlip(false)}
                            ></button>
                        </div>
                        <div className='modal-body'>
                            <label for="inputExtra" className='form-label'>
                                Quelle mois voulez-vous générer la fiche de paie ?
                            </label>
                            <select name='inputExtra' id='inputExtra' className='form-select' onChange={(e) => setReason(e.target.value)}>
                                <option selected disabled>Veuillez sélectionner le mois</option>
                                <option>Janvier</option>
                                <option>Février</option>
                                <option>Mars</option>
                                <option>Avril</option>
                            </select>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-success" onClick={generatePaySlip}>
                                Générer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
)
}

export default gestSalaire