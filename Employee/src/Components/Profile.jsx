import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';

const Profile = () => {

  const navigate = useNavigate()
  const userId = sessionStorage.getItem('userID');
  const [profil, setProfil] = useState({
    email: "",
  })

  const [user, setUser] = useState({
    email: '',
    password: '',
  })

  useEffect(() => {
    const userId = sessionStorage.getItem('userID');
    axios.get('http://localhost:3000/auth/profil/' + userId)
      .then(result => {
        setProfil({
          ...profil,
          email: result.data.Result[0].email,
        })
      }).catch(err => console.log(err))
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    axios.put('http://localhost:3000/auth/edit_admin/' + userId, user)
      .then(result => {
        if (result.data.Status) {
          navigate('/adminlogin')
        } else {
          alert(result.data.Error)
        }
      }).catch(err => console.log(err))
  }

  return (
    <div className='px-5 mt-5'>
      <div className='d-flex justify-content-center align-items-center h-75 mt-5'>
        <div className='p-3 rounded w-50 border'>
          <h2>Modifier mon profil</h2>
          <form>
            <div className='mb-3'>
              <label htmlFor="email">Email :</label>
              <input type='text' name='email' value={profil.email} className='mt-3 form-control rounded-0' onChange={(e) => setUser({ ...user, email: e.target.value })} />
            </div>
            <div className='mb-3'>
              <label htmlFor="password">Mot de passe :</label>
              <input type='password' name='password' className='mt-3 form-control rounded-0' onChange={(e) => setUser({ ...user, password: e.target.value })} />
            </div>
            <div className='mt-3 row'>
              <button className='btn btn-primary w-25 col-sm-2 mx-auto' onClick={handleSubmit}>Modifier</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Profile