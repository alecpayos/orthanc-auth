"use strict";
const { Readable } = require("stream");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();

// Enable CORS with options for viewer preflight requests
app.use(cors({
    origin: 'http://localhost:3000', // Replace with your allowed origin
    methods: ['GET', 'POST', 'OPTIONS'], // Allowed methods
    allowedHeaders: ["Authorization", "Content-Type"], // Allowed headers
    credentials: true,
}));

// Parse application/json
app.use(bodyParser.json());

// Constants
const PORT = 8080;
const HOST = "localhost";
const ORTHANC_URL = "https://orthanc.getdentalray.com/dicom-web";

app.get('/*', async (request, response) => {
    const request_body = request.body;
    const response_body = {
        granted: true,
        validity: 0,
    };

    let token = request.headers.authorization;

    // Remove "bearer " part of the token
    if (token) {
        if (token.startsWith("bearer ") || token.startsWith("Bearer ")) {
            token = token.slice(7);
        }
    }
    else {
        return response.status(403).json({ message: 'Forbidden: You do not have permission to access this resource.' });
    }

	// Check if token is "demo" (For testing purposes)
    if (token == "demo") {
        const orthancRerouteUrl = ORTHANC_URL + request.url;
        const orthancResponse = await fetch(orthancRerouteUrl);

        if (request.url.includes('frames')) {
            // Set the appropriate headers
            response.setHeader('Content-Type', orthancResponse.headers.get('content-type') || 'application/dicom');
            response.setHeader('Content-Length', orthancResponse.headers.get('content-length'));

            // Stream the file to the response
            return Readable.fromWeb(orthancResponse.body).pipe(response)
        }

        const parsedOrthancRes = await orthancResponse.json();

        return response.send(JSON.stringify(parsedOrthancRes));
    }
    else {
        response_body.granted = false;
        console.log("[FAIL] operation not allowed!");
    }
});

app.listen(PORT, HOST, () => {
    console.log(`[OK] Running on http://${HOST}:${PORT}`);
});
