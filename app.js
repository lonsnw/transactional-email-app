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
        keyword, 
        interval, 
        name,
        email
    } = req.body;
    // Validating form
    if(!keyword || !interval || !name || !email) {
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
        // "mail_dc" in the URL is my assigned Data Center, which i've stored in the .env file
        // the data center can be found at the start of your URL when you're on your dashboard
        // https://mailchimp.com/developer/marketing/docs/fundamentals/#connecting-to-the-api
        // "mail_aud_id" in the URL is my Audience ID (or list_id), which I've stored in the .env file
        // the audience ID can be found from your Dashboard:
        // "Audience" > "Audience dashboard" > "Manage Audience" > "Settings" and it's at the bottom of the page
        // or follow these steps: https://mailchimp.com/help/find-audience-id/ 
        url: `https://${process.env.mail_dc}.api.mailchimp.com/3.0/lists/${process.env.mail_aud_id}`,
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

const PORT = process.env.PORT || 5002;

app.listen(PORT, console.log(`Server started on ${PORT}`));


