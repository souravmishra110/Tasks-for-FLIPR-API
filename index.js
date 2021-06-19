const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const fetch = require("node-fetch");
const cors = require('cors');
const Schema = mongoose.Schema;
const collection1_Schema = new Schema({ _id: String , id: String, client: String, createdAt:Date, imei: String, ref: String, updatedAt: Date });
const collection2_Schema = new Schema({ _id: String , tag: String, case:String, imei:String, model:String, timezone: String, info_serial_no:Number, output:String, socket:String, device:String, client:String, speed:Number, gps:Array, battery:Number, createdAt:Date });


const app = express();

app.use(bodyParser.json());
const PORT = process.env.PORT || 5000;


app.post('/task1', async (req, res) => {
    // console.log("POST Connected...");
    const { url } = req.body;
    const { first_collection } = req.query;
    const { second_collection } = req.headers;
    var latest_devices = [];
    
    // const Devices = mongoose.Connection.collection(first_collection);
    await mongoose.connect(
        url,
        {
            useNewUrlParser: true,
            useFindAndModify: false,
            useUnifiedTopology: true,
            useCreateIndex: true
        }, async () => {
            try {
                // console.log("MONGODB Connected...");
                const collection1 = await mongoose.model('collection1', collection1_Schema, first_collection);
                await collection1.find({}, function(err, data) { latest_devices = (data) }).sort({ 'createdAt':-1 }).limit(30);
                

                // res.send(latest_devices);
                
                var answer = [];
                var collection2 = await mongoose.model('collection2', collection2_Schema, second_collection);
               
                for(device of latest_devices){
                    var dummy = [] 
                    await collection2.find({ device: device.id }, function(err, data) { dummy.push(data); }).sort({ 'createdAt':1 }).limit(50);
                    answer.push({ "device": device.id , location: dummy});
                    
                }
                answer.push( {"Name": "Sourav Mishra", "Contact": "sourav.cse.1844@iiitbh.ac.in"});
                res.send(answer);
                
            }
            catch (e) {
                // console.log(e)
                res.send("Error In Fetching Data...")
            }
        }
    );
        
    // res.send(latest_devices)
    // res.send(`${first_collection} , ${url} , ${second_collection}`);
})



const fetchGeocode = async (key) => {
    const geo = 'https://maps.googleapis.com/maps/api/geocode/json?address=';
    const geoKey = '&key=AIzaSyA5bwbEsAOUMOI4RK2zXcIayG4vjuQSpcw'
    const coordinates = geo+key+geoKey;
    try {
        const res = await fetch(coordinates);
        const data = await res.json();
        return data;
    } catch (e) {
        console.log("SOMETHING WENT WRONG!!!", e)
        return "NOT FOUND";
    }
}

app.post('/task2', async (req, res) => {
    const addressList = req.body;
    var result = [];
    for(address of addressList){
        // console.log(address);
        const getCoordinates = await fetchGeocode(address);
        // console.log(getCoordinates.status);
        if(getCoordinates.status === "OK"){
            const {lat , lng} = getCoordinates.results[0].geometry.location;
            const data = {"add": address, "location": [lat , lng]}
            result.push(data);
        }
        else {
            const data = {"add": address, "location": ["NOT Found" , "NOT Found"]}
            result.push(data);
        }
    }
   
    res.send(result)
})

app.listen(PORT, () => console.log(`Server running on port: http://localhost:${PORT}`));