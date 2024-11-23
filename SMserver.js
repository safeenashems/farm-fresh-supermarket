const http = require('http');
const express=require('express');
const bodyparser=require('body-parser');
const path=require('path');
const { MongoClient } = require('mongodb');

// Connection URI for local MongoDB instance
const url = 'mongodb://127.0.0.1:27017'; // Change this if connecting to a remote MongoDB instance

  // Create a new MongoClient
  const client = new MongoClient(url);

const app=express();
const hostname='127.0.0.1'; 
const port=3000;

// Middleware to parse URL-encoded form data node SMserver.js
app.use(bodyparser.urlencoded({ extended: true }));


// Serve static files (e.g., HTML) from the  directory
app.use(express.static(path.join(__dirname, 'public')));


// Route for the root URL (Home page)
// app.get('/', (req, res) => {
//   res.send('<h1>Welcome to the Super Market Inventory System!</h1>');
// });


// Route to handle pdt form submission
app.post('/addPdtForm',async (req, res) => {
  
  const { pdtID,pdtName, pdtCtgr,qty,unitPrice,pdtLoc } = req.body;
 const total = qty*unitPrice; 
let disc=0;

    if(pdtCtgr=='Grocery') disc=total*3/100;
    else if(pdtCtgr=='Fruits') disc=total*5/100;
    else disc=total*10/100;

 

    // Log the submitted product data
    console.log('product form Submitted!', req.body);
    console.log(req.body);
  //   console.log('Product ID:',pdtID);     console.log('Name:', pdtName);
  //   console.log('Category:', pdtCtgr);    console.log('Quantity:',qty);
  //   console.log('Price:',unitPrice);      console.log('total:',total); 
  //  console.log('disc:',disc);             console.log('pdtLoc:',pdtLoc); 

    try{
     // Connect to the MongoDB server
    await  client.connect();
    console.log('MongoDB connected successfully');
     // Access the database  (will be created if it doesn't exist)
     const db = client.db('SUPER-MARKET');
 
     // You can perform other operations here, e.g., inserting data into the collection
     const result =await db.collection("stock").insertOne({
      pdtID:pdtID,pdtName:pdtName,pdtCtgr:pdtCtgr,qty:qty,unitPrice:unitPrice,total:total,disc:disc,pdtLoc:pdtLoc});
      //pdtID,pdtName,pdtCtgr,qty,unitPrice,total,disc,pdtLoc});
    
      console.log('Inserted Products:', result);
 
    }
      catch (err) {
      console.error('Error occurred:', err); res.status(500).send('Error submitting product');
    } finally {
      // Ensure that the client will close when you finish/error
      await  client.close();
    }
    // Respond with a success message or redirect
    res.send(`<h1>Product submitted successfully...!</h1>`);
  });



  // Route to read  submitted pdt details
app.get('/viewStock',async (req, res) => {

  try{
   // Connect to the MongoDB server
  await  client.connect();

   // Access the database  (will be created if it doesn't exist)
   const db = client.db('SUPER-MARKET');

   
   // Fetch all documents from the "stock" collection
   const stocklist = await db.collection("stock").find().toArray();

  
   // Render the stock in a table on the stock list
        let stockTable =
         '<table border="1"><thead><tr><th>Item Code</th><th>Name</th><th>Category</th><th>Quantity</th><th>Unit Price</th><th>Total</th><th>Discount</th><th>Location</th></tr></thead><tbody>';
         stocklist.forEach(stk => {
            stockTable += `
                <tr>
                    <td>${stk.pdtID}</td>     <td>${stk.pdtName}</td>
                    <td>${stk.pdtCtgr}</td>   <td>${stk.qty}</td>
                    <td>${stk.unitPrice}</td> <td>${stk.total}
                    </td> <td>${stk.disc}</td> <td>${stk.pdtLoc}</td>
                </tr>`;
        });
        stockTable += `</tbody></table>`;


  // Send the contacts table as the response
  res.send(`
    <html>
        <head>
            <title>Farm Fresh Super Market</title>
        </head>
        <body>
           
            ${stockTable}
        </body>
    </html>
`);
}
    catch (err) {
    console.error('Error fetching stock:', err);
    res.status(500).send('Error fetching stock');
  } finally {
    // Ensure that the client will close when you finish/error
    await  client.close();
  }

});



  //start the server
  app.listen(port,hostname, ()=>{
    console.log(`Server running at http://${hostname}:${port}/`);  
  });


  
 





