///////////////////////////////////////////////////  Import Modules  ////////////////////////////////////////////////////////////
var express = require('express');
var app = express();
var path = require('path');
var port = process.env.port || 7776;
const bp = require('body-parser');
const axios = require('axios');
var cookieParser = require('cookie-parser');
var session = require('express-session');
app.use(bp.json());
app.use(bp.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'views/static')));
var ls = require('local-storage');
app.use(cookieParser());
//app.use(session({secret: "Shh, its a secret!"}));
app.use(session({
    secret: 'xyz',
    resave: true,
    saveUninitialized: true
    , cookie: { maxAge: 60000 }
}));
///////////////////////////////////////////////////// Handling Get Request (Render Pages) /////////////////////////////////////////////////////////
app.get('/buyers', (req, res)=> {
    res.render('buyers', { message: "" });
});
app.get('/otp', (req, res)=>{
    res.render('otp', { message: "Oops First Login Than Veriify Otp!!!" })
})

///////////////////////////////////////////////////////// Handling Buyers Login ////////////////////////////////////////////////////////////

app.post('/buyers', (req, res)=>{
   if(req.body.email && req.body.password)
   {
                axios.post('http://localhost:6667/buyers', {"email":`${req.body.email}`,"password": `${req.body.password}`})
                .then(function (response) {
                if(response.data.body.authenticate === 'Yes')
                {
                    console.log('Buyers Loginned Successfully');
                    login = true;
                    res.render('otp' , { message: "" });
                }
                else
                {
                    login = false;
                    console.log('Buyers Loginned Declined by Server');
                    res.render('buyers', { message: "Oops Wrong Credentials Try again with correct one!!!" });
                }
                })
                .catch(function (error) {
                console.log(error);
                });
            
                
                axios.post('http://localhost:6667/send', {"email":`${req.body.email}`})
                .then(function (response) {
                    if(response.data.body.message === 'Otp send')
                    {
                        
                        console.log('Email Sent Successfully');
                        if(req.session.email){
                            req.session.destroy();
                        }
                        req.session.email = req.body.email;
                    }
                    else
                    {
                        console.log('Email Send Declined by Server');
                        auth = false;
                        if(req.session.email){
                        req.session.destroy();
                    }
                        res.render('otp', { message: "Sorry Email Verification Declined by Server!!!" });
                    }
                })
                .catch(function (error) {
                    console.log(error);
                });
      
   }
   else
   {
         res.render('buyers', { message: "First Fill All The Field Than Submit!!!" });
   }

})


///////////////////////////////////////////////////////////// Handling Otp ////////////////////////////////////////////////////////////////

app.post('/otp', (req, res)=>{
    if(req.body.otp)
    {
        if(req.session.email)
        {
                 axios.post('http://localhost:6667/verify', {"email":`${req.session.email}`, "otp": `${req.body.otp}`})
                 .then(function (response) {
                 if(response.data.body.authenticate === 'Yes')
                 {
                     var verified = true;
                     if(req.session.email)
                     {
                        req.session.verified = verified;
                        res.render('comm', {message : ""});
                     }
                    
                 }
                 else if(response.data.body.message === 'Otp expired')
                 {
                     res.render('otp', { message: "Otp has expired Try again!!!" });
                 }
                 else if(response.data.body.message === "Otp Does't Match")
                 {
                     res.render('otp', { message: "Otp does't match!!!" });
                 }
                 else
                 {
                     console.log('error', response.data.body.message);
                 }
                 }).catch(function (error) {
                     console.log(error);
                 });
         }
         else
         {
             res.render('buyers' , { message: "Oops First Login Here Than Veriify Otp!!!" });
         }
    }
    else
    {
        res.render('otp', { message: "Oops First Enter Otp than Submit!!!" });
    }
  
})


