const router = require("express").Router();
const Transaction = require("../models/transaction.js");

try {
  router.post("/api/transaction", async ({ body }, res) => {
    console.log( `[POST transaction]`, body );
    const dbTransaction = await Transaction.create(body);
    res.json(dbTransaction);
  });

  router.post("/api/transaction/bulk", async ({ body }, res) => {
    console.log( `[POST transaction/bulk]`, body );
    
    const dbTransaction = await Transaction.insertMany(body);

    let offlineIds = [];
    for( let tx of dbTransaction )
    offlineIds.push( tx.offlineId );

    console.log( ` sending back offlineIds: `, offlineIds );


    res.send({offlineIds: offlineIds});
  });

  router.get("/api/transaction", async (req, res) => {
    const dbTransaction = await Transaction.find({}).sort({ date: -1 });
    console.log( `[GET transaction] listing all transactions`, dbTransaction );
    res.json(dbTransaction);
  });

} catch( err ){
  res.status(400).json(err);
}
module.exports = router;
