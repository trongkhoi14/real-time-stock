const express = require("express");
const axios = require("axios");
const kafka = require("kafkajs").Kafka;
const app = express();
const cors = require("cors");

const kafkaProducer = new kafka({
    clientId: "stock-app",
    brokers: ["localhost:9092"], // Địa chỉ Kafka broker của bạn
});

const producer = kafkaProducer.producer();
app.use(cors());
app.use(express.json());

const fetchDataFromAPI = async () => {
    try {
        const response = await axios.post(
            "https://stocktraders.vn/service/data/getTotalTradeReal",
            {
                TotalTradeRealRequest: { account: "StockTraders" },
            }
        );
        return response.data.TotalTradeRealReply.stockTotalReals;
    } catch (error) {
        console.error("Error fetching data from API:", error);
        return [];
    }
};

const sendToKafka = async (data) => {
    try {
        await producer.connect();
        await producer.send({
            topic: "stock-data",
            messages: [{ value: JSON.stringify(data) }],
        });
        console.log("Send to stock-data: " + data.length + " item");
        await producer.disconnect();
    } catch (error) {
        console.error("Error sending data to Kafka:", error);
    }
};

// Fetch data từ API định kỳ
setInterval(async () => {
    const data = await fetchDataFromAPI();
    if (data.length) {
        await sendToKafka(data);
    }
}, 3000);

app.listen(8081, () => console.log(`Producer server running on port 8081`));