////////////////////////////////////////////////////////// Handling Communcarion Link Setup ///////////////////////////////////////////////
app.post('/com', (req, res)=>{
        if(req.session.verified === true && req.session.email)
        {
            console.log(req.body);
            axios.post('http://localhost:6667/comm', {"email": `${req.session.email}`, "serial_port1":`${req.body.serial_port1}`, "serial_port2": `${req.body.serial_port2}`, "data_bits": `${req.body.data_bits}`, "parity1": `${req.body.parity1}`, "parity2": `${req.body.parity2}`})
            .then(function (response) {
                if(response.data.body.message === 'submitted')
                {
                    req.session.comm = true;
                    res.render('drone_details', {message : ""})
                    req.session.verified = false;
                }
                else if(response.data.body.message === 'Not Submitted')
                {
                    req.session.comm = true;
                    res.render('comm', {message : "Oops You have already Set Up The Communcation Link With This Mail!!!"})
                    req.session.verified = false;
                }
                else
                {
                    res.render('comm', {message : "Oops Something Went Wrong!!!"});
                }
            })
            .catch(function (error) {
                console.log(error);
            });
        }
        else
        {
            res.render('buyers', { message: "Oops First Login and Verify Email than Setup Link Communication!!!" });
        }
    
   
})
//////////////////////////////////////////////////////////// Handling Drone Details ///////////////////////////////////////////////////////

app.post('/drone_details', (req, res)=>{
    if(req.session.comm === true && req.session.email)
    {
        console.log(req.body);
        axios.post('http://localhost:6667/drone_details', {"email":`${req.session.email}`,"vehicle_id":`${req.body.vehicle_id}`, "	vehicle_no": `${req.body.vehicle_no}`, "firmware_version": `${req.body.firmware_version}`, "drone_name": `${req.body.drone_name}`})
        .then(function (response) {
            if(response.data.body.message === 'Drone Details Submitted')
            {
                req.session.pilot = true;
                req.session.comm = false;
                res.render('pilot', {message : ""})
            }
            else if(response.data.body.message === 'Already Registered the Drone Details by this mail id')
            {
                console.log(response.data.body.message);
                res.render('drone_details', {message : "Oops Already Registered the Drone Details by this mail id!!!"});
            }
            else
            {
                console.log(response.data.body.message);
                res.render('drone_details', {message : "Oops Something Went Wrong!!!"});
            }
        })
        .catch(function (error) {
            console.log(error);
        });
    }
    else
    {
        res.render('buyers', { message: "Oops First Login and Verify Email than Setup Link Communication!!!" });
    }
})

//////////////////////////////////////////////////////////// Handling Pilot Login //////////////////////////////////////////////////////////
app.post('/pilot', (req, res)=>{
    if(req.session.pilot === true && req.session.email)
    {
        
        console.log(req.body);
        axios.post('http://localhost:6667/pilot_profile', {"pilot_name":`${req.body.pilot_name}`,"pilot_id":`${req.body.pilot_id}`})
        .then(function (response) {
            console.log(response.data.body.message);
            if(response.data.body.message === 'Loginned Successfully')
            {
                req.session.dgca_pilot = true;
                res.render('dgca_pilot', {message : ""})
            }
            else if(response.data.body.message === 'Pilot id is wrong')
            {
                console.log(response.data.body.message);
                res.render('pilot', {message : "Oops Pilot id is wrong!!!"});
            }
            else
            {
                console.log(response.data.body.message);
                res.render('pilot', {message : "Oops Pilot name is wrong!!!"});
            }
        })
        .catch(function (error) {
            console.log(error);
        });
    }
    else
    {
        res.render('buyers', { message: "Oops First Login and Verify Email than Setup Link Communication!!!" });
    }
})
//////////////////////////////////////////////////////////// DGCA Pilot ///////////////////////////////////////////////////////////////////
app.post('/dgca_pilot', (req, res)=>{
    if(req.session.dgca_pilot === true && req.session.email)
    {
        
        console.log(req.body);
        axios.post('http://localhost:6667/dgca_pilot', {"pilot_email":`${req.body.pilot_email}`,"pilot_password":`${req.body.pilot_password}`})
        .then(function (response) {
            console.log(response.data.body.message);
            if(response.data.body.message === 'Loginned Successfully')
            {
                req.session.per = true;
                res.render('permission', {message : ""});
            }
            else if(response.data.body.message === 'Pilot email is wrong')
            {
                console.log(response.data.body.message);
                res.render('dgca_pilot', {message : "Oops Pilot Email Is Wrong!!!"});
            }
            else
            {
                console.log(response.data.body.message);
                res.render('dgca_pilot', {message : "Oops Pilot Password is wrong!!!"});
            }
        })
        .catch(function (error) {
            console.log(error);
        });
    }
    else
    {
        res.render('buyers', { message: "Oops First Login and Verify Email than Setup Link Communication!!!" });
    }
})

