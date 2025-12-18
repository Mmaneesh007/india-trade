import express from 'express';

const router = express.Router();

const generateMockFunds = () => {
    return {
        "Equity": {
            "Large Cap": [
                {
                    "fund_name": "SBI Bluechip Fund",
                    "latest_nav": 45.67,
                    "percentage_change": 0.45,
                    "asset_size": 25000,
                    "return_1y": 12.5,
                    "return_3y": 40.2,
                    "return_5y": 70.5,
                    "star_rating": 4
                },
                {
                    "fund_name": "HDFC Top 100 Fund",
                    "latest_nav": 512.30,
                    "percentage_change": -0.12,
                    "asset_size": 18500,
                    "return_1y": 11.2,
                    "return_3y": 38.5,
                    "return_5y": 68.1,
                    "star_rating": 4
                },
                {
                    "fund_name": "ICICI Prudential Bluechip Fund",
                    "latest_nav": 65.40,
                    "percentage_change": 0.88,
                    "asset_size": 32000,
                    "return_1y": 14.1,
                    "return_3y": 42.6,
                    "return_5y": 75.3,
                    "star_rating": 5
                }
            ],
            "Mid Cap": [
                {
                    "fund_name": "Kotak Emerging Equity Fund",
                    "latest_nav": 78.90,
                    "percentage_change": 1.25,
                    "asset_size": 15000,
                    "return_1y": 18.5,
                    "return_3y": 55.2,
                    "return_5y": 92.1,
                    "star_rating": 5
                },
                {
                    "fund_name": "HDFC Mid-Cap Opportunities Fund",
                    "latest_nav": 112.50,
                    "percentage_change": 0.60,
                    "asset_size": 28000,
                    "return_1y": 19.8,
                    "return_3y": 52.4,
                    "return_5y": 88.5,
                    "star_rating": 5
                }
            ],
            "Small Cap": [
                {
                    "fund_name": "Nippon India Small Cap Fund",
                    "latest_nav": 95.20,
                    "percentage_change": 2.10,
                    "asset_size": 21000,
                    "return_1y": 28.5,
                    "return_3y": 85.4,
                    "return_5y": 150.2,
                    "star_rating": 5
                },
                {
                    "fund_name": "SBI Small Cap Fund",
                    "latest_nav": 105.60,
                    "percentage_change": 1.50,
                    "asset_size": 19500,
                    "return_1y": 25.4,
                    "return_3y": 80.1,
                    "return_5y": 142.5,
                    "star_rating": 4
                }
            ]
        },
        "Debt": {
            "Liquid": [
                {
                    "fund_name": "Aditya Birla Sun Life Liquid Fund",
                    "latest_nav": 345.10,
                    "percentage_change": 0.01,
                    "asset_size": 50000,
                    "return_1y": 6.8,
                    "return_3y": 18.2,
                    "return_5y": 32.5,
                    "star_rating": 4
                },
                {
                    "fund_name": "SBI Liquid Fund",
                    "latest_nav": 3120.50,
                    "percentage_change": 0.02,
                    "asset_size": 65000,
                    "return_1y": 6.9,
                    "return_3y": 18.5,
                    "return_5y": 33.1,
                    "star_rating": 5
                }
            ],
            "Corporate Bond": [
                {
                    "fund_name": "HDFC Corporate Bond Fund",
                    "latest_nav": 45.20,
                    "percentage_change": 0.05,
                    "asset_size": 12000,
                    "return_1y": 7.5,
                    "return_3y": 22.4,
                    "return_5y": 40.2,
                    "star_rating": 4
                }
            ]
        },
        "Hybrid": {
            "Balanced Advantage": [
                {
                    "fund_name": "ICICI Prudential Balanced Advantage Fund",
                    "latest_nav": 56.70,
                    "percentage_change": 0.30,
                    "asset_size": 42000,
                    "return_1y": 10.5,
                    "return_3y": 32.1,
                    "return_5y": 60.5,
                    "star_rating": 4
                },
                {
                    "fund_name": "HDFC Balanced Advantage Fund",
                    "latest_nav": 280.50,
                    "percentage_change": 0.45,
                    "asset_size": 48000,
                    "return_1y": 11.2,
                    "return_3y": 34.5,
                    "return_5y": 64.2,
                    "star_rating": 4
                }
            ],
            "Aggressive Hybrid": [
                {
                    "fund_name": "SBI Equity Hybrid Fund",
                    "latest_nav": 195.40,
                    "percentage_change": 0.60,
                    "asset_size": 36000,
                    "return_1y": 13.5,
                    "return_3y": 38.2,
                    "return_5y": 72.5,
                    "star_rating": 5
                }
            ]
        }
    };
};

router.get('/', (req, res) => {
    try {
        const data = generateMockFunds();
        res.json(data);
    } catch (error) {
        console.error('Error serving mutual funds:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
