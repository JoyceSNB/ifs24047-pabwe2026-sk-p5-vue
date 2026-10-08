export const getHighestBid=(a)=>{const bids=a?.bids||[]; if(!bids.length)return null; return Math.max(...bids.map(b=>Number(b.bid??b.amount??b.nominal??0)));};
export const toApiDateTime=(v)=>{if(!v)return '';return v.length===16?v.replace('T',' ')+':00':v.replace('T',' ')};
export const isClosed=(a)=>a?.closed_at?new Date(a.closed_at).getTime()<=Date.now():false;
