"use strict";

require('dotenv').config();
const { Readable } = require("stream");
const Log = require('./logger');
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();

const {
    PORT,
    HOST,
    ORTHANC_URL,
} = process.env;

// Enable CORS with options for viewer preflight requests
app.use(cors({
    origin: 'http://localhost:3000', // Replace with your allowed origin
    methods: ['GET', 'POST', 'OPTIONS'], // Allowed methods
    allowedHeaders: ["Authorization", "Content-Type"], // Allowed headers
    credentials: true,
}));

// Parse application/json
app.use(bodyParser.json());

app.get('/*', async (request, response) => {
    const ip = request.headers['x-forwarded-for'] || request.socket.remoteAddress || undefined;
    const browser = request.headers['user-agent'] || undefined;
    const requestBody = request.body || undefined;
    
    Log.props = { ip, browser };

    const response_body = {
        granted: true,
        validity: 0,
    };
    
    let token = request.headers.authorization;

    // Remove "Bearer " part of the token
    if (token) {
        if (token.startsWith("bearer ") || token.startsWith("Bearer ")) {
            token = token.slice(7);
        }
    }
    else {
        Log.error("403 User access forbidden: No token");

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

            Log.info("Successfully fetched viewer dicom image data");

            // Stream the file to the response
            return Readable.fromWeb(orthancResponse.body).pipe(response)
        }

        const parsedOrthancRes = await orthancResponse.json();
        Log.info("Successfully fetched viewer non-dicom image data");

        return response.send(JSON.stringify(parsedOrthancRes));
    }
    else {
        response_body.granted = false;
        Log.error("[FAIL] Operation not allowed");

        return;
    }
});

app.listen(PORT, HOST, () => {
    Log.info(`Started server on: http://${HOST}:${PORT}`);
});
