// Database Connections
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;

// Node Modules
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const app = express();

// Initialising Express
app.use(express.static('public'));
// set the view engine to ejs
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

var db;
let materials

// connecting variable db to database "buildingsdb"
MongoClient.connect("mongodb://127.0.0.1:27017/buildingsdb1", {useNewUrlParser: true, useUnifiedTopology: true }, function(err, client) {
    if (err) throw err;
    db = client.db('buildingsdb1');
    app.listen(8080); //app = express()
    console.log('Listening on http://127.0.0.1:8080/homepage');
    db.collection('materialdb').find({}).toArray(function(err, result) {
        materials = result
    })
});

app.get('/', function(req, res) {
    res.render('pages/ManagePage.ejs');
});

// homepage Route
app.get('/homepage', function(req, res) {
    // Find data in buildingCollection collection
    db.collection('buildingCollection').find({}).toArray(function(err, result) {

        // Show buildingCollection page
        res.render('pages/HomePage.ejs', {
            buildingdetails: result
        });
    });
});

// get attribute route to get attribute.ejs page
app.get('/attribute/:id', async function(req, res) {
    const id = req.params.id;
    let checkversion = await db.collection('checkversion').find({ name: "checkthelock", id: id }).toArray()
    // no lock at all
    if (checkversion.length == 0) {
        let data = { "name": "checkthelock", "status": 1, "id": id }
        //create lock
        await db.collection('checkversion').insertOne(data)
        // Find data in buildingCollection collection
        db.collection('buildingCollection').find({ _id: ObjectId(id) }).toArray(function(err, result) {
        // Show edit wall&roof page
            res.render('pages/attribute.ejs', {
                buildingdetails: result
            });
        });

    } else {
        //checklock status
        //locked
        if (checkversion[0].status == 1 && checkversion[0].id == id) {
           res.render('pages/warning')
        } 
    }
});


// attributelist Route
app.get('/attributelistdata/:id', function(req, res) {
    //const { id } = req.params //params contains many parameters
    const id = req.params.id
    const requireKeys = ["Density", "Material", "Thickness"]
    // Find data with the id in buildingCollection collection
    db.collection('buildingCollection').find({_id: ObjectId(id)}).toArray(function(err, result) {
        let dataDetails = {}
        // Turn array into a JSON string for logging
        if (result[0].attribute) {
            // Show list of wall&roof page
            for (let data of result[0].attribute){
                for (let material of materials){
                    if(data.Type == material.Type){
                        const a = material.Info.Material.map((e, i) => {
                            if (typeof dataDetails[e] === 'undefined'){
                                dataDetails[e] = 0
                            }
                            dataDetails[e] = dataDetails[e] + parseFloat(material.Info.Density[i]) * parseFloat(material.Info.Thickness[i]) * data.Area
                        })
                    }
                }
            }
            res.render('pages/attributelist.ejs', {buildingdetails: result[0], materialDetails: dataDetails})
        } else {
            // Show list of wall&roof page, even there is no wall&roof
            let attribute = []
            result[0].attribute = attribute
            res.render('pages/attributelist.ejs', {buildingdetails: result[0], materialDetails: dataDetails})
        }
    })
})


// *** POST Routes ***
// Add building Route
app.post('/add', function(req, res) {
    // Get details from the form using bodyParser
    var buildingname = req.body.name;
    var buildingadress = req.body.adress;
    // Format buildingdetails into JSON
    var buildingdetails = {"name": buildingname, "adress": buildingadress};
    // Add buildingdetails to collection
    db.collection('buildingCollection').insertOne(buildingdetails, function(err, result) {
        if (err) throw err;
        res.redirect('/homepage');
    });
});


// Delete Route
app.post('/delete', function(req, res) {
    // Get details from the form
    var buildingname = req.body.name;
    // Format buildingdetails into JSON
    var buildingdetails = { "name": buildingname };
    // Delete buildingdetails from buildingCollection collection
    db.collection('buildingCollection').deleteOne(buildingdetails, function(err, result) {
        if (err) throw err;
        res.redirect('/homepage'); //go back to homepage
    });
});

// Edit Route with update method
app.post('/edit', function(req, res) {
    // Get details from the form
    var oldbuilding = req.body.editname;
    var newbuilding = req.body.newname;
    // Format building details into JSON
    var buildingquery = { "name": oldbuilding };
    var newbuildingquery = { $set: { "name": newbuilding } };
    // Add building details to buildingCollection collection
    db.collection('buildingCollection').updateOne(buildingquery, newbuildingquery, function(err, result) {
        if (err) throw err;
        res.redirect('/homepage');
    });
});

app.post('/addattribute/:id', function(req, res) {
    const id = req.params.id
    const scrapeData = req.body
    const dataReduce = Object.values(scrapeData.reduce((a, {Type, Category, Area}) => {
        a[Type] = a[Type] || {Type, Category, Area: 0};
        a[Type].Area += parseFloat(Area);
        return a;
    }, {}))
    for (let data of dataReduce){
        if(data["Category"] == "Floors"){
            if(data["Type"].includes("Boden")){
                data["Area"] = data["Area"] * 200
            }
            else{
                data["Area"] = data["Area"] * 500
            }  
        }
        if(data["Category"] == "Walls"){
            if (data["Type"].includes("Natur")){
                data["Area"] = data["Area"] * 300
            }
            else{
                data["Area"] = data["Area"] * 400
            }
        }
        if(data["Category"] == "Roofs"){
            data["Area"] = data["Area"] * 100
        }
    }
    db.collection('buildingCollection').find({ _id: ObjectId(id) }).toArray(function(err, result) {
        if (err) throw err;

        const newattribut = {$set: {"attribute": dataReduce}};

        //use db.collection again,to update the attribute of this building with this id
        db.collection('buildingCollection').updateOne({ _id: ObjectId(id)}, newattribut, {upsert: true}, function(err, result) {
            if (err) throw err;
            res.redirect(`/attributelistdata/${id}`);
        })
    })
})

app.post('/addattribute_single/:id', function(req, res) {
    const id = req.params.id
    const scrapeData = req.body

    for (let data of scrapeData){
        if(data["Category"] == "Floors"){
            if(data["Type"].includes("Boden")){
                data["Area"] = data["Area"] * 200
            }
            else{
                data["Area"] = data["Area"] * 500
            }  
        }
        if(data["Category"] == "Walls"){
            if (data["Type"].includes("Natur")){
                data["Area"] = data["Area"] * 300
            }
            else{
                data["Area"] = data["Area"] * 400
            }
        }
        if(data["Category"] == "Roofs"){
            data["Area"] = data["Area"] * 100
        }
    }
    db.collection('buildingCollection').find({ _id: ObjectId(id) }).toArray(function(err, result) {
        if (err) throw err;

        const newattribut = {$set: {"attribute": scrapeData}};

        //use db.collection again,to update the attribute of this building with this id
        db.collection('buildingCollection').updateOne({ _id: ObjectId(id)}, newattribut, {upsert: true}, function(err, result) {
            if (err) throw err;
            res.redirect(`/attributelistdata/${id}`);
        })
    })
})
