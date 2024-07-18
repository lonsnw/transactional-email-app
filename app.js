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

// Email route
app.post('/email', (req, res) => {
    const {
        occasionGreeting,
        senderName, 
        recipientName, 
        recipientEmail
    } = req.body;
    // Validating form
    if(!occasionGreeting || !senderName || !recipientName || !recipientEmail) {
        res.redirect('/fail.html');
        return;
    }

    dotenv.config();

    // Building request data
    // Body parameters dictated by MailChimp: https://mailchimp.com/developer/transactional/api/messages/send-using-message-template/
    // Also used this stackoverflow post to figure things out: https://stackoverflow.com/questions/66425375/mailchimp-mandrill-transactional-emails-how-to-add-custom-data-to-email-templ
    
    const data = {
        "key": `${process.env.TRANSACTIONAL_KEY}`,
        "template_name": "memento-box-gift-notif",
        "template_content": [
            {
                "name": "occasion_greeting",
                "content": occasionGreeting
            },
            {
                "name": "sender_name",
                "content": senderName
            },
            {
                "name": "recipient_name",
                "content": recipientName
            },
            {
                "name": "box_url",
                "content": `<a href="http://localhost:5173/#/recipientbox/1" target="_blank"> <img src="https://lons.dev/white-red-ribbon.png" alt="A white gift box with a bright red ribbon" style="width:50%"> </a>`
            }
        ],
        "message": {
            "text": `Your friends have sent you a Memento Box!  Follow this link to view the box: http://localhost:5173/#/recipientbox.`,
            "subject": `${recipientName}, you've received a Memento Box!`,
            "from_email": `${process.env.FROM_EMAIL}`,
            "from_name": "Memento Box",
            "to": [
                {
                    "email": recipientEmail,
                    "name": recipientName,
                    "type": "to"
                }
            ]
        },
        "send_at": ""
    }

    const postData = JSON.stringify(data);

    // request to MailChimp API
    // will take in options and a function
    // this seems like it will be useful for the collaborators email? https://mailchimp.com/developer/transactional/docs/templates-dynamic-content/#provide-merge-data-through-the-api

    console.log(postData);

    const options = {
        url: `https://mandrillapp.com/api/1.0/messages/send-template.json`,
        method: 'POST',
        body: postData
    }

        // function will take an error if there is one, 
        // a response (must be called response, not res, since res already exists), and the body
    request(options, (err, response, body) => {
        if(err) {
            res.redirect('/fail.html');
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


