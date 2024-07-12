const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');

const app = express();

// Bodyparser middleware that accepts form data
app.use(bodyParser.urlencoded({extended: true}));

// Static folder to serve HTML files from public folder
app.use(express.static(path.join(__dirname, 'public')))

// Signup route
app.post('/signup', (req, res) => {
    const {
        firstName, 
        lastName, 
        email
    } = req.body;
    // Validating form
    if(!firstName || !lastName || !email) {
        res.redirect('/fail.html');
        return;
    }

    // Building request data
    // Body parameters dictated by MailChimp: https://mailchimp.com/developer/marketing/api/list-activity/
    // Non-required fields are "Merge fields", i.e. added fields that you can set to be required or not
    // You can also change the tags
    // Found in "Audience" > "All contacts" > Click into specific audience > "Settings" > "Audience fields and *|MERGE|* tags"

    const data = {
        members: [
            {
                email_address: email,
                status: 'subscribed',
                merge_fields: {
                    FNAME: firstName,
                    LNAME: lastName
                }
            }
        ]
    }

    // can't be sent as an object; has to be a string

    const postData = JSON.stringify(data);

    // request to MailChimp API
    // will take in options and a function

    dotenv.config();

    const options = {
        url: 'https://us17.api.mailchimp.com/3.0/lists/5a755257c6',
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.mail_key}`
        },
        body: postData
    }

        // function will take an error if there is one, 
        // a response (must be called response, not res, since res already exists), and the body
    request(options, (err, response, body) => {
        if(err) {
            res.redirect('/fail.html');
            console.log(`immediate error`)
        } else {
            // Check for response status code
            if(response.statusCode === 200) {
                res.redirect('/success.html');
            } else {
                res.redirect('/fail.html');
                console.log(`error with API status code:`, response.statusCode)
            }
        }
    });
})

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started on ${PORT}`));


