import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { getTicket, reset, closeTicket } from '../features/tickets/ticketSlice'
import BackButton from '../components/BackButton'
import Spinner from '../components/Spinner'
import { toast } from 'react-toastify'

function Ticket() {
    const {ticket, isLoading, isSuccess, isError, message} = useSelector((state) => state.ticket)
    
    const params = useParams()
    const dispatch = useDispatch()
    const navigate = useNavigate()

    useEffect(() => {
        dispatch(getTicket(params.ticketId))

        if(isError){
            toast.error(message)
        }

        //if component is unmounted
        return () => {
            if(isSuccess){
                dispatch(reset)
            }
        }

    }, [isError, isSuccess, message, params])

    const onTicketClose = () => {
        dispatch(closeTicket(params.ticketId))
        toast.success('Ticket closed')
        navigate('/tickets')
    }

    if(isLoading){
        return <Spinner />
    }
  
  
    return (
    <div className='ticket-page'>
        <header className="ticket-header">
            <BackButton url='/tickets' />
            <h2>
                Ticket ID: {ticket._id}
                <span className={`status status-${ticket.status}`}>{ticket.status}</span>
            </h2>
            <h3>
                Date Submitted: {new Date(ticket.createdAt).toLocaleString('en-US')}
            </h3>
            <h3>
                Product: {ticket.product}
            </h3>
            <hr />
            <div className="ticket-desc">
                <h3>Description of Issue</h3>
                <p>{ticket.description}</p>
            </div>
        </header>
        {ticket.status !== 'closed' && <button onClick={onTicketClose} className="btn btn-block btn-danger">Close Ticket</button>}
    </div>
  )
}

export default Ticket