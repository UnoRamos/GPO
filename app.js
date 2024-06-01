const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

let browserInstance; // Reuse browser instance

app.get('/', (req, res) => {
    res.render('form');
});

app.post('/generate-pdf', async (req, res) => {
    const data = req.body;

    try {
        const html = await ejs.renderFile(path.join(__dirname, 'views', 'pdfTemplate.ejs'), data);

        if (!browserInstance) {
            browserInstance = await puppeteer.launch({
                headless: true, // Run in headless mode
                args: ['--no-sandbox', '--disable-setuid-sandbox'] // Required for Linux environments
            });
        }

        const page = await browserInstance.newPage();
        await page.setContent(html);
        
        // Set a longer timeout duration
        const pdf = await page.pdf({ format: 'A4', timeout: 9000000 });

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=application.pdf`,
        });
        res.send(pdf);
    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).send('PDF generation error');
    }
});

    // Load signature images
    const signature1Bytes = await fs.promises.readFile('signature1.png');
    const signature2Bytes = await fs.promises.readFile('signature2.png');
    const signature3Bytes = await fs.promises.readFile('signature3.png');

    // Embed signature images
    const signature1Image = await pdfDoc.embedPng(signature1Bytes);
    const signature2Image = await pdfDoc.embedPng(signature2Bytes);
    const signature3Image = await pdfDoc.embedPng(signature3Bytes);

    // Get the first page of the PDF document
    const page = pdfDoc.getPages()[0];

    // Draw signature 1
    page.drawImage(signature1Image, {
        x: 50,
        y: 50,
        width: 100, // Adjust width as needed
    });

    // Draw signature 2
    page.drawImage(signature2Image, {
        x: 50,
        y: 150, // Adjust y position as needed
        width: 100, // Adjust width as needed
    });

    // Draw signature 3
    page.drawImage(signature3Image, {
        x: 50,
        y: 250, // Adjust y position as needed
        width: 100, // Adjust width as needed
    });
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
