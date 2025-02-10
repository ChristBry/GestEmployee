import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';

const extraPayment = () => {
    const { id } = useParams()
    const [employeeName, setEmployeeName] = useState()
    const [employee, setEmployee] = useState({
        employee_id: id,
        salary_amount: '',
        salary_type: '',
        raison: '',
    });
    const navigate = useNavigate()


    useEffect(() => {
        axios.get('http://localhost:3000/auth/employee/' + id)
            .then(result => {
                setEmployeeName(result.data.Result[0].name)
            }).catch(err => console.log(err))
    }, [])

    const handleSubmit = (e) => {
        e.preventDefault()
        axios.post('http://localhost:3000/auth/payment_extra', employee)
            .then(result => {
                if (result.data.Status) {
                    navigate('/dashboard/paiement')
                    window.location.reload()
                } else {
                    alert(result.data.Error)
                }
            }).catch(err => console.log(err))
    }

    return (
        <div className='d-flex justify-content-center align-items-center mt-5'>
            <div className='p-3 rounded w-50 border'>
                <h4 className='fs-4 text-center'>Paiement d'un Extra</h4>
                <form className='row-g-1' onSubmit={handleSubmit}>
                    <div className='col-12'>
                        <label for="inputName" className='form-label'>
                            Nom
                        </label>
                        <input type='text'
                            id='inputName'
                            defaultValue={employeeName}
                            className='form-control rounded-0'
                        />
                    </div>
                    <div className='col-12'>
                        <label for="inputSalary" className='form-label mt-2'>
                            Montant
                        </label>
                        <input type='text'
                            id='inputSalary'
                            placeholder='Entrer le montant'
                            className='form-control rounded-0'
                            onChange={(e) => setEmployee({ ...employee, salary_amount: e.target.value })}
                        />
                    </div>
                    <div className='col-12'>
                        <label for="inputExtra" className='form-label mt-2'>
                            Type d'extra
                        </label>
                        <select name='inputExtra' id='inputExtra' className='form-select' onChange={(e) => setEmployee({ ...employee, salary_type: e.target.value })}>
                            <option selected disabled>Veuillez sélectionner le type d'extra</option>
                            <option>Bonus</option>
                            <option>Prime</option>
                            <option>Frais de mission</option>
                            <option>Déduction</option>
                        </select>
                    </div>
                    <div className='col-12'>
                        <label for="inputReason" className='form-label mt-2'>
                            Raison
                        </label>
                        <textarea type='text'
                            id='inputReason'
                            className='form-control border rounded'
                            onChange={(e) => setEmployee({ ...employee, raison: e.target.value })}
                        />
                    </div>
                    <div className='mt-3 row ps-5 ms-5'>
                        <button className='btn btn-secondary w-25 col-sm-2 ms-5'>Annuler</button>
                        <button type='submit' className='btn btn-success w-25 col-sm-2 ms-5'>Enregistrer</button>
                    </div>

                </form>
            </div>
        </div>
    )
}

export default extraPayment