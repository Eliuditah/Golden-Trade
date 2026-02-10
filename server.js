const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const app = express();
app.use(express.json());

// Replace these with your real Binance Merchant Keys
const API_KEY = "YOUR_BINANCE_API_KEY";
const SECRET_KEY = "YOUR_BINANCE_SECRET_KEY";

app.post('/api/pay', async (req, res) => {
    const timestamp = Date.now();
    const nonce = crypto.randomBytes(16).toString('hex');
    const body = {
        env: { terminalType: "WEB" },
        orderAmount: req.body.amount,
        orderCurrency: "USDT",
        merchantTradeNo: "ORDER_" + Date.now(),
        goods: { goodsType: "01", goodsCategory: "D000", goodsName: "Trading Balance" }
    };

    const payload = `${timestamp}\n${nonce}\n${JSON.stringify(body)}\n`;
    const signature = crypto.createHmac('sha512', SECRET_KEY).update(payload).digest('hex').toUpperCase();

    try {
        const response = await axios.post("https://bpay.binanceapi.com/binancepay/openapi/v2/order", body, {
            headers: {
                'binancepay-signature': signature,
                'binancepay-nonce': nonce,
                'binancepay-timestamp': timestamp,
                'binancepay-api-key': API_KEY,
                'content-type': 'application/json'
            }
        });
        res.json({ checkoutUrl: response.data.data.checkoutUrl });
    } catch (err) {
        res.status(500).json({ error: "Binance Connection Error" });
    }
});

app.listen(3000, () => console.log("GoldenTrade server live on port 3000"));