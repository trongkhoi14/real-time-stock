import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { Table, Pagination, Container, Row, Col } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';

const socket = io("http://localhost:8082"); // Kết nối tới backend qua Socket.IO

const StockDashboard = () => {
    const [increasingStocks, setIncreasingStocks] = useState([]);
    const [decreasingStocks, setDecreasingStocks] = useState([]);
    const [highestVolumeStocks, setHighestVolumeStocks] = useState([]);

    // Phân trang
    const [currentPageIncreasing, setCurrentPageIncreasing] = useState(1);
    const [currentPageDecreasing, setCurrentPageDecreasing] = useState(1);
    const [currentPageHighestVolume, setCurrentPageHighestVolume] = useState(1);
    
    const itemsPerPage = 10;

    useEffect(() => {
        // Lắng nghe sự kiện 'update' từ backend để nhận dữ liệu
        socket.on("update", (data) => {
            setIncreasingStocks(data.increasingStocks);
            setDecreasingStocks(data.decreasingStocks);
            setHighestVolumeStocks(data.highestVolumeStocks);
        });

        // Clean up sự kiện khi component bị unmount
        return () => socket.off("update");
    }, []);

    const handlePageChange = (page, type) => {
        if (type === 'increasing') setCurrentPageIncreasing(page);
        if (type === 'decreasing') setCurrentPageDecreasing(page);
        if (type === 'highestVolume') setCurrentPageHighestVolume(page);
    };

    const getPagedData = (data, currentPage) => {
        const start = (currentPage - 1) * itemsPerPage;
        return data.slice(start, start + itemsPerPage);
    };

    const totalPages = (data) => Math.ceil(data.length / itemsPerPage);

    const createPaginationItems = (currentPage, totalPages, type) => {
        let items = [];

        if (totalPages <= 5) {
            // Nếu tổng số trang nhỏ hơn hoặc bằng 5, chỉ hiển thị tất cả các trang
            for (let i = 1; i <= totalPages; i++) {
                items.push(
                    <Pagination.Item
                        key={i}
                        active={i === currentPage}
                        onClick={() => handlePageChange(i, type)}
                        disabled={i === 14 || i === 15} // Vô hiệu hóa mục 14 và 15 như ví dụ
                    >
                        {i}
                    </Pagination.Item>
                );
            }
        } else {
            // Hiển thị các nút phân trang với khả năng cuộn qua
            items.push(
                <Pagination.First
                    key="first"
                    onClick={() => handlePageChange(1, type)}
                />
            );
            items.push(
                <Pagination.Prev
                    key="prev"
                    onClick={() => handlePageChange(currentPage - 1, type)}
                    disabled={currentPage === 1}
                />
            );

            if (currentPage > 3) items.push(<Pagination.Ellipsis key="ellipsis1" />);
            
            for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
                items.push(
                    <Pagination.Item
                        key={i}
                        active={i === currentPage}
                        onClick={() => handlePageChange(i, type)}
                        disabled={i === 14 || i === 15} // Vô hiệu hóa mục 14 và 15 như ví dụ
                    >
                        {i}
                    </Pagination.Item>
                );
            }

            if (currentPage < totalPages - 2) items.push(<Pagination.Ellipsis key="ellipsis2" />);
            
            items.push(
                <Pagination.Next
                    key="next"
                    onClick={() => handlePageChange(currentPage + 1, type)}
                    disabled={currentPage === totalPages}
                />
            );
            items.push(
                <Pagination.Last
                    key="last"
                    onClick={() => handlePageChange(totalPages, type)}
                />
            );
        }
        return items;
    };

    return (
        <Container>
            <Row>
                <Col>
                    <h2>Cổ phiếu tăng mạnh nhất</h2>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Mã cổ phiếu</th>
                                <th>Chênh lệch giá (Đóng - Mở)</th>
                                <th>Giá mở cửa</th>
                                <th>Giá đóng cửa</th>
                                <th>Giá cao nhất</th>
                                <th>Giá thấp nhất</th>
                                <th>Ngày giao dịch</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getPagedData(increasingStocks, currentPageIncreasing).map((stock) => (
                                <tr key={stock.ticker}>
                                    <td>{stock.ticker}</td>
                                    <td>{(stock.close - stock.open).toFixed(2)}</td>
                                    <td>{stock.open}</td>
                                    <td>{stock.close}</td>
                                    <td>{stock.high}</td>
                                    <td>{stock.low}</td>
                                    <td>{stock.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    <Pagination>
                        {createPaginationItems(currentPageIncreasing, totalPages(increasingStocks), 'increasing')}
                    </Pagination>
                </Col>
            </Row>
            <Row>
                <Col>
                    <h2>Cổ phiếu giảm mạnh nhất</h2>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Mã cổ phiếu</th>
                                <th>Chênh lệch giá (Đóng - Mở)</th>
                                <th>Giá mở cửa</th>
                                <th>Giá đóng cửa</th>
                                <th>Giá cao nhất</th>
                                <th>Giá thấp nhất</th>
                                <th>Ngày giao dịch</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getPagedData(decreasingStocks, currentPageDecreasing).map((stock) => (
                                <tr key={stock.ticker}>
                                    <td>{stock.ticker}</td>
                                    <td>{(stock.close - stock.open).toFixed(2)}</td>
                                    <td>{stock.open}</td>
                                    <td>{stock.close}</td>
                                    <td>{stock.high}</td>
                                    <td>{stock.low}</td>
                                    <td>{stock.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    <Pagination>
                        {createPaginationItems(currentPageDecreasing, totalPages(decreasingStocks), 'decreasing')}
                    </Pagination>
                </Col>
            </Row>
            <Row>
                <Col>
                    <h2>Cổ phiếu có khối lượng giao dịch cao nhất</h2>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Mã cổ phiếu</th>
                                <th>Khối lượng</th>
                                <th>Giá mở cửa</th>
                                <th>Giá đóng cửa</th>
                                <th>Giá cao nhất</th>
                                <th>Giá thấp nhất</th>
                                <th>Ngày giao dịch</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getPagedData(highestVolumeStocks, currentPageHighestVolume).map((stock) => (
                                <tr key={stock.ticker}>
                                    <td>{stock.ticker}</td>
                                    <td>{stock.vol}</td>
                                    <td>{stock.open}</td>
                                    <td>{stock.close}</td>
                                    <td>{stock.high}</td>
                                    <td>{stock.low}</td>
                                    <td>{stock.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    <Pagination>
                        {createPaginationItems(currentPageHighestVolume, totalPages(highestVolumeStocks), 'highestVolume')}
                    </Pagination>
                </Col>
            </Row>
        </Container>
    );
};

export default StockDashboard;
