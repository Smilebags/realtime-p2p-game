# WebRTC-based multi-device game
This repo contains a quick 2-day experiment into how to utilise WebRTC in order to use mobile devices as 'controllers' for a game displayed on a central screen.

The inspiration came from playing a multiplayer console game with friends while thinking about those online realtime survey websites like [DirectPoll](http://directpoll.com/).

Until now, I haven't seen any implementation of multiple devices being used together to create an experience on the web. This experiment is a proof of concept in low-latency, multi-device gaming on the web.

The primary device (whatever acts as the shared game screen) hosts a game, and using WebRTC through [PeerJS](https://peerjs.com/), other devices can connect directly to the host browser instance and communicate messages in realtime to act as a wireless controller.

This obviously works best (low latency and reliable connection) if all the devices are on the same local network, but will also work with most router configurations over the internet as well.

Excuse my game-design skills (or lack thereof), as the focus of this experiment was on the technology stack rather than the enjoyability of the game. For those who are interested, it is a multiplayer 'Snake' like game where you collect food and can eat each-other to get the longest tail. Each controller (mobile phone or other computer) will display their score, name and snake colour, as well as some directional buttons for touch screens. For keyboard users, WASD works too.