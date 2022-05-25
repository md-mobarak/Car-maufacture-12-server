const express = require('express');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const app = express()
const port = process.env.PORT || 5000;
require('dotenv').config()


app.use(express.json())
app.use(cors())
// mobarakdb
// ZLCt55voRj6DVf6X
// 3ff1fc9c0c7240abc5816fe444ccee098ad021aa518cb2bd8002d11f353797141f033e3853960a56bd16be3a607e94db4aec9f32eac9d4f9f561dd2d5b827021



const uri = `mongodb+srv://${process.env.BD_USER}:${process.env.BD_PASS}@cluster0.csuyw.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authorization = req.headers.authorization
    if (!authorization) {
        return res.status(401).send({ message: 'UnAuthorized Access' })
    }
    const token = authorization.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden Access' })
        }
        req.decoded = decoded;
        next()
    });

}


async function run() {
    try {
        await client.connect();
        const productCollection = client.db('car-manufacture').collection('products')
        const userCollection = client.db('allUser').collection('userOrder')
        const allUserCollection = client.db('allUser').collection('users')


        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            const user = await allUserCollection.findOne({ email: email })
            const isAdmin = user.role === 'admin';
            res.send({ admin: isAdmin })
        })

        app.put('/user/admin/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
            const requester = req.decoded.email;
            const requesterAccount = await allUserCollection.findOne({ email: requester })
            if (requesterAccount.role === 'admin') {
                const filter = { email: email }
                const updateDoc = {
                    $set: { role: 'admin' },
                }
                const result = await allUserCollection.updateOne(filter, updateDoc);
                res.send(result)
            }
            else {
                res.status(403).send({ message: 'Forbidden' })
            }

        })


        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body
            const filter = { email: email }
            const options = { upsert: true }
            const updateDoc = {
                $set: user,
            }
            const result = await allUserCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' })
            res.send({ result, token })

        })


        app.get('/user', verifyJWT, async (req, res) => {
            const user = await allUserCollection.find().toArray()
            res.send(user)
        })

        app.post('/user', async (req, res) => {
            const data = req.body;
            const result = await userCollection.insertOne(data)
            res.send(result)
        })

        app.get('/order', verifyJWT, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email
            if (email === decodedEmail) {
                const query = { email: email }
                const result = await userCollection.find(query).toArray()
                return res.send(result)
            }
            else {
                return res.status(403).send({ message: 'Forbidden Access' })
            }
        })


        app.get('/product', async (req, res) => {
            const result = await productCollection.find().toArray()
            res.send(result)
        })

        app.get('/allOrders', async (req, res) => {
            const result = await userCollection.find().toArray()
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
                    orderQuantity: updateInfo.orderQuantity
                }
            }
            const result = await productCollection.updateOne(filter, updateDoc, options);
            res.send(result)
        })

        app.delete('/order/:id', async (req, res) => {
            const { id } = req.params;
            const query = { _id: ObjectId(id) };
            const result = await userCollection.deleteOne(query)
            res.send(result)
        })


        app.put('/profile/:email', async (req, res) => {
            const email = req.params.email;
            console.log(email);
            const user = req.body
            const filter = { email: email }
            const options = { upsert: true }
            const updateDoc = {
                $set: user,
            }
            const result = await allUserCollection.updateOne(filter, updateDoc, options);
            res.send(result)
        })

        app.get('/profile/:email', async (req, res) => {
            const email = req.params.email
            const filter = { email: email }
            const result = await allUserCollection.findOne(filter)
            res.send(result)
        })

        app.post('/addProduct', async (req, res) => {
            const data = req.body;
            const result = await productCollection.insertOne(data)
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