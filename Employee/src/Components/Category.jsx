import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const Category = () => {
  const [category, setCategory] = useState([])
  const [isModalVisible, setModalVisible] = useState(false)
  const [categorie, setCategorie] = useState(null)

  useEffect(() => {
    axios.get('http://localhost:3000/auth/category')
    .then(result => {
        if(result.data.Status) {
          setCategory(result.data.Result);
        } else {
          alert(result.data.Error)
        }
    }).catch(err => console.log(err))
  }, [])

  const handleDelete = () => {
    axios.delete('http://localhost:3000/auth/delete_category/' + categorie)
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
  const popUpDelete = (categoryId) => {
    setModalVisible(true)
    setCategorie(categoryId)
  }

  return (
    <div className='px-5 mt-3'>
      <div className='d-flex justify-content-center'>
        <h2 className='fs-4 mt-2 small'>Liste des services</h2>
      </div>
      <Link to="/dashboard/add_category" className='btn btn-success'>Ajouter un service</Link>
      <div className='mt-3'>
        <table className='table w-50'>
          <thead>
            <tr>
              <th>Nom</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {
              category.map(c => (
                <tr>
                  <td>{c.name}</td>
                  <td>
                    <Link to={`/dashboard/edit_category/` + c.id} className='me-4'>Modifier</Link>
                    <button className='btn btn-danger btn-sm' onClick={() => popUpDelete(c.id)}><i class="bi bi-trash3"></i></button>
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
                <p>Êtes-vous sûr de vouloir supprimer ce serivce ? Cette action est irréversible.</p>
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
  )
}

export default Category