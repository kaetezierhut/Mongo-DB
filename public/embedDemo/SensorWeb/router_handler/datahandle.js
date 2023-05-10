const { MongoClient } = require('mongodb');
const url = "mongodb://127.0.0.1:27017/";

exports.dataSave = (req, res) => {
    const data = req.body

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("sensor");
		
		//in your INFII exercise, you need to get and show the humidity in web
        var myobj = { temperatur: data.temperatur, humidity: data.humidity, time: new Date() };
        dbo.collection("sensorcollection").insertOne(myobj, function(err, res) {
            if (err) throw err;
            console.log("save sensor data succeed !");
            db.close();
        });
    });

    res.send({
        status: 0,
        mesaage: "recevie the data"
    })

};

exports.getdatatemp = (req, res) => {

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("sensor");
		
		// use limit(1) to output only one data, why? consider this for your INF II exercise
        dbo.collection("sensorcollection").find({}).sort({ _id: -1 }).limit(1).toArray(function(err, result) { 
            if (err) throw err;
            res.send({
                status: 0,
                message: "send data",
                data: result
            })
            db.close();
        });
    });
};