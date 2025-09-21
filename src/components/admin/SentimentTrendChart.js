import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const SentimentTrendChart = ({ data }) => {
    if (!data || !data.labels || !data.data) {
        return <div>Loading sentiment data...</div>;
    }

    const chartData = {
        labels: data.labels,
        datasets: [
            {
                label: 'Average Sentiment Score',
                data: data.data,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Employee Sentiment Trend (Last 30 Days)',
            },
        },
        scales: {
            y: {
                beginAtZero: false, // Sentiment can be negative
                min: -1,
                max: 1,
            }
        }
    };

    return <Line data={chartData} options={options} />;
};

export default SentimentTrendChart;
