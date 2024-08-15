const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const kafka = require("kafkajs").Kafka;
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

app.use(cors());

const kafkaConsumer = new kafka({
    clientId: "stock-app",
    brokers: ["localhost:9092"],
});

const consumer = kafkaConsumer.consumer({ groupId: "stock-group" });

const runConsumer = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: "stock-data", fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const data = JSON.parse(message.value.toString());
            console.log("Received data from stock-data: " + data.length + " item")
            const processedData = processStockData(data);

            // Gửi dữ liệu tới frontend qua Socket.IO
            io.emit("update", processedData);
        },
    });
};

const processStockData = (data) => {
    const increasingStocks = data
        .sort((a, b) => b.close - b.open - (a.close - a.open))
        .slice(0, data.length);
    const decreasingStocks = data
        .sort((a, b) => a.close - a.open - (b.close - b.open))
        .slice(0, data.length);
    const highestVolumeStocks = data.sort((a, b) => b.vol - a.vol).slice(0, data.length);

    return { increasingStocks, decreasingStocks, highestVolumeStocks };
};

// Start Kafka Consumer
runConsumer().catch(console.error);

// Start server
server.listen(8082, () => {
    console.log(`Consumer server running on port 8082`);
});
