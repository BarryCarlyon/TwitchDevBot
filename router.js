const express = require('express');
const router = express.Router();
const TwitchAPI = require('./utils/TwitchAPI');
const axios = require('axios');
let client;

router.get('/auth', (req, res) => {
    if(req.query.code !== null) {
        const url = TwitchAPI.fetchAccessTokenURL(req.query.code, req.query.state);
        axios.post(url);
    } else {
        const json = req.body;
        const access_token = json.access_token;
        const config = {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        };
        const type = req.query.state.split('+')[0];
        const discordID = req.query.state.split('+')[1];
        if (type === 'extensions') {
            axios.get('https://api.twitch.tv/helix/analytics/extensions', config).then((response) => {
                const json = JSON.parse(response.data);
                if (json.data !== []) {
                    client.fetchUser(discordID).then((user) => {
                        client.guilds.last().fetchMember(user).then((member) => {
                            client.guilds.last().roles.forEach(role => {
                                if(role.name === 'Extension Developer') {
                                    member.addRole(role.id);
                                }
                            });
                        });
                    });
                }
            });
        } else {
            axios.get('https://api.twitch.tv/helix/analytics/games', config).then((response) => {
                const json = JSON.parse(response.data);
                if (json.data !== []) {
                    client.fetchUser(discordID).then((user) => {
                        client.guilds.last().fetchMember(user).then((member) => {
                            client.guilds.last().roles.forEach(role => {
                                if(role.name === 'Game Developer') {
                                    member.addRole(role.id);
                                }
                            });
                        });
                    });
                }
            });
        }
        res.redirect('link.twitch.tv/devchat');
    }
});

exports.setClient = (c) => {
    client = c;
};
