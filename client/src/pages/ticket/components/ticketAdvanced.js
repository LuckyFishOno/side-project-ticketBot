import { useState, useEffect, useRef } from 'react';

const TicketAdvanced = ({ chg, start, onGetAdvancedData, stateChg }) => {

    const [serialMode, setSerialMode] = useState(false);
    const [serialCard, setSerialCard] = useState('');
    const [mooncakeMode, setMooncakeMode] = useState(false);
    const [seatWebMode, setSeatWebMode] = useState(false);
    const [seatWebUrl, setSeatWebUrl] = useState('');
    const [buyTicketQuickPrice, setBuyTicketQuickPrice] = useState('');
    const [buyTicketQuickSeat, setBuyTicketQuickSeat] = useState('');
    const [buyTicketQuickTicket, setBuyTicketQuickTicket] = useState('');
    const hasStarted = useRef(false);

    useEffect(() => {
        if (start && !hasStarted.current) {
            const data = {
                serialMode,
                serialCard,
                mooncakeMode,
                seatWebMode,
                seatWebUrl,
                buyTicketQuickPrice,
                buyTicketQuickSeat,
                buyTicketQuickTicket
            };
            onGetAdvancedData(data);
            hasStarted.current = true;
        } else if (!start) {
            hasStarted.current = false;
        }
    }, [start, serialMode, serialCard, mooncakeMode, seatWebMode, seatWebUrl, buyTicketQuickPrice,buyTicketQuickSeat, buyTicketQuickTicket, onGetAdvancedData]);
    

    return <div className="form" id="advancedForm" style={{ 'display': chg === 'Advanced' ? 'block' : 'none' }}>
         <div>
            <div className="inputE" >
                <input 
                    type="checkbox" 
                    name="Serial" 
                    id="Serial" 
                    defaultChecked={false} 
                    value={serialMode} 
                    onChange={(e) => setSerialMode(e.target.checked)}
                    disabled={!stateChg}
                />
                <label>信用卡前 8 碼 / chatGPT 回答問題</label>
            </div>
            <div>
                <div className="inputE">
                    <p>Card Num.</p>
                    <input 
                        type="text" 
                        placeholder="信用卡前 8 碼，未填入則使用 GPT" 
                        value={serialCard} 
                        onChange={(e) => setSerialCard(e.target.value)} 
                        disabled={!serialMode || !stateChg}
                    />
                </div>
            </div>
        </div>
        <div className="inputE" >
                <input 
                    type="checkbox" 
                    name="Serial" 
                    id="Serial" 
                    defaultChecked={false} 
                    value={mooncakeMode} 
                    onChange={(e) => setMooncakeMode(e.target.checked)}
                    disabled={!stateChg}
                />
                <label>月餅模式（只選場次 驗證碼階段）</label>
        </div>
        <div className="inputE" >
                <input 
                    type="checkbox" 
                    name="Serial" 
                    id="Serial" 
                    defaultChecked={false} 
                    value={seatWebMode} 
                    onChange={(e) => setSeatWebMode(e.target.checked)}
                    disabled={!stateChg}
                />
                <label>跳過選擇場次</label>
        </div>
        <div className="inputE">
            <p>Seat Web</p>
            <input 
                type="text" 
                placeholder="Seat Web, e.g. 25_maroon5/17641" 
                value={seatWebUrl} 
                onChange={(e) => setSeatWebUrl(e.target.value)} 
                disabled={!seatWebMode || !stateChg}
            />
        </div>
        <div className="inputE">
            <p>刷票用價格</p>
            <input 
                type="text" 
                placeholder="Price, e.g. 5" 
                value={buyTicketQuickPrice} 
                onChange={(e) => setBuyTicketQuickPrice(e.target.value)} 
                disabled={!stateChg}
            />
        </div>
        <div className="inputE">
            <p>刷票用座位</p>
            <input 
                type="text" 
                placeholder="Seat, e.g. 3" 
                value={buyTicketQuickSeat} 
                onChange={(e) => setBuyTicketQuickSeat(e.target.value)} 
                disabled={!stateChg}
            />
        </div>
        <div className="inputE">
            <p>刷票用張數</p>
            <input 
                type="text" 
                placeholder="Ticket, e.g. 2" 
                value={buyTicketQuickTicket} 
                onChange={(e) => setBuyTicketQuickTicket(e.target.value)} 
                disabled={!stateChg}
            />
        </div>
    </div>
} 

export default TicketAdvanced;