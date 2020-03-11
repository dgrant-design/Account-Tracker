import { openDB } from 'https://unpkg.com/idb?module';


let db;

( async ()=>{
  
    db = await openDB("budget", 1, {
      upgrade(db) {
        const objectStore = db.createObjectStore("pending", {
          keyPath: "offlineId",
         
          autoIncrement: true 
          });

        console.log( `~ created the db/upgraded it:`, objectStore.name );
      } });



})();


console.log( `defining saveRecord & syncTransactionsToServer`, db );

async function saveOfflineRecord( newTrans ) {
  const trans = db.transaction("pending", "readwrite");
  const pendingTable = trans.objectStore("pending");    
  pendingTable.add( newTrans );
  
  await trans.done;

  console.log( `+ api down, saving offline: `+JSON.stringify(newTrans) );
}

async function syncOfflineToServer() {
 

  const pendingList = await db.getAll("pending");
  console.log( `pendingList: `, pendingList );

  if( pendingList.length ){
    
    const response = await fetch("/api/transaction/bulk", {
      method: "POST",
      body: JSON.stringify(pendingList),
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json"
      }
    });
    
    const responseData = await response.json();

    console.log( `items accepted and sync'd by server:`, responseData.offlineIds );
    
    
 
    for( let id of responseData.offlineIds ){
      
      console.log( `.. deleting pending transaction (sync ok): id=${id}`, id );
      await db.delete("pending", id );
    }
  }
}


function browserOnline(){
  console.log( `.. browser back online!` );
  syncOfflineToServer();
}

function browserOffline(){
  console.log( `.. browser OFFLINE!` );
}

window.addEventListener("online", browserOnline );
window.addEventListener("offline", browserOffline );

export default saveOfflineRecord;