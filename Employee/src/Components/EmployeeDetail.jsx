import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const EmployeeDetail = () => {
  const [employee, setEmployee] = useState([])
  const navigate = useNavigate()
  const { id } = useParams()
  useEffect(() => {
    axios.get('http://localhost:3000/employee/employee_detail/' + id)
      .then(result => {
        setEmployee(result.data[0])
      })
      .catch(err => console.log(err))
  }, [])
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
          <h3>Service : {employee.service}</h3>
          <h3>Poste : {employee.poste}</h3>
          <h3>Salaire : {employee.salary} FCFA</h3>
        </div>
        <div className='mt-4'>
          <button className='btn btn-primary me-2'>Edit</button>
          <button className='btn btn-danger' onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </div>
  )
}

export default EmployeeDetail