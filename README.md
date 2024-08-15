# Stock Trading Real-time Dashboard

## Description
This is a real-time stock data dashboard displaying the top increasing, decreasing, and highest volume stocks. The system includes a frontend (React.js), backend (Node.js), and Kafka for real-time data processing.

## System Architecture
![alt text](<Untitled Diagram.drawio (6).png>)
The system is divided into three main components:

- Producer (Producer.js): Fetches data from the API and sends it to Kafka.
- Consumer (Consumer.js): Receives data from Kafka and sends it to the frontend via Socket.IO.
- Frontend: Displays the data and updates it in real-time.

## Installation
1. Clone repository
```
git clone <repository-url>
cd <repository-folder>
```
2. Install backend dependencies
```
cd backend
npm install
```
3. Install frontend dependencies
```
cd frontend
npm install
```
## Running the System
1. Start Kafka

- Start Kafka and Zookeeper on your local machine or a remote server. If you haven't installed Kafka, refer to the Kafka documentation for installation and startup.
- Create a Kafka topic to transmit data, e.g., stock_data.

2. Run the Producer (Backend)

The producer will fetch data from the API and send it to Kafka.
```
cd backend
node producer.js
```
3. Run the Consumer (Backend)

The consumer will receive data from Kafka and send it to the frontend via Socket.IO.
```
cd backend
node consumer.js
```
4. Run the Frontend (React.js)

Start the frontend to display the data.
```
cd frontend
npm start
```
The frontend will be available at http://localhost:3000.

## Project Structure
```
├── backend
│   ├── producer.js          # Fetch data from the API and send it to Kafka
│   ├── consumer.js          # Receive data from Kafka and send it to the frontend
│   ├── package.json         # Backend dependencies
│   └── ...
├── frontend
│   ├── src
│   │   ├── components
│   │   │   └── StockDashboard.js  # Displays stock data tables
│   │   └── App.js           # Main app component
│   ├── public
│   ├── package.json         # Frontend dependencies
│   └── ...
└── README.md                # Documentation
```
