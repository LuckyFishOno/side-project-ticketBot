import { useState, useEffect, useRef } from 'react';

const TicketBasic = ({ chg, start, onGetBasicData, stateChg }) => {

    const [cookie, setCookie] = useState('');
    const [livenationMode, setLivenationMode] = useState(false);
    const [logingAccountLN, setLogingAccountLN] = useState('');
    const [logingPasswordLN, setLogingPasswordLN] = useState('');
    const [eventUrlLN, setEventUrlLN] = useState('');
    const hasStarted = useRef(false);

    useEffect(() => {
        if (start && !hasStarted.current) {
            const data = {
                cookie,
                livenationMode,
                logingAccountLN,
                logingPasswordLN,
                eventUrlLN
            };
            onGetBasicData(data);
            hasStarted.current = true;
        } else if (!start) {
            hasStarted.current = false;
        }
    }, [start, cookie, livenationMode, logingAccountLN, logingPasswordLN, eventUrlLN, onGetBasicData]);
    
    return <div className="form" id="basicForm" style={{ 'display': chg === 'Basic' ? 'block' : 'none' }} >
        <div className="inputE">
            <img src={require('../../../global/tixcraft.png')} style={{ 'width': '50px', 'borderRadius': '100%', 'margin': '0px 10px 40px 10px' }}></img>
            <h1>Tixcraft Bot</h1>
        </div>
        <div className="inputE">
            <p>Cookie SID</p>
            <input 
                type="text" 
                placeholder="e.g. qu1o49bnkuo56l038ffq6a0jde" 
                value={cookie} 
                onChange={(e) => setCookie(e.target.value)} 
                disabled={!stateChg}
            />
        </div>
        <div className="inputE" >
            <input 
                type="checkbox" 
                name="LNLogin" 
                id="LNLogin" 
                defaultChecked={false} 
                value={livenationMode} 
                onChange={(e) => setLivenationMode(e.target.checked)}
                disabled={!stateChg}
            />
            <label>Live Nation 登入</label>
        </div>
        <div className="inputE">
            <p>Account</p>
            <input 
                type="text" 
                placeholder="LiveNation Account" 
                value={logingAccountLN} 
                onChange={(e) => setLogingAccountLN(e.target.value)} 
                disabled={!livenationMode || !stateChg}
            />
        </div>
        <div className="inputE">
            <p>Password</p>
            <input 
                type="password" 
                placeholder="LiveNation Password" 
                value={logingPasswordLN} 
                onChange={(e) => setLogingPasswordLN(e.target.value)} 
                disabled={!livenationMode || !stateChg}
            />
        </div>
        <div className="inputE">
            <p>Event</p>
            <input 
                type="text" 
                placeholder="e.g. show/... 尾 or event/... 尾" 
                value={eventUrlLN} 
                onChange={(e) => setEventUrlLN(e.target.value)} 
                disabled={!livenationMode || !stateChg}
            />
        </div>
    </div>
} 

export default TicketBasic;