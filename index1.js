///////////////////////////////////////////////////  Import Modules  ////////////////////////////////////////////////////////////
var express = require('express');
var fs = require('fs');
const request = require('request');
var app = express();
var path = require('path');
var port = process.env.port || 7776;
const bp = require('body-parser');
const axios = require('axios');
var cookieParser = require('cookie-parser');
var session = require('express-session');
const formidable = require('formidable')
app.use(bp.json());
app.use(bp.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'views/static')));
var ls = require('local-storage');
app.use(cookieParser());
var fileupload = require("express-fileupload");
app.use(fileupload({
  useTempFiles : true,
  tempFileDir : './temp/'
}));
//app.use(session({secret: "Shh, its a secret!"}));
app.use(session({
    secret: 'xyz',
    cookie: { maxAge: 600000000 },
    resave: true,
    saveUninitialized: true
}));
///////////////////////////////////////////////////// Handling Get Request (Render Pages) ////////////////////////////////////////////////////////
app.get('/', (req, res)=> {
    res.render('rpas', { message: "" });
});


///////////////////////////////////////////////////////// Handling RPAS ////////////////////////////////////////////////////////////
app.post('/rpas' , (req, res)=>{
  var file;
  if(!req.files)
  {
      res.send("File was not found");
      return;
  }
  file = req.files.rpas_image;  // here is the field name of the form
  var p = __dirname+'/'+file.tempFilePath;
  var name = file.tempFilePath.split('/')[1];
  var request = require('request');
var fs = require('fs');
var options = {
  'method': 'POST',
  'url': 'http://localhost:6667/rpas',
  'headers': {
  },
  formData: {
    'file': {
      'value': fs.createReadStream(`${p}`),
      'options': {
        'filename': `${name}`,
        'contentType': null
      }
    },
    'model_name': `${req.body.model_name}`,
    'model_number': `${req.body.model_number}`,
    'purpose': `${req.body.purpose}`,
    'fuel_capacity': `${req.body.fuel_capacity}`,
    'max_endurance': `${req.body.max_endurance}`,
    'max_range': `${req.body.max_range}`,
    'max_speed': `${req.body.max_speed}`,
    'engine_count': `${req.body.engine_count}`,
    'wing_type': `${req.body.wing_type}`,
    'drone_type': `${req.body.drone_type}`,
    'weight': `${req.body.weight}`,
    'payload': `${req.body.payload}`,
    'engine_type': `${req.body.engine_type}`,
    'propeller_details': `${req.body.propeller_details}`,
    'length': `${req.body.length}`,
    'width': `${req.body.width}`,
    'height': `${req.body.height}`,
    'engine_power': `${req.body.engine_power}`,
    'max_weight_attain': `${req.body.max_weight_attain}`
  }
};
request(options, function (error, response) {
  if (error) throw new Error(error);
  var j = JSON.parse(response.body);
  console.log(j.id);
  if(j.message === 'Data Submitted')
  {
    
         req.session.ids = j.id;
         req.session.save(function(err) {
           //console.log(err);
        })
        res.render('drone1',  {message : ""});
        console.log('SAmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm', req.session.ids);
    
   
  }
});

});
///////////////////////////////////////////////////////////// Handling Add Drone ////////////////////////////////////////////////////////////////
app.post('/drone', (req, res)=>{
      console.log(req.body);
      console.log()
      if(req.session.ids)
      {
               axios.post('http://localhost:6667/drone', 
               {
                "id": `${req.session.ids}`,
                "drone_id":`${req.body.drone_id}`,
                "batch": `${req.body.batch}`,
                "shift": `${req.body.shift}`,
                "serial": `${req.body.serial}`,
                "manufacturing_date": `${req.body.manufacturing_date}`,
                "model": `${req.body.model}`,
                "h_make": `${req.body.h_make}`,
                "h_version": `${req.body.h_version}`,
                "h_serial_no": `${req.body.h_serial_no}`,
                "s_make": `${req.body.s_make}`,
                "s_version": `${req.body.s_version}`,
                "s_serial_no": `${req.body.s_serial_no}`,
              })
               .then(function (response) {
                 if(response.data.message === 'Data Submitted')
                 {
                    res.render('drone2' , { message: "" });
                 }
                 else
                 {
                    res.render('drone1' , { message: "Oops Something went wrong!!!" });
                 }
                }).catch(function (error) {
                    console.log('bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb');
                 });
       }
       else
       {
           console.log('3', req.session.drone);
           res.render('drone1' , { message: "Oops Session Expired Try Again!!!" });
       }
  
})

