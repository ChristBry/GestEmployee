import React from 'react'
import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';

const editCategory = () => {
    const { id } = useParams()
    const [category, setCategory] = useState({
        name: '',
    });
    const navigate = useNavigate()


    useEffect(() => {
        axios.get('http://localhost:3000/auth/category/' + id)
            .then(result => {
                setCategory({
                    ...category,
                    name: result.data.Result[0].name,
                })
            }).catch(err => console.log(err))
    }, [])

    const handleSubmit = (e) => {
        e.preventDefault()
        axios.put('http://localhost:3000/auth/edit_category/' + id, category)
            .then(result => {
                if (result.data.Status) {
                    navigate('/dashboard/category')
                } else {
                    alert(result.data.Error)
                }
            }).catch(err => console.log(err))
    }

    const handleDrop = (e) => {
        navigate("/dashboard/category")
    }
    return (
        <div className='d-flex justify-content-center align-items-center h-75'>
            <div className='p-3 rounded w-50 border'>
                <h2>Modifier un Service</h2>
                <form onSubmit={handleSubmit}>
                    <div className='mb-3'>
                        <label htmlFor="category">Service :</label>
                        <input type='text' name='category' defaultValue={category.name} className='mt-3 form-control rounded-0' onChange={(e) => setCategory({ ...category, name: e.target.value })} />
                    </div>
                    <div className='mt-3 row ps-5 ms-5'>
                        <button className='btn btn-secondary w-25 col-sm-2 ms-5' onClick={handleDrop}>Annuler</button>
                        <button type='submit' className='btn btn-primary w-25 col-sm-2 ms-5'>Modifier</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default editCategory