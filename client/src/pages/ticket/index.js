import TicketWindow from './components/ticketWindow'
import './index.css'

const Home = () => {
    return <div className="container" id="container">
        <img src={require('./../../global/background.jpg')} style={{width: "100%", height: "100%", position:"absolute"}}></img>
        <TicketWindow/>
    </div>
} 
export default Home