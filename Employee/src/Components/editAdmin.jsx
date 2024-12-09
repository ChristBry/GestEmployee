import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom';

const editAdmin = () => {
    const { id } = useParams()
    const [admin, setAdmin] = useState({
        email: '',
        password: ''
    });
    const [user, setUser] = useState({
        email: '',
        password: ''
    })
    const navigate = useNavigate()

    useEffect(() => {
        axios.get('http://localhost:3000/auth/admin/' + id)
            .then(result => {
                setAdmin({
                    ...admin,
                    email: result.data.Result[0].email,
                })
            }).catch(err => console.log(err))
    }, [])

    const handleSubmit = (e) => {
        e.preventDefault()
        axios.put('http://localhost:3000/auth/edit_admin/' + id, user)
            .then(result => {
                if (result.data.Status) {
                    navigate('/dashboard')
                } else {
                    alert(result.data.Error)
                }
            }).catch(err => console.log(err))
    }

    const handleCancel = (e) => {
        navigate("/dashboard")
    }

    return (
        <div className='d-flex justify-content-center align-items-center h-75'>
            <div className='p-3 rounded w-50 border'>
                <h2>Modifier un administrateur</h2>
                <form onSubmit={handleSubmit}>
                    <div className='mb-3'>
                        <label htmlFor="email">Email :</label>
                        <input type='text' name='email' defaultValue={admin.email} className='mt-3 form-control rounded-0' onChange={(e) => setUser({ ...user, email: e.target.value })} />
                    </div>
                    <div className='mb-3'>
                        <label htmlFor="password">Mot de passe :</label>
                        <input type='password' name='password' className='mt-3 form-control rounded-0'  onChange={(e) => setUser({...user, password:  e.target.value})} />
                    </div>
                    <div className='mt-3 row ps-5 ms-5'>
                        <button className='btn btn-secondary w-25 col-sm-2 ms-5' onClick={handleCancel}>Annuler</button>
                        <button type='submit' className='btn btn-success w-25 col-sm-2 ms-5'>Modifier</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default editAdmin