//////////////////////////////////////////////////////////// Permission Request  ///////////////////////////////////////////////////



app.post('/permission', (req, res)=>{
   if(req.session.per === true)
   {
            console.log(req.body);
            axios.post('http://{{base_url}}/permission', 
            {
                coordinates : [{ latitude : `req.body.latitude_1`, longitude : `req.body.longitude_1`  }, 
                            { latitude : `req.body.latitude_2`, longitude : `req.body.longitude_2`   }, 
                            { latitude : `req.body.latitude_3`, longitude : `req.body.longitude_3`  }, 
                            { latitude : `req.body.latitude_4`, longitude : `req.body.longitude_4` }],
                "start_timestamp":`${req.body.start_timestamp}`,
                "end_timestamp":`${req.body.end_timestamp}`,
                
            })
            .then(function (response) {
                console.log(response.data);
                res.end();
            })
            .catch(function (error) {
                console.log(error);
            });
   }
})
///////////////////////////////////////////////////////////// Flight Logs //////////////////////////////////////////////////////////

app.post('/flight_log', (req, res)=>{
    axios.post('http://{{base_url}}/flight_log', 
        {    
            "$id":"http://dgca.gov.in/schema/incident_report_field.json",
            "type":"object",
            "properties": 
            {
                "PermissionArtefact": 
                {
                        "$id":"/properties/PermissionArtefact",
                        "type":"string",
                        "format":"base64"
                },
                "FlightLog":
                {
                    "$id":"/properties/FlightLog",
                    "type":"array",
                    "items":
                    {
                        "$id":"/properties/FlightLog/items",
                        "type":"object",
                        "properties":
                        {
                            "TimeStamp":
                            {
                                    "$id":"/properties/FlightLog/items/properties/TimeStamp",
                                    "type":"integer",
                                    "title":"Timestamp in MilliSeconds",
                                    "default":0
                            },
                            "Latitude":
                            {
                                    "$id":"/properties/FlightLog/items/properties/Latitude",
                                    "type":"number",
                                    "format":"float",
                                    "title":"Latitude in Degrees East",
                                    "default":0
                            },
                            "Longitude":
                            {
                                    "$id":"/properties/FlightLog/items/properties/Longitude",
                                    "type":"number",
                                    "format":"float",
                                    "title":"Longitude in Degrees North",
                                    "default":0
                            },
                            "Altitude":
                            {
                                    "$id":"/properties/FlightLog/items/properties/Altitude",
                                    "type":"integer",
                                    "title":"Ellipsoidal Height in Meters",
                                    "default":0,
                                    "minimum":-99999,
                                    "maximum":99999 
                            },
                            "CRC":
                            {
                                    "$id":"/properties/FlightLog/items/properties/CRC",
                                    "type":"integer",
                                    "title":"Circular Redundancy Check (optional)",
                                    "default":0,
                                    "minimum":0,
                                    "maximum":4294967296
                            }
                        },
                        "required":
                        [
                            "TimeStamp",
                            "Longitude",
                            "Latitude",
                            "Altitude"
                        ]
                    }
                }
            }
        
})
    .then(function (response) {
        console.log(response.data);
        
    })
    .catch(function (error) {
        console.log(error);
    });
})
//////////////////////////////////////////////////////////// Listen ////////////////////////////////////////////////////////////////////////


app.listen(port, ()=>{
    console.log(`Hi, I am Frontend Server of NPNT Drone Project and listening on Port No. ${port}`);
});





//////////////////////////////////////////////////////// Ha
//////////////////////////////////////////////////////// END  /////////////////////////////////////////////////////////////////////////////