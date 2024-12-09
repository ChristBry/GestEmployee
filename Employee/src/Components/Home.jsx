import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const Home = () => {
  const [adminTotal, setadminTotal] = useState(0)
  const [employeeTotal, setemployeeTotal] = useState(0)
  const [salaryTotal, setSalaryTotal] = useState(0)
  const [admin, setAdmin] = useState([])
  const [isModalVisible, setModalVisible] = useState(false);
  const [user, setUser] = useState(null)
  const [employees, setEmployees] = useState([]);
  const [groupedEmployees, setGroupedEmployees] = useState({});

  // Fonction pour récupérer les employés depuis une API
  useEffect(() => {
    axios
      .get("http://localhost:3000/auth/employee") // Remplacez par votre URL API
      .then((result) => {
        setEmployees(result);
        groupByService(result);
      })
      .catch((error) => console.error("Erreur lors du chargement des employés :", error));
  }, []);

  // Fonction pour grouper les employés par service
  const groupByService = (employeesList) => {
    const grouped = employeesList.reduce((acc, employee) => {
      const service = employee.service || "Non attribué";
      if (!acc[service]) {
        acc[service] = [];
      }
      acc[service].push(employee);
      return acc;
    }, {});
    setGroupedEmployees(grouped);
  };


  useEffect(() => {
    adminCount();
    employeeCount();
    salaryCount();
    adminRecords()
  }, [])

  const adminRecords = () => {
    axios.get('http://localhost:3000/auth/admin_records')
      .then(result => {
        if (result.data.Status) {
          setAdmin(result.data.Result)
        }
      })
  }
  const adminCount = () => {
    axios.get('http://localhost:3000/auth/admin_count')
      .then(result => {
        if (result.data.Status) {
          setadminTotal(result.data.Result[0].admin)
        }
      })
  }
  const employeeCount = () => {
    axios.get('http://localhost:3000/auth/employee_count')
      .then(result => {
        if (result.data.Status) {
          setemployeeTotal(result.data.Result[0].employee)
        }
      })
  }
  const salaryCount = () => {
    axios.get('http://localhost:3000/auth/salary_count')
      .then(result => {
        if (result.data.Status) {
          setSalaryTotal(result.data.Result[0].salary)
        } else {
          alert(result.data.Error)
        }
      })
  }

  const handleDelete = () => {
    axios.delete('http://localhost:3000/auth/delete_admin/' + user)
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
    <div>
      <div className='p-3 d-flex justify-content-around mt-3'>
        <div className='px-3 pt-2 pb-3 border shadow-sm w-25'>
          <div className='text-center pb-1'>
            <h4 className=''>Administrateur</h4>
          </div>
          <hr />
          <div className='d-flex justify-content-between'>
            <h5>Total :</h5>
            <h5>{adminTotal}</h5>
          </div>
        </div>
        <div className='px-3 pt-2 pb-3 border shadow-sm w-25'>
          <div className='text-center pb-1'>
            <h4>Employés</h4>
          </div>
          <hr />
          <div className='d-flex justify-content-between'>
            <h5>Total :</h5>
            <h5>{employeeTotal}</h5>
          </div>
        </div>
        <div className='px-3 pt-2 pb-3 border shadow-sm w-25'>
          <div className='text-center pb-1'>
            <h4>Salaire</h4>
          </div>
          <hr />
          <div className='d-flex justify-content-between'>
            <h5>Total :</h5>
            <h5>{salaryTotal} FCFA</h5>
          </div>
        </div>
      </div>
      <div className='mt-4 px-5 pt-3'>
        <div className="d-flex justify-content-between align-items-center w-100 p-3">
          <h3 className="m-0">Liste des Administrateurs</h3>
          <Link to="/dashboard/add_admin" className="btn btn-success">
            Ajouter un administrateur
          </Link>
        </div>
        <table className='table'>
          <thead>
            <tr>
              <th>Email</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {
              admin.map(a => (
                <tr>
                  <td>{a.email}</td>
                  <td>
                    <Link to={`/dashboard/edit_admin/` + a.id} className='me-2 ms-4'>Modifier</Link>
                    <button className='btn btn-danger btn-sm ms-4' onClick={() => popUpDelete(a.id)}><i class="bi bi-trash3"></i></button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
      <div className="container px-5 pt-3">
        <h3 className="my-4 fs-4 ms-3">Employés classés par service</h3>
        {Object.keys(groupedEmployees).map((service) => (
          <div key={service} className="mb-4">
            <h4 className="text-primary">{service}</h4>
            <ul className="list-group">
              {groupedEmployees[service].map((employee) => (
                <li key={employee.id} className="list-group-item">
                  {employee.name} - {employee.position}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {isModalVisible && (
        <div className="modal d-block" tabIndex="-1" role="dialog">
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
                <p>Êtes-vous sûr de vouloir supprimer cette administrateur ? Cette action est irréversible.</p>
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
    </div >
  )
}

export default Home