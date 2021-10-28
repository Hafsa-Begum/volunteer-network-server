const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wvayw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("volunteer_events");
        const eventCollection = database.collection("events");
        const myEventCollection = client.db("volunteer_events").collection("myEvents");
        //get api
        app.get('/events', async (req, res) => {
            const cursor = eventCollection.find({});
            const events = await cursor.toArray();
            //res.send('getting events ')
            res.send(events);
        })
        //post api
        app.post('/events', async (req, res) => {
            const newEvent = req.body;
            const result = await eventCollection.insertOne(newEvent);
            console.log('got newEvent', req.body)
            console.log('got new event', result)
            res.json(result);
        })
        //add my events in database
        app.post('/addedEvents', async (req, res) => {
            console.log(req.body)
            const addedEvent = req.body;
            const result = await myEventCollection.insertOne(addedEvent);
            res.json(result);
        })
        //get all my events by email query
        app.get('/myEvents/:email', async (req, res) => {
            console.log(req.params.email);
            const result = await myEventCollection.find({ email: req.params.email }).toArray();
            console.log(result)
            res.send(result);
        })
    }
    finally {
        //await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('volunteer network server running');
})

app.listen(port, () => {
    console.log('server running to port', port)
})