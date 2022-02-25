import * as functions from "firebase-functions";
import * as express from "express";
import axios from "axios";

const app = express();

app.get("/", (req: any, res: any) => {
    res.status(200).json({message: "Hello World"});
});

app.get('/get_token', _access_token, (req: any, res: any) => {
    res.status(200).json({message: req.access_token});
})

function _access_token(req: any, res: any, next: any) {
    const endpoint = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    const consumer_key = "#"
    const consumer_secret = "#"

    const auth = new Buffer(consumer_key + ":" + consumer_secret).toString('base64')

    axios.get(endpoint, {
        headers: {
            "Authorization": "Basic " + auth
        },
    }).then((response: any) => {
        if (response.error) {
            console.log(response.error)
            res.status(401).json({message: response.error})
        }

        req.access_token = response.data.access_token

        next()
    });
}

//register url
app.get("/register", _access_token, (req: any, res: any) => {
    const endpoint = "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl"

    const data = {
        "ShortCode": "600610",
        "ResponseType": "Completed",
        "ConfirmationURL": "https://0a22-102-69-229-30.ngrok.io/daraja-api-2e0ae/us-central1/main/c2b/confirm",
        "ValidationURL": "https://0a22-102-69-229-30.ngrok.io/daraja-api-2e0ae/us-central1/main/c2b/validate"
    }

    axios.post(endpoint, data, {
        headers: {
            "Authorization": "Bearer " + req.access_token
        }
    }).then((response: any) => {
        if (response.error) {
            console.log(response.error)
            res.status(401).json({message: response.error})
        }

        res.status(200).json(response.data)
    })
});

app.post("/c2b/confirm", (req: any, res: any) => {
    console.log(req.body)
    res.status(200).json({
        "ResultCode": 0,
        "ResultDesc": "Success"
    })
})

app.post("/c2b/validate", (req: any, res: any) => {
    console.log(req.body)
    res.status(200).json({
        "ResultCode": 0,
        "ResultDesc": "Success"
    })
})

//simulate
app.get("/simulate", _access_token, (req: any, res: any) => {
    const endpoint = "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/simulate"

    const data = {
        "ShortCode": "600610",
        "Amount": 1000,
        "BillRefNumber": "TestPay",
        "Msisdn": "254716732809",
        "CommandID": "CustomerPayBillOnline"

    }

    axios.post(endpoint, data, {
        headers: {
            "Authorization": "Bearer " + req.access_token
        }
    }).then((response: any) => {
        if (response.error) {
            console.log(response.error)
            res.status(401).json({message: response.error})
        }

        res.status(200).json(response.data)
    })
});

export const main = functions.https.onRequest(app);
