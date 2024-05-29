const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const puppeteer = require('puppeteer-core'); // Use puppeteer-core instead of puppeteer
const path = require('path');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

let browserInstance = null;

app.get('/', (req, res) => {
    res.render('form');
});

app.post('/generate-pdf', async (req, res) => {
    const data = req.body;

    try {
        const html = await ejs.renderFile(path.join(__dirname, 'views', 'pdfTemplate.ejs'), data);

        // Launch a new browser instance if not already running
        if (!browserInstance) {
            browserInstance = await puppeteer.launch({
                executablePath: '/usr/bin/google-chrome', // Specify the correct path to Chrome executable
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
        }

        // Create a new page in the browser
        const page = await browserInstance.newPage();

        // Set HTML content on the page
        await page.setContent(html);

        // Generate PDF from the page content
        const pdf = await page.pdf({ format: 'A4' });

        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="application.pdf"');

        // Send the PDF content as response
        res.send(pdf);
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Error generating PDF');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
