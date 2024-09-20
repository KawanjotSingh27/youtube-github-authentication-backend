const express = require('express');
require("dotenv").config();

const app=express();
const PORT=process.env.PORT || 5000;
const client_id_youtube=process.env.YOUTUBE_CLIENT_ID;
const client_secret_youtube=process.env.YOUTUBE_CLIENT_SECRET;
const client_id_github=process.env.GITHUB_CLIENT_ID;
const client_secret_github=process.env.GITHUB_CLIENT_SECRET;


app.get('/callback/youtube',(req,res)=>{

    const code=req.query.code;

    if(!code){
        return res.status(400).send("Authorization code is missing");
    }

    const tokenUrl = 'https://oauth2.googleapis.com/token';
    const data = {
        client_id: client_id_youtube,
        client_secret: client_secret_youtube,
        redirect_uri: 'http://localhost:5000/callback/youtube',
        grant_type: 'authorization_code',
        code: code,
    };

    fetch(tokenUrl, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        "Accept": "application/json",
        },
        body: new URLSearchParams(data).toString(),
    })
    .then((response) => response.json())
    .then((tokenData) => {
        if (tokenData.error) {
            return res.status(400).json({ error: tokenData.error });
        }

        const oauthToken = tokenData.access_token;

        res.redirect(`http://localhost:5173/callback/callback_youtube?oauthToken=${oauthToken}`);
        })
    .catch((error) => {
        console.error('Error exchanging code for token:', error);
        res.status(500).send('Error exchanging code for token');
        });
    
});

app.get("/callback/github",(req,res)=>{
    const code=req.query.code;

    if(!code){
        return res.status(400).send("Authorization code is missing");
    }

    const tokenUrl="https://github.com/login/oauth/access_token";
    const data={
        client_id:client_id_github,
        client_secret:client_secret_github,
        code:code,
        redirect_uri:"http://localhost:5000/callback/github"
    }

    fetch(tokenUrl,{
        method:"POST",
        headers:{
            "Content-Type":"application/x-www-form-urlencoded",
        },
        body:new URLSearchParams(data).toString(),
    })
    .then(async (response) => {
        const contentType = response.headers.get("content-type");

        if (contentType.includes("application/json")) {
            return response.json();
        } else if (contentType.includes("application/x-www-form-urlencoded")) {
            const text = await response.text();
            return Object.fromEntries(new URLSearchParams(text));
        } else {
            throw new Error("Unexpected content type: " + contentType);
        }
    })
    .then((tokenData)=>{
        if (tokenData.error) {
            console.log(tokenData.access_token);
            return res.status(400).json({ error: tokenData.error });
        }
        const oauthToken = tokenData.access_token;

        res.redirect(`http://localhost:5173/callback/callback_github?oauthToken=${oauthToken}`);
    })
    .catch((error) => {
        console.error('Error exchanging code for token:', error);
        res.status(500).send('Error exchanging code for token');
    });
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/callback`);
});