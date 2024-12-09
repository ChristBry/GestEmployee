import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const addAdmin = () => {
    const [user, setUser] = useState({
        email: '',
        password: '',
    })
    const navigate = useNavigate()
    
    const handleSubmit = (e) => {
        e.preventDefault()
        axios.post('http://localhost:3000/auth/add_admin', user)
        .then(result => {
             if (result.data.Status) {
                navigate('/dashboard')  
            } else {
                alert(result.data.Error)
            } 
        })
        .catch(err => console.log(err))
    }

    const handleCancel = () => {
        navigate('/dashboard')
    }
    return (
        <div className='d-flex justify-content-center align-items-center h-75'>
            <div className='p-3 rounded w-50 border'>
                <h2>Nouvel administrateur</h2>
                <form onSubmit={handleSubmit}>
                    <div className='mb-3'>
                        <label htmlFor="email">Email :</label>
                        <input type='text' name='email' placeholder="Entrez votre Email" className='mt-3 form-control rounded-0' onChange={(e) => setUser({...user, email:  e.target.value})} />
                    </div>
                    <div className='mb-3'>
                        <label htmlFor="password">Mot de passe :</label>
                        <input type='password' name='password' placeholder='Entrez votre mot de passe' className='mt-3 form-control rounded-0' onChange={(e) => setUser({...user, password:  e.target.value})} />
                    </div>
                    <div className='mt-3 row ps-5 ms-5'>
                        <button className='btn btn-secondary w-25 col-sm-2 ms-5' onClick={handleCancel}>Annuler</button>
                        <button type='submit' className='btn btn-success w-25 col-sm-2 ms-5'>Ajouter</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default addAdmin