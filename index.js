const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const app = express()
const port = process.env.PORT || 5000;
require('dotenv').config()


app.use(express.json())
app.use(cors())
// mobarakdb
// ZLCt55voRj6DVf6X



const uri = `mongodb+srv://${process.env.BD_USER}:${process.env.BD_PASS}@cluster0.csuyw.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect();
        const productCollection = client.db('car-manufacture').collection('products')

        // app.post('/product', async (req, res) => {
        //     const data = req.body;
        //     const result = await productCollection.insertMany(data)
        //     res.send(result)
        // })


        app.get('/product', async (req, res) => {
            const result = await productCollection.find().toArray()
            res.send(result)
        })

        app.get('/product/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const result = await productCollection.findOne(filter)
            res.send(result)
        })
        app.put('/product/:id', async (req, res) => {
            const id = req.params.id;
            const updateInfo = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    quantity: updateInfo.orderQuantity
                }
            }
            const result = await productCollection.updateOne(filter, updateDoc, options);
            res.send(result)
        })


    }
    finally {

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})