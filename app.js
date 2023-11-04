var express = require('express');
var path = require('path');
var app = express();
const fs = require('fs');
const exphbs = require('express-handlebars');
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Handlebars initialization with custom helpers
const hbs = exphbs.create({
    extname: '.hbs',
    helpers: {
        classify: (value) => {
            return value && value.trim() !== "" ? value : "UNKNOWN";
        },
        eq: (v1, v2) => v1 === v2
    }
});

app.engine('.hbs', hbs.engine);
app.set('view engine', 'hbs');

let Data = null;

fs.readFile(path.join(__dirname, 'CarSales.json'), 'utf-8', (err, data) => {
    if (err) {
        console.error('Error loading JSON data:', err);
        process.exit(1);
    }
    try {
        Data = JSON.parse(data);
        console.log('JSON data is loaded and ready!');
        
    } catch (parseErr) {
        console.error('Error parsing JSON data:', parseErr);
        process.exit(1);
    }
});

app.get('/', function(req, res) {
    res.render('index', { title: 'Express' });
});

app.get('/data', (req, res) => {
    if (!Data) {
        return res.render('error', { title: 'Error', message: 'Error loading JSON data.' });
    }
    res.render('alldata', { data: Data });
});

app.get('/data/invoiceNo/:index', (req, res) => {
    const index = parseInt(req.params.index, 10);
    if (isNaN(index) || index < 0 || index >= Data.length) {
        return res.render('error', { message: 'Invalid index provided or data not loaded.' });
    }
    const item = Data[index];
    res.render('invoiceDetail', { item });
});

app.get('/search/invoiceID', (req, res) => {
    res.render('InvoiceSearch');
});

app.post('/search/invoiceID', (req, res) => {
    const invoiceID = req.body.invoiceID; // Access the property directly to avoid potential destructuring issues
    if (!Data) {
        return res.render('error', { message: 'Error loading JSON data.' });
    }
    const result = Data.find(item => item.InvoiceNo === invoiceID);
    if (result) {
        res.render('invoiceDetail', { item: result });
    } else {
        res.render('error', { message: `No data found for InvoiceNo: ${invoiceID}` });
    }
});

// Display the manufacturer search form
app.get('/search/manufacturer', (req, res) => {
    res.render('ManufacturerSearch');
});

// Handle the manufacturer search form submission
app.post('/search/manufacturer', (req, res) => {
    const manufacturer = req.body.manufacturer; // Access the property directly
    if (!Data) {
        return res.render('error', { message: 'Error loading JSON data.' });
    }
    const matchedRecords = Data.filter(item => 
        item.Manufacturer && item.Manufacturer.toLowerCase().includes(manufacturer.toLowerCase())
    );
    if (matchedRecords.length > 0) {
        res.render('ManufacturerDetail', { records: matchedRecords, Query:manufacturer });
    } else {
        res.render('error', { message: `No sales records found for Manufacturer: ${manufacturer}` });
    }
});

app.get('/users', function(req, res) {
    res.send('respond with a resource');
});


app.get('/filteredData', (req, res) => {  // changed endpoint to '/filteredData'
    if (!Data) {
        return res.render('error', { title: 'Error', message: 'Error loading JSON data.' });
    }
    // Filter out items with blank "class"
    const filteredData = Data.filter(item => item.class && item.class.trim() !== "");
    res.render('allData', { data: filteredData });  // adjusted the view name to 'filteredData' for clarity
});




app.get('*', function(req, res) {
    res.render('error', { title: 'Error', message:'Wrong Route' });
});

app.listen(port, () => { // Start the server after defining all routes
    console.log(`Server running on http://localhost:${port}`);
});


