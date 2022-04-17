import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useSelector, useDispatch } from 'react-redux'
import { createTicket, reset } from '../features/tickets/ticketSlice'
import Spinner from '../components/Spinner'
import BackButton from '../components/BackButton'


function NewTicket() {
  const { user } = useSelector((state) => state.auth)
  const { isLoading, isSuccess, isError, message } = useSelector((state) => state.ticket)
  const {name, email} = user
  const [product, setProduct] = useState('WHSIA')
  const [description, setDescription] = useState('')

  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
      if(isError){
          toast.error(message)
      }

      if(isSuccess){
          dispatch(reset())
          navigate('/tickets')
      }

      dispatch(reset())
  }, [dispatch, isError, isSuccess, message, navigate])

  const onSubmit = (e) => {
    e.preventDefault()
    dispatch(createTicket({product, description}))
  }

  if (isLoading) {
    return <Spinner />
  }

  return (
    <>
      <BackButton url='/' />
      <section className='heading'>
        <h1>Create New Ticket</h1>
        <p>Please fill out the form below</p>
      </section>

      <section className='form'>
        <div className='form-group'>
          <label htmlFor='name'>Customer Name</label>
          <input type='text' className='form-control' value={name} disabled />
        </div>
        <div className='form-group'>
          <label htmlFor='email'>Customer Email</label>
          <input type='text' className='form-control' value={email} disabled />
        </div>
        <form onSubmit={onSubmit}>
          <div className='form-group'>
            <label htmlFor='product'>Product</label>
            <select
              name='product'
              id='product'
              value={product}
              onChange={(e) => setProduct(e.target.value)}
            >
              <option value='WHSIA'>WHSIA</option>
              <option value='Pik TV'>Pik TV</option>
              <option value='HSIA'>HSIA</option>
              <option value='Smart Hub'>Smart Hub</option>
            </select>
          </div>
          <div className='form-group'>
            <label htmlFor='description'>Description of the issue</label>
            <textarea
              name='description'
              id='description'
              placeholder='Description'
              rows='5'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>
          <div className='form-group'>
            <button className='btn btn-block'>Submit</button>
          </div>
        </form>
      </section>
    </>
  )
}

export default NewTicket