import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const EmployeeDetail = () => {
  const [employee, setEmployee] = useState({});
  const [category, setCategory] = useState({});
  const [paymentData, setPaymentData] = useState([]);
  const [isPaySlip, setIsPaySlip] = useState(false)
  const [reason, setReason] = useState(null)
  const navigate = useNavigate()
  const { id } = useParams()
  useEffect(() => {
    axios.get('http://localhost:3000/employee/employee_detail/' + id)
      .then((result) => {
        const employeeData = result.data.Result[0];
        setEmployee(employeeData);

        // Récupérer la catégorie après avoir obtenu les détails de l'employé
        return axios.get('http://localhost:3000/employee/category/' + employeeData.category_id);
      })
      .then((result) => {
        setCategory(result.data.Result[0]); // Stocker les informations de la catégorie
      })
      .catch((err) => console.log(err));
  }, [id]); // Exécuter uniquement lorsque l'ID change

  const generatePaySlip = async () => {
    try {
      console.log("ID employé :", id)

      // Récupération des informations de l'employé
      const employeeResponse = await axios.get('http://localhost:3000/employee/employee_detail/' + id);
      if (employeeResponse.data.Status) {
        const employee = employeeResponse.data.Result[0];
        console.log("Données de l'employé :", employee);
      } else {
        alert("Erreur lors de la récupération des informations de l'employé : " + employeeResponse.data.Error);
        return;
      }

      // Construction du corps de la requête
      const requestBody = {
        employee_id: id,  // Assurez-vous d'envoyer l'ID de l'employé
        reason: reason     // Le motif envoyé dans le corps de la requête
      };

      // Effectuer la requête POST avec axios
      const paymentResponse = await axios.post('http://localhost:3000/employee/salary_payment', requestBody);

      console.log("Motif de la requête:", requestBody); // Vérification du motif

      // Vérification du statut de la réponse
      if (paymentResponse.data.Status) {
        const payment = paymentResponse.data.Result[0];
        setPaymentData(payment); // Mettre à jour les données des paiements
        console.log("Données des paiements :", payment); // Log pour vérifier les données récupérées
      } else {
        // En cas d'erreur dans la réponse
        alert("Erreur lors de la récupération des paiements : " + paymentResponse.data.Error);
      }

      // Génération du PDF
      const pdfResponse = await axios.post(
        'http://localhost:3000/employee/payslip_pdf',
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

  const handleLogout = () => {
    axios.get('http://localhost:3000/employee/logout')
      .then(result => {
        if (result.data.Status) {
          navigate('/')
        } else {
          alert(result.data.Error)
        }
      }).catch(err => console.log(err))
  }
  return (
    <div>
      <div className="p-2 d-flex justify-content-center shadow">
        <h2 className='fs-4 pt-2 lead'>Système de Gestion des Employés</h2>
      </div>
      <div className='d-flex justify-content-center flex-column align-items-center mt-3'>
        <img src={`http://localhost:3000/Images/` + employee.image} className='employee-image' />
        <div className='d-flex  flex-column mt-5'>
          <h3>Nom : {employee.name}</h3>
          <h3>Email : {employee.email}</h3>
          <h3>Service : {category.name || 'Non spécifié'}</h3>
          <h3>Poste : {employee.poste}</h3>
          <h3>Salaire : {employee.salary} FCFA</h3>
        </div>
        <div className='mt-4'>
          <button className='btn btn-success me-2' onClick={() => setIsPaySlip(true)}>Fiche de paie</button>
          <button className='btn btn-primary me-2'>Edit</button>
          <button className='btn btn-danger' onClick={handleLogout}>Logout</button>
        </div>
      </div>
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

export default EmployeeDetail