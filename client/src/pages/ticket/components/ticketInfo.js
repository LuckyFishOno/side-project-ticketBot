import { useState, useEffect, useRef } from 'react';

const TicketInfo = ({ chg, start, onGetInfoData, stateChg }) => {

    const [eventUrl, setEventUrl] = useState('');
    const [buyTime, setBuyTime] = useState('');
    const [eventNumber, setEventNumber] = useState('');
    const [sessionPrice, setSessionPrice] = useState('');
    const [sessionSeat, setSessionSeat] = useState('');
    const [ticketCount, setTicketCount] = useState('');
    const hasStarted = useRef(false);

    useEffect(() => {
        if (start && !hasStarted.current) {
            const data = {
                eventUrl,
                buyTime,
                eventNumber,
                sessionPrice,
                sessionSeat,
                ticketCount
            };
            onGetInfoData(data);
            hasStarted.current = true;
        } else if (!start) {
            hasStarted.current = false;
        }
    }, [start, eventUrl, buyTime, eventNumber, sessionPrice, sessionSeat, ticketCount, onGetInfoData]);

    return <div className="form" id="infoForm" style={{ 'display': chg === 'Info' ? 'block' : 'none' }}>
        <div className="inputE">
            <p>Event URL</p>
            <input 
                type="text" 
                placeholder="Tixcraft Web, e.g. 25_lany" 
                value={eventUrl} 
                onChange={(e) => setEventUrl(e.target.value)} 
                disabled={!stateChg}
            />
        </div>
        <div className="inputE">
            <p>Event</p>
            <input 
                type="text" 
                placeholder="Tixcraft Event, e.g. 1" 
                value={eventNumber} 
                onChange={(e) => setEventNumber(e.target.value)} 
                disabled={!stateChg}
            />
        </div>
        <div className="inputE">
            <p>Time</p>
            <input 
                type="text" 
                placeholder="e.g. 12:00、15:00" 
                value={buyTime} 
                onChange={(e) => setBuyTime(e.target.value)} 
                disabled={!stateChg}
            />
        </div>
        <div className="inputE">
            <p>Price</p>
            <input 
                type="text" 
                placeholder="Tixcraft Price, e.g. 2" 
                value={sessionPrice} 
                onChange={(e) => setSessionPrice(e.target.value)} 
                disabled={!stateChg}
            />
        </div>
        <div className="inputE">
            <p>Seat</p>
            <input 
                type="text" 
                placeholder="Tixcraft Seat, e.g. 2" 
                value={sessionSeat} 
                onChange={(e) => setSessionSeat(e.target.value)} 
                disabled={!stateChg}
            />
        </div>
        <div className="inputE">
            <p>票數</p>
            <input 
                type="text" 
                placeholder="Tixcraft Ticket, e.g. 4" 
                value={ticketCount} 
                onChange={(e) => setTicketCount(e.target.value)} 
                disabled={!stateChg}
            />
        </div>
        <div  className="inputE">
            <p>驗證碼</p>
            <img src={require('./../../../global/verifyCode.png')} style={{ 'width': "100px", 'margin': '10px' }}></img>
        </div>
    </div>
} 

export default TicketInfo;