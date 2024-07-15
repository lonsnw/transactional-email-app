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

// // Send route
// app.post('/send', (req, res) => {
//     const {
    //     senderName, 
    //     recipientName, 
    //     email
    // } = req.body;
    // // Validating form
    // if(!senderName || !recipientName || !email) {
    //     res.redirect('/fail.html');
    //     return;
//     }

//     // Building request data -- I'm guessing this based on the newsletter app and 
//     // the sample call MailChimp gives https://mailchimp.com/developer/transactional/guides/send-first-email/ 
    
//     const mailchimp = require("mailchimp_transactional")(
//         `${process.env.mail_key}`
//       );

//     const message = {
//         from_email: "gif@lons.dev",
//         subject: `${senderName} is thinking of you!`,
//         text: `${recipientName}, you're the best.`,
//         to: [
//             {
//                 email: email,
//                 type: "to"
//             }
//         ]
//     };

//     async function run() {
//         const response = await mailchimp.messages.send({
//           message
//         });
//         console.log(response);
//       }
//       run();

      
// })

// Email route
app.post('/email', (req, res) => {
    const {
        senderName, 
        recipientName, 
        email
    } = req.body;
    // Validating form
    if(!senderName || !recipientName || !email) {
        res.redirect('/fail.html');
        return;
    }

    dotenv.config();

    // Building request data
    // Body parameters dictated by MailChimp: https://mailchimp.com/developer/transactional/api/messages/send-new-message/
    // Also used this stackoverflow post to figure things out: https://stackoverflow.com/questions/66425375/mailchimp-mandrill-transactional-emails-how-to-add-custom-data-to-email-templ
    
    const data = {
        "key": `${process.env.mail_key}`,
        "template_name": "momentary_paws",
        "template_content": "",
        "message": {
            "text": `Your friend ${senderName} wanted you to know that they're thinking of you and believe in you.`,
            "to": [
                {
                    "email": email,
                    "type": "to",
                }
            ]
        }
    }

    const postData = JSON.stringify(data);

    // request to MailChimp API
    // will take in options and a function
    // this seems like it will be useful for the collaborators email? https://mailchimp.com/developer/transactional/docs/templates-dynamic-content/#provide-merge-data-through-the-api

    console.log(postData);

    const options = {
        url: `https://mandrillapp.com/api/1.0/messages/send.json`,
        method: 'POST',
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
                console.log(response.statusCode)
                // res.redirect('/success.html');
            } else {
                res.redirect('/fail.html');
                console.log(`error with API status code:`, response.statusCode)
            }
        }
    });
})


const PORT = process.env.PORT || 5002;

app.listen(PORT, console.log(`Server started on ${PORT}`));


