import express from 'express';

const router = express.Router();

// Realistic IPO data (would be fetched from external source in production)
const ipoData = [
    {
        id: "tata-tech-ipo",
        name: "Tata Technologies Limited",
        symbol: "TATATECH.NS",
        logo: "https://upload.wikimedia.org/wikipedia/commons/8/8e/Tata_logo.svg",
        issuePrice: { min: 475, max: 500 },
        lotSize: 30,
        gmp: 450,
        subscriptionTimes: {
            total: 69.43,
            retail: 9.95,
            qib: 200.47,
            nii: 44.03
        },
        status: "listed",
        dates: {
            open: "2023-11-22",
            close: "2023-11-24",
            allotment: "2023-11-29",
            listing: "2023-11-30"
        },
        listingPrice: 1200,
        currentPrice: 1050,
        listingGain: "+140%",
        category: "Mainboard",
        sector: "Technology & Engineering",
        exchange: "NSE, BSE",
        issueSize: "₹3,042 Cr",
        description: "Tata Technologies is a global engineering and product development digital services company. They provide outsourced engineering services to the automotive and aerospace industries.",
        keyMetrics: {
            pe: 42.5,
            eps: 24.7,
            marketCap: "₹42,500 Cr"
        }
    },
    {
        id: "ireda-ipo",
        name: "Indian Renewable Energy Development Agency",
        symbol: "IREDA.NS",
        logo: "https://upload.wikimedia.org/wikipedia/en/4/41/IREDA_Logo.png",
        issuePrice: { min: 30, max: 32 },
        lotSize: 460,
        gmp: 45,
        subscriptionTimes: {
            total: 38.80,
            retail: 7.55,
            qib: 110.26,
            nii: 35.42
        },
        status: "listed",
        dates: {
            open: "2023-11-21",
            close: "2023-11-23",
            allotment: "2023-11-28",
            listing: "2023-11-29"
        },
        listingPrice: 50,
        currentPrice: 185,
        listingGain: "+56%",
        category: "Mainboard",
        sector: "Renewable Energy Finance",
        exchange: "NSE, BSE",
        issueSize: "₹2,150 Cr",
        description: "IREDA is a Mini Ratna (Category-I) Government of India Enterprise under the Ministry of New and Renewable Energy (MNRE). It promotes, develops and extends financial assistance for renewable energy projects.",
        keyMetrics: {
            pe: 18.2,
            eps: 10.2,
            marketCap: "₹15,800 Cr"
        }
    },
    {
        id: "mobikwik-ipo",
        name: "One MobiKwik Systems Limited",
        symbol: "MOBIKWIK.NS",
        logo: "https://upload.wikimedia.org/wikipedia/commons/1/1d/MobiKwik_Logo.svg",
        issuePrice: { min: 265, max: 279 },
        lotSize: 53,
        gmp: 180,
        subscriptionTimes: {
            total: 119.38,
            retail: 134.67,
            qib: 119.5,
            nii: 108.95
        },
        status: "open",
        dates: {
            open: "2024-12-11",
            close: "2024-12-13",
            allotment: "2024-12-16",
            listing: "2024-12-18"
        },
        listingPrice: null,
        currentPrice: null,
        listingGain: null,
        category: "Mainboard",
        sector: "FinTech",
        exchange: "NSE, BSE",
        issueSize: "₹572 Cr",
        description: "MobiKwik is a digital payments and financial services company offering mobile wallets, payment solutions, and consumer lending through its platform.",
        keyMetrics: {
            pe: null,
            eps: -8.5,
            marketCap: "Est. ₹3,500 Cr"
        }
    },
    {
        id: "sai-life-sciences-ipo",
        name: "Sai Life Sciences Limited",
        symbol: "SAILIFE.NS",
        logo: null,
        issuePrice: { min: 522, max: 549 },
        lotSize: 27,
        gmp: 95,
        subscriptionTimes: {
            total: 10.27,
            retail: 4.15,
            qib: 16.83,
            nii: 6.78
        },
        status: "open",
        dates: {
            open: "2024-12-11",
            close: "2024-12-13",
            allotment: "2024-12-16",
            listing: "2024-12-18"
        },
        listingPrice: null,
        currentPrice: null,
        listingGain: null,
        category: "Mainboard",
        sector: "Pharmaceuticals",
        exchange: "NSE, BSE",
        issueSize: "₹3,043 Cr",
        description: "Sai Life Sciences is a contract research and manufacturing organization (CDMO) providing services to pharmaceutical and biotech companies globally.",
        keyMetrics: {
            pe: null,
            eps: 12.4,
            marketCap: "Est. ₹12,000 Cr"
        }
    },
    {
        id: "vishal-mega-mart-ipo",
        name: "Vishal Mega Mart Limited",
        symbol: "VMART",
        logo: null,
        issuePrice: { min: 74, max: 78 },
        lotSize: 190,
        gmp: 22,
        subscriptionTimes: {
            total: 0,
            retail: 0,
            qib: 0,
            nii: 0
        },
        status: "upcoming",
        dates: {
            open: "2024-12-11",
            close: "2024-12-13",
            allotment: "2024-12-16",
            listing: "2024-12-18"
        },
        listingPrice: null,
        currentPrice: null,
        listingGain: null,
        category: "Mainboard",
        sector: "Retail",
        exchange: "NSE, BSE",
        issueSize: "₹8,000 Cr",
        description: "Vishal Mega Mart is a hypermarket chain offering a wide range of products including apparel, groceries, and general merchandise at value prices.",
        keyMetrics: {
            pe: null,
            eps: 3.2,
            marketCap: "Est. ₹35,000 Cr"
        }
    },
    {
        id: "gandhar-oil-ipo",
        name: "Gandhar Oil Refinery (India) Limited",
        symbol: "GANDHAR.NS",
        logo: null,
        issuePrice: { min: 160, max: 169 },
        lotSize: 88,
        gmp: 0,
        subscriptionTimes: {
            total: 57.74,
            retail: 35.21,
            qib: 81.45,
            nii: 43.12
        },
        status: "closed",
        dates: {
            open: "2024-01-16",
            close: "2024-01-18",
            allotment: "2024-01-19",
            listing: "2024-01-22"
        },
        listingPrice: 231,
        currentPrice: 198,
        listingGain: "+37%",
        category: "Mainboard",
        sector: "Oil & Lubricants",
        exchange: "NSE, BSE",
        issueSize: "₹500 Cr",
        description: "Gandhar Oil Refinery is a manufacturer of white oils, transformer oils, and other specialty petroleum products.",
        keyMetrics: {
            pe: 22.5,
            eps: 8.8,
            marketCap: "₹3,200 Cr"
        }
    }
];

