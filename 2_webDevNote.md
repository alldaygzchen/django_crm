### Html,css and js

    Always load html first

### Client and Server

    draw design tool: app.diagram.net

### Dynamic and static

    1. display different contents according different users
    2. including things update in real time. e.g. no comments, no likes

### Request and Response

    1. response has status code
    2. request: POST => create,update,delete

### Form

    1. send request to current url if <form method="GET" action="."></form>
    2. url encoding: a cool django post => 127.0.0.1:8887/?title=a+cool+django+post

### DNS

    1. search domain to ip address
    2. url structure: protocol subdomain domain tld page path
    3. https://www.seobility.net/en/wiki/DNS_Server

### Architecture

    1. handles request in https server port 80,443
    2. Cdn services optimizes static files
    3. Database and cdn should be seperate from https server to prevent client connecting
    4. Database can be set to listen from specific ip address (http server)

### PWA

    1. Allows you to run app even if no internet connection
    2. Since everything is cached

### API

    1. software communicating with other software
    2. any-api.com
