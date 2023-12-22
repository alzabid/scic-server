const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middle ware
app.use(cors({}));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uhhy7ix.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server    (optional starting in v4.7)
    // await client.connect();

    const tasksCollection = client.db("TaskDB").collection("Tasks");

    app.post("/task", async (req, res) => {
      const task = req.body;
      const result = await tasksCollection.insertOne(task);
      res.send(result);
    });

    app.get("/task", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await tasksCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await tasksCollection.findOne(query);
      res.send(result);
    });

    // app.put("/task/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const filter = { _id: new ObjectId(id) };
    //   const options = { upsert: true };
    //   const updateTask = req.body;

    //   const task = {
    //     $set: {
    //       title: updateTask.title,
    //       description: updateTask.description,
    //       deadline: updateTask.deadline,
    //       priority: updateTask.priority,
    //     },
    //   };

    //   const result = await tasksCollection.updateOne(filter, task, options);
    //   res.send(result);
    // });

    app.patch("/tasks/:id", async (req, res) => {
      const taskId = req.params.id;
      const { status } = req.body;
      const result = tasksCollection.updateOne(
        { _id: new ObjectId(taskId) },
        { $set: { status } }
      );
      res.send(result);
    });

    app.delete("/task/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await tasksCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(port, () => {
  console.log(` Server is running on port ${port}`);
});
