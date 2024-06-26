const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'assets' directory
app.use(express.static(path.join(__dirname, 'views', 'assets')));
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
        const pdf = await page.pdf({ format: 'A4', timeout: 9000000, margin: {
            top: '20px',
            right: '20px',
            bottom: '25px',
            left: '20px'
        }});

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
