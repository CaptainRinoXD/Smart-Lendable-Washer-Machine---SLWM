import mongoose from "mongoose"

function connectDb() {
    mongoose.connect('mongodb://127.0.0.1:27017/yourDatabaseName', {
        })
        .then(() => console.log('Connected to MongoDB'))
        .catch(err => console.error('Could not connect to MongoDB:', err));
}

export default connectDb;