//////////////////////////////////////////////////////////// Add Company ///////////////////////////////////////////////////////////////////
app.post('/com', (req, res)=>{
  console.log('zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz', req.session.ids);
  console.log(req.body);
  if(req.session.ids)
  {
          var file;
          if(!req.files)
          {
              res.send("File was not found");
              return;
          }
          file = req.files.file;  // here is the field name of the form
          var p = __dirname+'/'+file.tempFilePath;
          var name = file.tempFilePath.split('/')[1];
          console.log(p, name);
          var request = require('request');
          var fs = require('fs');
          var options = {
          'method': 'POST',
          'url': 'http://localhost:6667/company',
          'headers': {
          },
          formData: {
            'file': {
              'value': fs.createReadStream(`${p}`),
              'options': {
                'filename': `${name}`,
                'contentType': null
              }
            },
            'id': `${req.session.ids}`,
            'company_name': `${req.body.company_name}`,
            'cin': `${req.body.cin}`,
            'dgca_company_id': `${req.body.dgca_company_id}`,
            'address': `${req.body.address}`,
            'website': `${req.body.website}`,
            'gst': `${req.body.gst}`,
            'p_first_name': `${req.body.p_first_name}`,
            'p_last_name': `${req.body.p_last_name}`,
            'p_password': `${req.body.p_password}`,
            'p_email': `${req.body.p_email}`,
            'p_phone': `${req.body.p_phone}`,
            's_first_name': `${req.body.s_first_name}`,
            's_last_name': `${req.body.s_last_name}`,
            's_password': `${req.body.s_password}`,
            's_email': `${req.body.s_email}`,
            's_phone': `${req.body.s_phone}`
            
          }
        };
        request(options, function (error, response) {
          if (error) throw new Error(error);
          var j = JSON.parse(response.body);
          if(j.message === 'Data Submitted')
          {
            res.render('send',  {message : ""});
            if(!req.session.rpas)
            {
              req.session.drone = req.body.model_number;
              req.session.save(function(err) {
                console.log(err);
              })
              
              console.log('1', req.session.drone);
            }
            else
            {
              req.session.destroy();
              req.session.drone = req.body.model_number;
            }
          
          }
        });
        
  }
  else
  {
        res.render('drone2' , { message: "Oops Session Expired Try Again!!!" });
  }
})
//////////////////////////////////////////////////////////// API for Registration  /////////////////////////////////////////////////////////

app.get('/data_send', (req, res)=>{
                  var Flight_Module_Provider_id = '123456789';
                  axios.post(`https://{baseUrl}/api/droneDevice/register/${Flight_Module_Provider_id}`, 
                  {
                        "drone" : {
                                      "version" : "",
                                      "txn": "",
                                      "deviceId": "",
                                      "deviceModelId": "",
                                      "operatorBusinessIdentifier" : "",
                                      "idHash" : "",
                                  },
                        "signature" : "",
                        "digitalCertificate" : ""
                   }
                  )
                  .then(function (response) {
                       console.log(response);
                  }).catch(function (error) {
                        console.log(error);
                    });   
})

//////////////////////////////////////////////////////////// Listen ////////////////////////////////////////////////////////////////////////
app.listen(port, ()=>{
    console.log(`Hi, I am Frontend Server of NPNT Drone Project and listening on Port No. ${port}`);
});





//////////////////////////////////////////////////////// Ha
//////////////////////////////////////////////////////// END  /////////////////////////////////////////////////////////////////////////////