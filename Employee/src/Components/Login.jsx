import React, { useState } from 'react'
import './Style.css'
import axios from 'axios'
<<<<<<< HEAD
import { Link, useNavigate } from 'react-router-dom'

const Login = () => {
    const [values, setValues] = useState({
        email: '',
        password: ''
    })
    const [error, setError] = useState()
    const navigate = useNavigate()
    axios.defaults.withCredentials = true;
    const handleSubmit = (event) => {
        event.preventDefault()
        axios.post('http://localhost:3000/auth/adminlogin', values)
            .then(result => {
                if (result.data.loginStatus) {
                    const userId = result.data.id;
                    sessionStorage.setItem('userID', JSON.stringify(userId)); // Sauvegarde les données dans le localStorage
                    navigate('/dashboard')
                } else {
                    setError(result.data.Error)
                }
            })
            .catch(err => console.log(err))
    }
    return (
        <div className='w-100 login'>
            <div className='row h-100'>
                <div className='d-flex justify-content-center align-items-center col-md'>
                    <div className='d-flex justify-content-center align-items-center flex-column'>
                        <form className='rounded border loginForm' onSubmit={handleSubmit}>
                            <h1 className=''>Welcome !!!</h1>
                            <p className='text-secondary'>Welcome back! Please enter your details</p>
                            <div className='text-warning'>
                                {error && error}
                            </div>
                            <div className='mb-4'>
                                <label htmlFor="email"><strong>Email :</strong></label>
                                <input type="email" name='email' autoComplete='off' placeholder='Enter Email'
                                    onChange={(e) => setValues({ ...values, email: e.target.value })} className='form-control mt-2 myInput' />
                            </div>
                            <div className='mb-4'>
                                <label htmlFor="password"><strong>Password :</strong></label>
                                <input type="password" name='password' placeholder='Enter Password'
                                    onChange={(e) => setValues({ ...values, password: e.target.value })} className='form-control mt-2 myInput' />
                            </div>
                            <div className='d-flex flex-row'>
                                <input type='checkbox' name='remind' autoComplete='on' className='form-check-input mx-1' id='exampleCheck1' />
                                <label className='form-check-label'>Remember for 30 days</label>
                                <Link className='mx-5 mt-1 forgot-password'>Forgot password ?</Link>
                            </div>
                            <button type='submit' className='btn btn-success text-white mt-3 mx-5 p-2 w-75 rounded-2 mt-2'>Validate</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )

=======
import {useNavigate} from 'react-router-dom'

const Login = () => {
       const [values, setValues] = useState({
        email: '',
        password:''
       })
       const navigate = useNavigate()

       const handleSubmit = (event) => {
            event.preventDefault()
            axios.post('http://localhost:3000/auth/adminlogin', values)
            .then(result => {
                navigate('/dashboard')
            })
            .catch(err => console.log(err))
       }
    return (
        <div className='d-flex justify-content-center align-items-center vh-100 loginPage'>
            <div className='p-3 rounded w-25 border loginForm'>
                <h2>Login Page</h2>
                <form onSubmit={handleSubmit}>
                    <div className='mb-3'>
                        <label htmlFor="email">Email:</label>
                        <input type='email' name='email' autoComplete='off' placeholder='Enter Email' onChange={(e) => setValues({...values, email : e.target.value})} className='form-control rounded-0'/>
                    </div>

                    <div className='mb-3'>
                        <label htmlFor="password">Password:</label>
                        <input type='password' name='password' placeholder='Enter Password' onChange={(e) => setValues({...values, password : e.target.value})} className='form-control rounded-0'/>
                    </div>
                    <button className='btn btn-success w-100 rounded-0 mb-2'>Login</button>
                    <div className='mb-1'>
                        <input type='checkbox' name='tick' id='tick' className='me-2' />
                        <label htmlFor="password">You are Agree with terms & conditions</label>
                    </div>
                </form>
            </div>
        </div>
    )
    
>>>>>>> 943c27ab28d86305d4d1441ca119f086db6a6270
}

export default Login