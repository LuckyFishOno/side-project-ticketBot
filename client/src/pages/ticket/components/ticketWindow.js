import TicketBasic from './ticketBasic'
import TicketInfo from './ticketInfo'
import TicketAdvanced from './ticketAdvanced'
import TicketLog from './ticketLog'
import { useState, useEffect } from 'react';

const TicketWindow = () => {
    const [activeTab, setActiveTab] = useState('Basic');
    const [event, setEvent] = useState(false);
    const [allTicketData, setAllTicketData] = useState({});
    const [dataCollected, setDataCollected] = useState(false);
    const [fontState, setFontState] = useState(true);
    const [cancel, setCancel] = useState([]);
    const [run, setRun] = useState(0);
    const [success, setSuccess] = useState([{}]);

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
    };

    const eventStart = () => {
        if(run > 0){
            alert('Bot Run');
        } else {
            setEvent(true);
            setFontState(false);
        }
            
        setRun(function(prev) {
            return prev + 1;
        })
    };

    const eventCancel = () => {
        setCancel(['botStop']);
        setRun(0);
        setEvent(false);
        setFontState(true);
    };

    useEffect(() => {
        if (cancel.length > 0) {
            const sendDataToBackend = async (cancel) => {
                console.log('取消', cancel);
        
                const response = await fetch('http://localhost:4000/api/ticket/2', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(cancel)
                }).then(response => {
                    return response;
                });
    
                if (response.ok) {
                    const responseData = await response.json();
                    console.log('資料發送:', responseData);
                }

            };

            sendDataToBackend(cancel);
            setDataCollected(false);
            setAllTicketData({});
            setCancel([]);
        }
    }, [cancel]);

    useEffect(() => {
        if (dataCollected) {
            const sendDataToBackend = async (allTicketData) => {
                console.log('準備發送的合併資料:', allTicketData);
        
                const response = await fetch('http://localhost:4000/api/ticket/1', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(allTicketData)
                }).then(response => {
                    return response;
                });
    
                if (response.ok) {
                    const responseData = await response.json();
                    console.log('資料發送:', responseData);
                }
            };
            
            sendDataToBackend(allTicketData);
            setDataCollected(false);
            setAllTicketData({});
            setCancel([]);
        }
    }, [dataCollected, allTicketData]);

    const getBasicData = (Data) => {
        setAllTicketData(prevData => ({ ...prevData, basic: Data }));
    };
    const getInfoData = (Data) => {
        setAllTicketData(prevData => ({ ...prevData, info: Data }));
    };
    const getAdvancedData = (Data) => {
        setAllTicketData(prevData => ({ ...prevData, advanced: Data }));
    };
    useEffect(() => {
        if (event) {
            if (allTicketData.basic && allTicketData.info && allTicketData.advanced) {
                setDataCollected(true);
            }
        }
    }, [event, allTicketData]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            fetch('http://localhost:4000/api/ticket/3').then(
                response => response.json()
            ).then(data => {
                    if (data.message === 'buySuccess') {
                        setSuccess(data);
                        clearInterval(intervalId);
                    }
                }
            ).catch(error => {
                console.error('Error polling success status:', error);
            });
        }, 5000);
    
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        if (success.message === 'buySuccess') { // 確保 success 不是 null 或 undefined
            console.log('Buy success detected!');
            setRun(0);
            setDataCollected(false);
            setAllTicketData({});
            setCancel([]);
            setEvent(false);
            setFontState(true);
            setSuccess([{}]);
        }
    }, [success]);

    return <div>
        <nav className='navBar'>
            <button style={{'textShadow': activeTab === 'Basic' ? '0px 0px 5px #fff' : 'none', 'fontSize': activeTab === 'Basic' ? '20px' : '17px'}} onClick={() => handleTabClick('Basic')} >Basic</button>
            <button style={{'textShadow': activeTab === 'Info' ? '0px 0px 5px #fff' : 'none', 'fontSize': activeTab === 'Info' ? '20px' : '17px'}}onClick={() => handleTabClick('Info')}>Info</button>
            <button style={{'textShadow': activeTab === 'Advanced' ? '0px 0px 5px #fff' : 'none', 'fontSize': activeTab === 'Advanced' ? '20px' : '17px'}}onClick={() => handleTabClick('Advanced')}>Advanced</button>
        </nav>
        <div className='info-container'>
            <TicketBasic chg={activeTab} start={event} onGetBasicData={getBasicData} stateChg={fontState}/>
            <TicketInfo chg={activeTab} start={event} onGetInfoData={getInfoData} stateChg={fontState}/>
            <TicketAdvanced chg={activeTab} start={event} onGetAdvancedData={getAdvancedData} stateChg={fontState}/>
            <TicketLog/>
        </div>
        <div className='btnEvent'>
            <button onClick={eventStart}>Start</button>
            <button onClick={eventCancel}>Stop</button>
        </div>
    </div>
}

export default TicketWindow;