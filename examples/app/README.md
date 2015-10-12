# Example App

This is an example application composed of a client and server that uses Chronicle and PrinceXML to generate dynamic reports.

# Installation

First, make sure that the dynamic report example has been installed and runs successfully. You can find directions on how to get that done [here](../reports/api-data/README.md).

Then, install the Client and start the watchify bundler so that changes you make in the source will be reflected when you refresh the page. In a new Terminal tab, change directory to `client/` and run:

```sh
npm install
npm start
```

Then, install the Server and start it. In a new Terminal tab, change directory to `server/` and run:

```sh
npm install
npm start
```

Lastly, open the client in your browser. In a new Terminal tab, run:

```sh
open http://localhost:8080
```

# Description

The Client presents a very simple ui that allows you to manipulate a few report parameters and run the dynamic report example: "Most Popular Github Repositories".

When the report is run, the Client makes a request to the Server that includes the report path and the parameters to apply. Then the Server runs the report using a Chronicle Press which loads the report, retrieves the report data, and then presses that data with the report template to generate the report HTML. Finally, PrinceXML is used to visually render the report HTML as a paginated PDF, the file is returned to the Client, and then saved to disk.

Visually, the architecture is as follows:

```
.                        Server
                      _____________
                     |             |          Data source      
   Client            |  Report     |          ___________
 ___________         |    ||       |         |           |
|           |  ===>  |  Press      |  <===>  |    API    |
|    Run    |        |    ||       |         |___________|
|___________|  <===  |  PrinceXML  |
                     |_____________|
```