// Get all IPOs with optional status filter
router.get('/list', (req, res) => {
    const { status } = req.query;

    let filteredIPOs = ipoData;
    if (status && ['open', 'upcoming', 'listed', 'closed'].includes(status)) {
        filteredIPOs = ipoData.filter(ipo => ipo.status === status);
    }

    // Return simplified list for overview
    const list = filteredIPOs.map(ipo => ({
        id: ipo.id,
        name: ipo.name,
        symbol: ipo.symbol,
        issuePrice: ipo.issuePrice,
        gmp: ipo.gmp,
        status: ipo.status,
        dates: ipo.dates,
        listingGain: ipo.listingGain,
        subscriptionTimes: ipo.subscriptionTimes.total,
        sector: ipo.sector
    }));

    res.json(list);
});

// Get single IPO details
router.get('/:ipoId', (req, res) => {
    const ipo = ipoData.find(i => i.id === req.params.ipoId);

    if (!ipo) {
        return res.status(404).json({ error: 'IPO not found' });
    }

    res.json(ipo);
});

// Get IPO statistics
router.get('/stats/overview', (req, res) => {
    const stats = {
        open: ipoData.filter(i => i.status === 'open').length,
        upcoming: ipoData.filter(i => i.status === 'upcoming').length,
        listed: ipoData.filter(i => i.status === 'listed').length,
        closed: ipoData.filter(i => i.status === 'closed').length,
        totalThisYear: ipoData.length,
        avgListingGain: "+42%"
    };
    res.json(stats);
});

export default router;
