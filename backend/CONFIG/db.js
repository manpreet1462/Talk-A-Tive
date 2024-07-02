const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const MONGO_URI="mongodb+srv://manpreet274:X8ywXPB2XxP0arzQ@cluster0.cedtoyt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
        const conn = await mongoose.connect(MONGO_URI, {
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
    } catch (error) {
        console.error(`Error: ${error.message}`.red.underline.bold);
        process.exit(1);
    }
};

module.exports = connectDB;
