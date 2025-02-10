import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom';
import axios from 'axios'
import './Style.css'

const Employee = () => {
  const [employee, setEmployee] = useState([])
  const [isModalVisible, setModalVisible] = useState(false);
  const [user, setUser] = useState(null)
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

  const handleDelete = () => {
    axios.delete('http://localhost:3000/auth/delete_employee/' + user)
      .then(result => {
        if (result.data.Status) {
          setModalVisible(false)
          window.location.reload()
        } else {
          alert(result.data.Error)
        }
      })
  }
  const handleCancel = () => {
    setModalVisible(false); // Ferme la popup sans suppression
  };
  const popUpDelete = (userId) => {
    setModalVisible(true)
    setUser(userId)
  }
  return (
    <div className='px-5 mt-3'>
      <div className='d-flex justify-content-center'>
        <h2 className='fs-4 mt-2 small'>Liste des employés</h2>
      </div>
      <Link to="/dashboard/add_employee" className='btn btn-success'>
        Nouvel Employé
      </Link>
      <div className='mt-3'>
        <table className='table'>
          <thead>
            <tr>
              <th>Nom</th>
              <th className='w-25 text-center'>Photo</th>
              <th>Email</th>
              <th>Poste</th>
              <th>Salaire</th>
              <th>Adresse</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {
              employee.map(e => (
                <tr className=''>
                  <td className='pt-4'>{e.name}</td>
                  <td><img src={`http://localhost:3000/Images/` + e.image} className='employee_image w-25 h-25'></img></td>
                  <td className='pt-4'>{e.email}</td>
                  <td className='pt-4'>{e.poste}</td>
                  <td className='pt-4'>{e.salary} FCFA</td>
                  <td className='pt-4'>{e.address}</td>
                  <td className='pt-4'>
                    <Link to={`/dashboard/edit_employee/` + e.id} className='me-2 pt-4'>Modifier</Link>
                    <button className='btn btn-danger btn-sm' onClick={() => popUpDelete(e.id)}><i class="bi bi-trash3"></i></button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
      {isModalVisible && (
        <div className= "modal d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmer la suppression</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={handleCancel}
                ></button>
              </div>
              <div className="modal-body">
                <p>Êtes-vous sûr de vouloir supprimer l'utilisateur ? Cette action est irréversible.</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  Annuler
                </button>
                <button type="button" className="btn btn-danger" onClick={handleDelete}>
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employee