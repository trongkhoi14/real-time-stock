const express = require('express');
const axios = require('axios');
const socketIo = require('socket.io');
const http = require('http');
const cors = require('cors');

const app = express();
const port = 8081;
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Địa chỉ frontend
    methods: ["GET", "POST"]
  }
});

app.use(cors());

// API Route
app.get('/', async (req, res) => {
  try {
    const response = await axios.post('https://stocktraders.vn/service/data/getTotalTradeReal', {
      TotalTradeRealRequest: { account: 'StockTraders' }
    });

    console.log(response.data);
    res.send(response.data.TotalTradeRealReply.stockTotalReals[0]);
  } catch (error) {
    res.status(500).send('Error fetching data');
  }
});

// Function to process data from API
const processStockData = (data) => {
  // Tính toán danh sách cổ phiếu tăng mạnh nhất
  const increasingStocks = data.sort((a, b) => (b.close - b.open) - (a.close - a.open)).slice(0, 10);

  // Tính toán danh sách cổ phiếu giảm mạnh nhất
  const decreasingStocks = data.sort((a, b) => (a.close - a.open) - (b.close - b.open)).slice(0, 10);

  // Tính toán danh sách cổ phiếu có khối lượng giao dịch cao nhất
  const highestVolumeStocks = data.sort((a, b) => b.vol - a.vol).slice(0, 10);

  return { increasingStocks, decreasingStocks, highestVolumeStocks };
};

// Function to fetch data from API and emit to frontend via Socket.IO
const runConsumer = async () => {
  try {
    const response = await axios.post('https://stocktraders.vn/service/data/getTotalTradeReal', {
      TotalTradeRealRequest: { account: 'StockTraders' }
    });

    const processedData = processStockData(response.data.TotalTradeRealReply.stockTotalReals);

    // Gửi dữ liệu tới frontend qua Socket.IO
    io.emit('update', processedData);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

// Cập nhật dữ liệu mỗi 3 giây
setInterval(runConsumer, 3000);

// Start the server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
