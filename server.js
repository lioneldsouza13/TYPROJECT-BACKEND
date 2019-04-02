//--- packages --
const express = require('express');
const bodyParser = require('body-parser')
const path = require('path')
const app =express();
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const multer = require('multer');
const cloudinary = require('cloudinary')
var fs = require('fs');
const Sequelize = require('sequelize');
const schedule = require('node-schedule');
const speakeasy = require('speakeasy');
const nodemailer = require("nodemailer");
require('dotenv/config')

//----models-----
const twoWheeler = require('./models').twoWheeler
const fourWheeler = require('./models').fourWheeler
const vehicle = require('./models').vehicle;
const user = require('./models').user;
const inventory = require('./models').inventory;
const rent = require('./models').rent;
const owner = require('./models').owner;
const client = require('./models').client;
const card_details = require('./models').card_details
const accessory = require('./models').accessory
const cart_storage = require('./models').cart_storage
const rating = require('./models').rating
const feedback = require('./models').feedback
const accessory_transaction = require('./models').accessory_transaction
const vehicle_transaction = require('./models').vehicle_transaction
const accessory_rating = require('./models').accessory_rating
const helpful_vehicle  =require('./models').helpful_vehicle
const helpful_accessory = require('./models').helpful_accessory
const avg_rating_vehicles = require('./models').avg_rating_vehicles
const avg_rating_accessory = require('./models').avg_rating_accessory
//----middleware
const {authenticate} = require('./middleware/authenticate');

//----methods ---
const {create_transaction} = require('./methods/transaction-creation')
const {create_accessory}= require('./methods/accessory_create')
const {generate_email} = require('./methods/generate-email');
const {generate_email_attachment}= require('./methods/generate-email-attachments')
const {generatePdf,fileName}= require('./methods/generate-pdf')

//------ For parsing json data and allowing cross-communication between react and node
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(cors());



//-----------image storing------

//-----------Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});



//file - upload
let imagefilename='';
let profileimagename='';
let documentimagename='';
let clientimagename='';
let imageURL='';
let profileImage='';
let documentURL='';
let clientURL='';
let ownerdocumentname='';
let ownerURL=''




app.post('/api/image', async function (req, res) {
    filename=''
    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads/')
        },
        filename: function (req, file, cb) {
            imagefilename=file.fieldname + '-' + Date.now()+'.jpg';
            cb(null, imagefilename)

        }
    })

    var upload = multer({ storage: storage }).single('image');
    imageURL=''

        upload(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                // A Multer error occurred when uploading.
            } else if (err) {
                // An unknown error occurred when uploading.
            }
            cloudinary.v2.uploader.upload(`uploads/${imagefilename}`,
                function(error, result) {
                console.log(imagefilename)
                    imageURL=result.url

                    fs.exists(`uploads/${imagefilename}`, function (exists) {
                        if (exists) {

                            console.log('File exists. Deleting now ...');
                            fs.unlink(`uploads/${imagefilename}`);
                        } else {

                            console.log('File not found, so not deleting.');
                        }
                    });

                    res.send('Image Stored')
                    console.log('Image Stored',imageURL)
                });


        })



})

app.post('/api/profileImage',(req,res)=>{
    profileImage=''

    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads/')
        },
        filename: function (req, file, cb) {
            profileimagename=file.fieldname + '-' + Date.now()+'.jpg';
            cb(null, profileimagename)

        }
    })


    var uploadProfileImage = multer({ storage: storage }).single('profileImage');
    uploadProfileImage(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
        } else if (err) {
            // An unknown error occurred when uploading.
        }
        cloudinary.v2.uploader.upload(`uploads/${profileimagename}`,
            function (error, result) {
                console.log(profileimagename)
                profileImage = result.url


                const deleteImage= fs.exists(`uploads/${profileimagename}`, function (exists) {
                    if (exists) {

                        console.log('File exists. Deleting now ...');
                        fs.unlink(`uploads/${profileimagename}`);
                    } else {

                        console.log('File not found, so not deleting.');
                    }
                });
                res.send('Profile Image Stored')
                console.log('profile Image Stored',profileImage)




});


    })

})


//---- Owner Document---
app.post('/api/OwnerImage',(req,res)=>{
    ownerURL=''

    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads/')
        },
        filename: function (req, file, cb) {
            ownerdocumentname=file.fieldname + '-' + Date.now()+'.jpg';
            cb(null, ownerdocumentname)

        }
    })


    var uploadDocumentImage = multer({ storage: storage }).single('ownerImage');
    uploadDocumentImage(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
        } else if (err) {
            // An unknown error occurred when uploading.
        }
        cloudinary.v2.uploader.upload(`uploads/${ownerdocumentname}`,
            function (error, result) {

                ownerURL = result.url

                console.log('Document Image Stored',ownerURL)

                const deleteImage=
                    fs.exists(`uploads/${ownerdocumentname}`, function (exists) {
                        if (exists) {

                            console.log('File exists. Deleting now ...');
                            fs.unlink(`uploads/${ownerdocumentname}`);
                        } else {

                            console.log('File not found, so not deleting.');
                        }
                    });
                res.send('Document Image Stored')

            });



    })

})


// ---- Insert vehicle document----
app.post('/api/documentImage',(req,res)=>{
    documentURL=''

    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads/')
        },
        filename: function (req, file, cb) {
            documentimagename=file.fieldname + '-' + Date.now()+'.jpg';
            cb(null, documentimagename)

        }
    })


    var uploadDocumentImage = multer({ storage: storage }).single('documentImage');
    uploadDocumentImage(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
        } else if (err) {
            // An unknown error occurred when uploading.
        }
        cloudinary.v2.uploader.upload(`uploads/${documentimagename}`,
            function (error, result) {

                documentURL = result.url

                console.log('Document Image Stored',documentURL)

                const deleteImage=
                    fs.exists(`uploads/${documentimagename}`, function (exists) {
                        if (exists) {

                            console.log('File exists. Deleting now ...');
                            fs.unlink(`uploads/${documentimagename}`);
                        } else {

                            console.log('File not found, so not deleting.');
                        }
                    });
                res.send('Document Image Stored')

            });



    })

})

//----- client document
app.post('/api/clientImage',(req,res)=>{
    clientURL=''

    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads/')
        },
        filename: function (req, file, cb) {
            clientimagename=file.fieldname + '-' + Date.now()+'.jpg';
            cb(null, clientimagename)

        }
    })


    var uploadDocumentImage = multer({ storage: storage }).single('clientImage');
    uploadDocumentImage(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
        } else if (err) {
            // An unknown error occurred when uploading.
        }
        cloudinary.v2.uploader.upload(`uploads/${documentimagename}`,
            function (error, result) {

                clientURL = result.url

                console.log('Document Image Stored',clientURL)

                const deleteImage=
                    fs.exists(`uploads/${clientimagename}`, function (exists) {
                        if (exists) {

                            console.log('File exists. Deleting now ...');
                            fs.unlink(`uploads/${clientimagename}`);
                        } else {

                            console.log('File not found, so not deleting.');
                        }
                    });
                res.send('Document Image Stored')

            });



    })

})



//-----Sign Up Route -------------
app.post('/api/sign-up',async (req,res)=>{

    let hashedPassword='';
    var users = req.body.users;

    const saltRounds = 10;

    //------------------------ hashing password ---------------
    const passwordCreation=await bcrypt.hash(users.password, saltRounds).then((result) => {
        hashedPassword = result;

    })

    //--------------Storing data in Database ------------------
    const dataStoring = await user.create({
        first_name:users.first_name,
        last_name:users.last_name,
        phone_number:users.phone_number,
        DOB:users.DOB,
        email:users.email,
        password:hashedPassword

    }).then(result=>{
        res.send('Data Saved in User Table')
    }).catch(e=>
    {
        res.status(403).send(e)
        console.log(e)
    })





})

//---------- Sign in Route-------------
app.post('/api/sign-in',async (req,res)=>{

        console.log(req.body.users);
        let fetchedEmail = req.body.users.email;
        let fetchedPassword = req.body.users.password;
        let storedPassword='';
        let generateToken='';
        let expiresIn='';


        var jwtDetails={
            user_id:req.body.users.user_id,
            email:req.body.users.email
        };
        //--------- generating token using email and user_id -------------------------
        const jwtCreation=await jwt.sign(jwtDetails,process.env.JWT_SECRET,{
        expiresIn: '1h'
    },(err,token)=>{
        if(err)
        {
            console.log()
        }
        generateToken=token;
    });

        const decodedToken= jwt.verify(generateToken,process.env.JWT_SECRET,function(err,token){
            expiresIn = token.exp;
        }
    )


        const data=await user.findOne({attributes:['user_id','first_name','last_name','email','password'],where:{email:fetchedEmail}}).then((User)=>{
            if(!User)
            {
                res.status(401).send('User Does Not Exist')

            }
            else
            {
               
                storedPassword=User.password;
                const match= bcrypt.compareSync(fetchedPassword,storedPassword)
                if(match)
                {


                    res.json({user_id:User.user_id,name:User.first_name+' '+User.last_name,expiresIn:3600,token:generateToken})


                }
                else
                {
                    res.status(401).send('Invalid Password')
                }
            }

        }).catch(e=>res.send(e))


})
//---- token creation for expiry date
app.get('/api/getToken/:user_id/:email',(req,res)=>{
    var jwtDetails={
        user_id:req.params.user_id,
        email:req.params.email
    };
    const jwtCreation= jwt.sign(jwtDetails,process.env.JWT_SECRET,{
        expiresIn: '1h'
    },(err,token)=>{
        if(err)
        {
            console.log()
        }
        res.send({token:token,expiresIn:3600})
    });

})



//------------------------ Main Routes   --------------------------
//-----------Fetch vehicle type---------
app.get('/api/fetch-vehicle-type',authenticate,(req,res)=>{
    var vehicle_type=["Two-Wheelers","Four-Wheelers"];
    res.status(200).send(vehicle_type)
})


//---- Fetch TwoWheeler fuel -----------
app.get('/api/fetch-twoWheeler-fuel',authenticate,(req,res)=>{
var fuel = ["Petrol"]
    res.send(fuel)
})


//---- Fetch FourWheeler fuel -----------
app.get('/api/fetch-fourWheeler-fuel',authenticate,(req,res)=>{
    var fuel = ["Petrol","CNG","Diesel"]
    res.send(fuel)

})


//---- Fetch Year -----------
app.get('/api/fetch-year',authenticate,(req,res)=>{
    var year = [2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018]
    res.send(year)
})

//---- Fetch registration-state -----------
app.get('/api/fetch-registration-state',authenticate,(req,res)=>{
    var registration_state=["Goa","Gujarat","Maharashtra","Pune"]
    res.send(registration_state)
})

//-----Fetch km-driven----------
app.get('/api/fetch-km_driven',authenticate,(req,res)=>{
    var km_driven=["0-10000","10000-20000","20000-30000","30000-40000","40000-50000","50000-60000","70000-80000","80000-900000","90000-100000"]
    res.send(km_driven)
})

//--------------- Fetch Two wheeler brand------------
app.get('/api/fetch-twoWheeler-brand',authenticate,(req,res)=>{
    var brand=["Aprilia","Bajaj","Benelli","Hero","Honda ","KTM","Others"]
    res.status(200).send(brand)
})

//--------------- Fetch Four wheeler brand------------
app.get('/api/fetch-fourWheeler-brand',authenticate,(req,res)=>{
    var brand =["Audi","BMW","Honda","Mercedes-Benz","Maruti Suzuki","Toyota","Others"]
    res.status(200).send(brand)
})

//--------------- Fetch Two wheeler model------------
app.post('/api/fetch-twoWheeler-model',authenticate,(req,res)=>{
   var model =[];
   twoWheeler.findAll({attributes:['model'],where:{brand:`${req.body.brand}`}}).then((result)=>{
        for(var i=0;i<result.length;i++)
        {
            model.push(result[i].model)
        }
       res.send(model)
   }).catch(e=>res.status(400).send(e))
})

//--------------- Fetch Four wheeler brand------------
app.post('/api/fetch-fourWheeler-model',authenticate,(req,res)=>{
    var model =[];
    fourWheeler.findAll({attributes:['model'],where:{brand:`${req.body.brand}`}}).then((result)=>{
        for(var i=0;i<result.length;i++)
        {
            model.push(result[i].model)
        }
        res.send(model)
    }).catch(e=>res.status(400).send(e))
})

////--------------- Store vehicle details of sell/lend into vehicle table------------
app.post('/api/store-vehicle-details',authenticate, (req,res)=>{
        var vehicles = req.body.vehicles
    console.log(imageURL);
try {
    const vehicleStorage = () => {
        vehicle.create({
            vehicle_type: vehicles.type,
            user_id: vehicles.user_id,
            brand: vehicles.brand,
            model: vehicles.model,
            fuel_type: vehicles.fuel,
            year: vehicles.year,
            registration_state: vehicles.registration_state,
            km_driven: vehicles.km_driven,
            number_plate: vehicles.number_plate,
            price: vehicles.price,
            price_per_day: vehicles.price_per_day,
            image: imageURL,
            documents: documentURL,
            status: 'AVAILABLE'
        }).then((result) => {
            console.log('Data Inserted');
            console.log(result.dataValues)
            user.findOne({where: {user_id: result.dataValues.user_id}}).then((result1) => {
                owner.create({
                    vehicle_id: result.dataValues.vehicle_id,
                    user_id: vehicles.user_id,
                    name: result1.dataValues.first_name + ' ' + result1.dataValues.last_name,
                    address: result1.dataValues.address,
                    pincode: result1.dataValues.pincode,
                    mobile_no: result1.dataValues.phone_number,
                    email: result1.dataValues.email,
                    state:result1.dataValues.state,
                    city:result1.dataValues.city,
                    DOB: result1.dataValues.DOB,
                    documents: documentURL

                })
            })


            res.send('Data Inserted')

        }).catch(e => console.log(e))
    }
    setTimeout(vehicleStorage, 5000)
}
catch(error){
    res.status(403).send("Error during vehicle storage");
}
})


//------ Buying Logic ----
app.post('/api/buy-now',authenticate,(req,res)=> {
    const Op = Sequelize.Op
    let vehicles = req.body.vehicles
    let amount = parseInt(vehicles.amount);
    let user_id = vehicles.user_id;
    console.log(amount);
    let owner_id=null;
    let owner_name='';
    let vehicle_type='';
    let owner_user_id=null;
    let client_account_no = vehicles.client_bank_account;
    let owner_account_no = vehicles.owner_bank_account;
    user.findOne({where:{user_id:vehicles.client_id}}).then((result)=>{
       vehicle.findOne({where:{vehicle_id:vehicles.vehicle_id}}).then((owner_details1)=>{
           owner.findOne({where:{vehicle_id:vehicles.vehicle_id}}).then((owner_details2)=>{

           
           owner_id= owner_details2.dataValues.owner_id
           owner_user_id = owner_details2.dataValues.user_id
           console.log(owner_id);
        user.findOne({where:{user_id:owner_user_id}}).then((owners1)=>{

        console.log(owners1.dataValues)
           vehicle_type= owner_details1.dataValues.vehicle_type;
           owner_name = owners1.dataValues.first_name+ " "+ owners1.dataValues.last_name


        client.create({
            vehicle_id:vehicles.vehicle_id,
            user_id:vehicles.client_id,
            name: result.dataValues.first_name+' '+result.dataValues.last_name,
            address:result.dataValues.address,
           city:result.dataValues.city,
           state:result.dataValues.state,
            pincode:result.dataValues.pincode,
            mobile_no: result.dataValues.phone_number,
            email:result.dataValues.email,
            DOB:result.dataValues.DOB,
            documents:result.dataValues.documents
        }).then((clientResult)=>{
                create_transaction(clientResult.dataValues.user_id,owner_id,vehicles.vehicle_id,user_id,vehicle_type,clientResult.dataValues.name,"Bank",amount,"In Transaction")
                vehicle.update({status:'SOLD'},{where:{vehicle_id:vehicles.vehicle_id}}).then(()=>{
                   
                   card_details.findOne({where:{bank_account_no:client_account_no}}).then((client_details)=>{
                       console.log(client_details.dataValues.funds);
                       console.log(amount);
                       console.log(client_details.dataValues.funds + amount);
                       card_details.update({funds:parseInt(client_details.dataValues.funds) - amount},{where:{bank_account_no:client_account_no}}).then(()=>{
                       
                        console.log('line 695');
                        card_details.findOne({where:{name:"Bank"}}).then((details4)=>{
                            card_details.update({funds:details4.dataValues.funds + amount},{where:{name:"Bank"}}).then(()=>{
                                console.log('line 698');        


                       
                    card_details.findOne({where:{name:"Bank"}}).then((details5)=>{
                       card_details.update({funds:details5.dataValues.funds - amount},{where:{name:"Bank"}}).then(()=>{


                    card_details.findOne({where:{bank_account_no:owner_account_no}}).then((owner_details)=>{
                        console.log(owner_details.dataValues.funds)
                             card_details.update({funds:amount+owner_details.dataValues.funds},{where:{bank_account_no:owner_account_no}}).then((result1)=>{

                           console.log(owner_name)
                        create_transaction(clientResult.dataValues.user_id,owner_id,vehicles.vehicle_id,user_id,vehicle_type,"Bank",owner_name,amount,"SOLD")
                                let d = new Date();
                        generate_email(result.dataValues.email,"Buying Confirmation",`Thank you for buying a vehicle from Ride Wheelz on ${d}`)
                                 generate_email(owner_details2.dataValues.email,"Buying Conformation","Thank you for using Ride Wheelz, your payment has been settled")

                                 res.send('Vehicle Sold')
                    })
                })
                    })
                })
                })
                    })
                       })
                })
            })
        })
       })
   })
})
})
})
//---------- Renting Logic
app.post('/api/rent-now',authenticate,async (req,res)=>{
    const Op = Sequelize.Op
    let vehicle_id= req.body.vehicle_id;
    let start = req.body.start_date
    let end= req.body.end_date
    let user_details=[]
    let owner_details=[];
    let client_details=[];
    let user_id=null;
    let user_client_id = req.body.user_client_id;
    let owner_bank_account= req.body.owner_bank_account;
    let client_bank_account= req.body.client_bank_account
    let amount = parseInt(req.body.amount);
    let deposit = parseInt(req.body.deposit);
    let totalAmount = amount+deposit;
    let transaction_type="";
    const vehicle1=await vehicle.findOne({where: {vehicle_id: vehicle_id}}).then((result) => {
        user_id = result.dataValues.user_id;
        transaction_type = result.dataValues.vehicle_type
        console.log(user_id)

    });
    const vehicle2=  await  owner.findOne({where: {[Op.and]:[{user_id: user_id},{vehicle_id:vehicle_id}]}}).then((result1) => {
        owner_details.push(result1.dataValues)

    });
    const vehicle3=await  user.findOne({where: {user_id: user_client_id}}).then((result2) => {
        user_details.push(result2.dataValues)


    })

    const vehicle4= await client.create({
        vehicle_id:owner_details[0].vehicle_id,
        user_id:user_client_id,
        name:user_details[0].first_name+" "+user_details[0].last_name,
        address:user_details[0].address,
        city:user_details[0].city,
        pincode:user_details[0].pincode,
        mobile_no:user_details[0].phone_number,
        email:user_details[0].email,
        DOB:user_details[0].DOB,
        documents:imageURL

    }).then((result3)=>{
        client_details.push(result3.dataValues)
    })
    const vehicle5 = await rent.create({
        vehicle_id:vehicle_id,
        client_id:client_details[0].client_id,
        owner_id:owner_details[0].owner_id,
        start_date:start,
        end_date:end
    }).then((result4)=>{
                    vehicle.update({status:'RENTED'},{where:{vehicle_id:vehicle_id}}).then(()=> {
                        let date = new Date(end);
                        let year = date.getFullYear();
                        let month = date.getMonth();
                        let day = date.getDate();
                        let hours = date.getHours();
                        let minutes = date.getMinutes();
                        let jobName = owner_details[0].name+vehicle_id+client_details[0].client_id;

                        var date1 = new Date(year, month, day, hours, minutes, 0);
                        console.log('Ending Date' +date1+date)
                         console.log("Job name"+jobName)
                        let d = new Date();
                          generate_email(user_details[0].email,"Rent Confirmation",`Thank you for renting a vehicle from Ride Wheelz on ${d}`)
                        res.send('Vehicle Rented');
                        //from client to bank
                        create_transaction(client_details[0].client_id, owner_details[0].owner_id,vehicle_id,user_client_id, transaction_type, client_details[0].name, "Bank", totalAmount, "Rent Initiated");
                        card_details.findOne({where: {bank_account_no: client_bank_account}}).then((details) => {
                            let client_funds = details.dataValues.funds;
                            card_details.findOne({where: {name: "Bank"}}).then((bank_details) => {
                                card_details.update({funds: client_funds - totalAmount}, {where: {bank_account_no: client_bank_account}}).then(() => {
                                    card_details.update({funds: bank_details.dataValues.funds + totalAmount}, {where: {name: "Bank"}}).then(() => {
                                        console.log('Transfer from Client to Bank')
                                 
                              console.log(date);
                                        console.log(jobName)

                                    });
                                })

                            })

                        });

                            var j = schedule.scheduleJob(jobName, date1, function () {
                           console.log('End Date Initiated')
                            vehicle.update({status: 'AVAILABLE'}, {where: {vehicle_id: vehicle_id}}).then(() => {
                                card_details.findOne({where: {bank_account_no: client_bank_account}}).then((clientDetails) => {

                                    card_details.findOne({where: {bank_account_no: owner_bank_account}}).then((ownerDetails) => {
                                        owner_funds = ownerDetails.dataValues.funds;
                                        card_details.findOne({where: {name: "Developer"}}).then((developer_details) => {
                                            card_details.findOne({where: {name: "Bank"}}).then((bank_details1) => {
                                                //deducting funds from bank


                                                card_details.update({funds: bank_details1.dataValues.funds - deposit},{where:{name: "Bank"}}).then(() => {
                                                    //clients deposit being return
                                                    create_transaction(client_details[0].client_id, owner_details[0].owner_id,vehicle_id,user_client_id, transaction_type, "Bank", client_details[0].name, deposit, "In Transaction")


                                                    card_details.update({funds: clientDetails.dataValues.funds + deposit},{where:{bank_account_no: client_bank_account}}).then(() => {
                                                        let ownerShare = amount -100
                                                        console.log("Owner Share"+ownerShare+" "+owner_bank_account)

                                                        card_details.findOne({where: {name: "Bank"}}).then((bank_details2) => {
                                                            card_details.update({funds: bank_details2.dataValues.funds - ownerShare },{where:{name: "Bank"}}).then(() => {

                                                                card_details.update({funds: ownerDetails.dataValues.funds + ownerShare},{where:{bank_account_no:owner_bank_account}}).then(() => {
                                                                    let ownerAmount = amount - 100;


                                                                    // developer being given his share
                                                                    card_details.findOne({where: {name: "Bank"}}).then((bank_details3) => {
                                                                        card_details.update({funds: bank_details3.dataValues.funds - 100},{where:{name:"Bank"}}).then(() => {



                                                                            card_details.update({funds: developer_details.dataValues.funds + 100},{where:{name: "Developer"}}).then(() => {
                                                                                let developerAmount = 100;
                                                                                create_transaction(client_details[0].client_id, owner_details[0].owner_id, vehicle_id,user_client_id,transaction_type, "Bank", "Developer", developerAmount, "In Transaction")
                                                                                create_transaction(client_details[0].client_id, owner_details[0].owner_id, vehicle_id, user_client_id,transaction_type, "Bank", owner_details[0].name, ownerAmount, "RENTED")


                                                                                vehicle_transaction.update({status:"Rent In Process"},{where:{[Op.and]:[{status:"Rent Initiated"},{user_id:user_client_id},{vehicle_id:vehicle_id}]}}).then(()=>{

                                                                                generate_email(user_details[0].email,"Rent Payment Settled","Thank you for renting a vehicle from Ride Wheelz. Your deposit has been returned")
                                                                               generate_email(owner_details[0],"Rent Payment Settled","Thank you for using Ride Wheelz, your payment has been settled")
                                                                                console.log("Payment Settled");
                                                                                })
                                                                            })

                                                                        })

                                                                    })

                                                                })
                                                            })

                                                        })

                                                    })
                                                })
                                            })

                                        })
                                    })
                                })
                            })


//node schedule
                                            })
               //

                        })
                    })





})




//----------Fetch twoWheeler details stored in database for displaying--------
app.get('/api/fetch-twoWheeler-details',authenticate,(req,res)=>{
   var vehicle_details=[]
    vehicle.findAll({attributes:['vehicle_id','vehicle_type','brand','model','fuel_type','year','registration_state','km_driven','number_plate','price_per_day','image','documents','price','status'],where:{vehicle_type:'Two-Wheelers'}}).then((result)=>{
        for(var i=0;i<result.length;i++)
        {
            vehicle_details.push(result[i])
        }

        res.send(vehicle_details)
    })
})


//----------Fetch fourWheeler details stored in database for displaying--------
app.get('/api/fetch-fourWheeler-details',authenticate,(req,res)=>{
    var vehicle_details=[]
    vehicle.findAll({attributes:['vehicle_id','vehicle_type','brand','model','fuel_type','year','registration_state','km_driven','number_plate','price_per_day','image','documents','price','status'],where:{vehicle_type:'Four-Wheelers'}}).then((result)=>{
        for(var i=0;i<result.length;i++)
        {
            vehicle_details.push(result[i])
        }

        res.send(vehicle_details)
    })
})

//----------Fetch all Vehicle details stored in database for displaying--------
app.get('/api/fetch-allVehicles-details',authenticate,(req,res)=>{
    var vehicle_details=[]
    vehicle.findAll({attributes:['vehicle_id','user_id','vehicle_type','brand','model','fuel_type','year','registration_state','km_driven','number_plate','price_per_day','image','documents','price','status']}).then((result)=>{
        for(var i=0;i<result.length;i++)
        {
            vehicle_details.push(result[i])
        }

        res.send(vehicle_details)
    })
})



//------------- update profile image------
app.post('/api/update-profile-image',authenticate,async (req,res)=>{
    console.log(profileImage)
 const profileImage1= await user.update({image:profileImage},{where:{user_id:req.body.user_id}}).then((result)=>{


     const deleteImage=()=> {

     }
        deleteImage();
     res.send('Profile Image Updated')
    }).catch(e=>res.send(e))



})
//update user document
app.post('/api/update-profile-document',authenticate,async (req,res)=>{

    const profileImage1= await user.update({documents:clientURL},{where:{user_id:req.body.user_id}}).then((result)=>{
        ;
        res.send('Document Image Updated')
    }).catch(e=>res.send(e))



})
// remove user document
app.post('/api/remove-user-document',authenticate,(req,res)=>{
    user.update({documents:null},{where:{user_id:req.body.user_id}}).then((result)=>{
        res.send('User Document Removed')
    }).catch(e=>res.send(e))
})

//update vehicle image
app.post('/api/update-vehicle-image',authenticate,(req,res)=>{
    vehicle.update({image:imageURL},{where:{vehicle_id:req.body.vehicle_id}}).then((result)=>{
        res.send("Vehicle Image Updated")
    })
})


// ----- Fetch Specific Vehicle Details ----

app.post('/api/fetch-specific-vehicle',authenticate,(req,res)=>{
    const Op = Sequelize.Op;
    let vehicle_id= req.body.vehicle_id;
    let user_id=req.body.user_id;
    let sendDetails =[]
    let user_details={};
    console.log(vehicle_id+ " "+user_id);
    vehicle.findOne({where:{vehicle_id:vehicle_id,user_id:{[Op.ne]:user_id}},include:[{model:owner},{model:avg_rating_vehicles}]}).then((result)=>{

        sendDetails.push(result.dataValues);
        user.findOne({where:{user_id:result.dataValues.user_id}}).then((result1)=>{
            user_details={
                bank_account_no:result1.dataValues.bank_account_no
            }
            sendDetails.push(user_details)
            res.send(sendDetails)

        })


    }).catch(error=>res.status(400).send(error))

})


//------ Fetch Specific User Details ---
app.post('/api/fetch-user',authenticate,(req,res)=>{
    let user_id = req.body.user_id;
    user.findOne({where:{user_id:user_id}}).then((result)=>{
        res.send(result.dataValues)
    }).catch(error=>res.status(400).send(error))
})

// ------------- change user password
app.post('/api/update-password',authenticate,async (req,res)=> {
    //check password
    let fetchedEmail = req.body.email;
    let fetchedPassword = req.body.old_password;
    let storedPassword = '';
    const data = await user.findOne({
        attributes: ['email', 'password'],
        where: {email: fetchedEmail}
    }).then((User) => {
        if (!User) {
            res.status(403).send('User Does Not Exist')

        }
        else {

            storedPassword = User.password;
            const match = bcrypt.compareSync(fetchedPassword, storedPassword)
            if (match) {

                let hashedPassword = '';
                var users = req.body;

                const saltRounds = 10;

                //------------------------ hashing password ---------------
                const passwordCreation = bcrypt.hash(users.password, saltRounds).then((result) => {
                    hashedPassword = result;
                    user.update({password:hashedPassword},{where:{email:fetchedEmail}}).then(result=>{
                        res.send('Password Updated')
                    })

                })

            }
            else {
                res.status(403).send('Invalid Password')
            }
        }


    })
})

//-------- Delete User Account
app.post('/api/delete-account',authenticate,async (req,res)=>{
    let fetchedEmail = req.body.email;
    let fetchedPassword = req.body.password;
    let storedPassword = '';
    const data = await user.findOne({
        attributes: ['email', 'password'],
        where: {email: fetchedEmail}
    }).then((User) => {
        if (!User) {
            res.status(403).send('User Does Not Exist')

        }
        else {

            storedPassword = User.password;
            const match = bcrypt.compareSync(fetchedPassword, storedPassword)
            if (match) {

                user.update({email:'',password:''},{where:{user_id:req.body.user_id}}).then(result=>{
                    res.send('Account deleted')
                }).catch(error=>res.status(440).send(error))


            }
            else {
                res.status(403).send('Invalid Password')
            }
        }

    })


})





//--------
//------ Update User Profile
app.post('/api/update-user-profile',authenticate,async (req,res)=>{
let users = req.body.users;
const update1 = await user.findOne({where:{user_id:users.user_id}}).then((result1)=>{
   if(result1.dataValues.documents!==null)
   {
    documentURL =result1.dataValues.documents 
   }
})

const update2 =await user.update({first_name:users.first_name,last_name:users.last_name,phone_number:users.phone_number,DOB:users.DOB,address:users.address,
    state:users.state,city:users.city,pincode:users.pincode,documents:documentURL,bank_account_no:users.bank_account_no
},{where:
        {user_id:users.user_id}}).then((result)=>{
            
           
            res.send('User profile Updated')
}).catch(e=>res.send(e))

const update3 = await  owner.update({name:users.first_name+" "+users.last_name,address:users.address,mobile_no:users.phone_number,DOB:users.DOB,documents:documentURL,pincode:users.pincode,city:users.city,state:users.state},{where:{user_id:users.user_id}}).then(()=>{
    console.log("Owner profile updated")
   
})  



})

//--- fetch vehicle of specific users ---
app.post('/api/fetch-specific-user-vehicles',authenticate,(req,res)=>{
    let users = req.body;
    let vehicle_details=[];
    const Op = Sequelize.Op
    vehicle.findAll({where:{[Op.and]:[{user_id:users.user_id},{status:{[Op.ne]:"UNAVAILABLE"}}]},include:[{model:client},{model:avg_rating_vehicles}]}).then((result)=>{
        for(let vehicle in result)
        {
            vehicle_details.push(result[vehicle].dataValues)
        }
        res.send(vehicle_details)
        }
    )
})

//------- fetch vehicles based on status-----
app.post('/api/fetch-specific-vehicles-based-on-status',authenticate,(req,res)=>{
    let vehicle_status=req.body.status;
    vehicle.findOne({where:{status:vehicle_status}}).then((result)=>{
        res.send(result.dataValues)
    }).catch((err)=>res.status(403).send(err))
})



//----- fetch all users vehicle except current
    app.post('/api/fetch-vehicles-except-current-user',authenticate,(req,res)=>{
    const Op = Sequelize.Op
    const user_id = req.body.user_id
    let collection =[]
    vehicle.findAll({where:{user_id:{[Op.ne]:user_id},status:"AVAILABLE"},include:[{model:avg_rating_vehicles,attributes:['avg_rating']}]}).then((result)=>{
        for (let i in result)
        {

            collection.push(result[i].dataValues)

        }

        setTimeout(function () {

            res.send(collection)
        },100)


    })


})

//------ Credit / Debit Card Routes
app.post('/api/pay-now',authenticate,(req,res)=>{
    //to verify a card
    let card_details1 = req.body.card_details
    let cvv =card_details1.cvv

    console.log(card_details1);
    card_details.findOne({where:{card_no:card_details1.card_no}}).then((result)=>{
        if(result.dataValues.name!==card_details1.name)
        {
            res.status(404).send("Invalid Name on Card")
        }
        else if(result.dataValues.cvv!==parseInt(cvv))
        {
            res.status(404).send("Invalid CVV")

        }
        else if(result.dataValues.expiry_date!==card_details1.expiry_date)
        {
            res.status(404).send("Invalid Expiry Date")

        }

        else if(result.dataValues.funds<card_details1.amount)
        {
            res.status(404).send("Insufficient funds")

        }
        else
        {

            res.send("VALID")
        }
    }).catch(e=>res.status(403).send("INVALID CARD"))
})
//---- request an OTP ----
app.post('/api/request-otp',authenticate,(req,res)=>{
    const email=req.body.email;
    var secret = process.env.OTP_SECRET+email;
    var token = speakeasy.totp({
        secret: secret,
        encoding: 'base32'
    });


// async..await is not allowed in global scope, must use a wrapper
    async function main(){

        // Generate test SMTP service account from ethereal.email
        // Only needed if you don't have a real mail account for testing
        let account = await nodemailer.createTestAccount();

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            service:"gmail",
            secure: false,
            tls: { rejectUnauthorized: false },
            auth: {
                user: process.env.EMAIL, // generated ethereal user
                pass: process.env.PASSWORD // generated ethereal password
            }
        });

        // setup email data with unicode symbols
        let mailOptions = {
            from: '"Ride Wheelz" <ridewheelz.com>', // sender address
            to: `${email}`, // list of receivers
            subject: "OTP CONFIRMATION", // Subject line
            text: `Your OTP is : ${token}`, // plain text body

        };

        // send mail with defined transport object
        let info = await transporter.sendMail(mailOptions)
        
    }

    res.send("worked")
    main().catch(console.error);
    console.log('Otp sent')



})


//--------------- Confirm payment  -----
app.post('/api/confirm-payment',authenticate,(req,res)=>{
    //otp verification
    const email = req.body.email;
    const secret = process.env.OTP_SECRET+email;
    const token = req.body.token;
    const tokenValidates = speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: 6
    });

    let transactionType= req.body.transactionType;

    if(tokenValidates===true)
    {
        //deduct funds from user
        let bank_funds=null;

        if(transactionType==="rent")
        {
            card_details.findOne({where:{name:"Bank"}}).then((bank_details)=>{
                bank_funds=bank_details.dataValues.funds;
            })
            const sequelize = new Sequelize();

            let funds = req.body.funds;
            let amount = req.body.amount;
            return sequelize.transaction(function(t){
                return  card_details.update({funds:funds-amount},{where:{bank_account_no:req.body.bank_account_no}},{transaction:t}).then((result)=>{
                    return  card_details.update({funds:bank_funds+amount},{where:{name:"Bank"}},{transaction: t})

                })

            }).then((result)=>{
                res.send("Payment Made");
            })

        }
        else if(transactionType==="buy now") {
            card_details.findOne({where: {name: "Bank"}}).then((bank_details) => {
                bank_funds = bank_details.dataValues.funds;
            })
            const sequelize = new Sequelize();

            let funds = req.body.funds;
            let amount = req.body.amount;
            return sequelize.transaction(function (t) {
                return card_details.update({funds: funds - amount}, {where: {bank_account_no: req.body.client_bank_account_no}}, {transaction: t}).then((result) => {
                    return card_details.update({funds: bank_funds + amount}, {where: {name: "Bank"}}, {transaction: t})

                })

            }).then((result) => {
                res.send("Payment Made");
            }).catch(e=>res.status(402).send(e))
        }
        res.send("VALID")
    }
    else
    {
        res.status(404).send("Invalid OTP")
        return false;
    }



})
//----- Accessories-----
//------ Fetch All Accessories
app.post('/api/fetch-accessories',authenticate,(req,res)=>{
    let result_array =[];
    accessory.findAll({include:[{model:avg_rating_accessory}]}).then((result)=>{
       for (let i in result)
       {
           result_array.push(result[i].dataValues)
       }

        res.send(result_array)
    })
})

//---- Fetch Specific Accessory
app.post('/api/fetch-specific-accessory',authenticate,(req,res)=>{
    accessory.findOne({where:{accessory_id:req.body.accessory_id},include:[{model:accessory_rating},{model:avg_rating_accessory}]}).then((result)=>{
        res.send(result.dataValues)
    })
})

//--- Updating Product ---
app.post('/api/cartDetails',authenticate,(req,res)=>{
    cart_storage.findAll({where:{user_id:req.body.user_id}}).then((result)=>{
        let details=[];
        for(let i in result)
        {
            details.push(result[i].dataValues)
            console.log(result[i].dataValues)
        }
        
        res.send(details);
    })
})


app.post('/api/addCart',authenticate,(req,res)=>{

    const Op = Sequelize.Op;
    accessory.findOne({where:{accessory_id:req.body.accessory_id}}).then((result1)=> {
    if(result1===null)
    {
        res.send('Invalid Item');
        return false;
    }
    if(result1.dataValues.accessory_qty===0)
    {
        res.send('Out Of Stock')
        return false;
    }

        cart_storage.findOne({where: {[Op.and]: [{user_id: req.body.user_id}, {accessory_id: req.body.accessory_id}]}}).then((result) => {

            if (result === null) {
                cart_storage.create({
                    user_id: req.body.user_id,
                    accessory_id: req.body.accessory_id,
                    quantity: 1

                }).then(() => {
                      res.send("Added To Cart")

                })
            }
            else {

                res.send('Item Exist')
            }
        })

    })


})

app.post('/api/updateCart',authenticate,(req,res)=>{
    const Op = Sequelize.Op;
    let quantity = req.body.quantity;
    accessory.findOne({where:{accessory_id:req.body.accessory_id}}).then((result)=>{
        if(result===null)
        {
            res.send('Invalid Accessory')
            return false;
        }
        let fetched_quantity= result.dataValues.accessory_qty;

        if(fetched_quantity >= quantity)
        {
           cart_storage.update({quantity:quantity},{where:{[Op.and]:[{accessory_id:req.body.accessory_id},{user_id:req.body.user_id}]}}).then(()=>{
            res.send("Added To Cart")
            })

        }
        else
        {
            res.send("OUT OF STOCK "+fetched_quantity)
        }



    })
})

app.post('/api/cartItems',authenticate,async (req,res)=>{
    const Op = Sequelize.Op;
    let count="";
    let sendDetails={};
    let details=[];
    let accessory_details=[];
    let accessory_id=[];
    let cart_quantity=null;
    const start =await cart_storage.findAndCountAll({where:{user_id:req.body.user_id}}).then((result)=>{
      console.log(result)
        if(result.count===0)
        {
            res.send({count:0})
            return false;
        }
        count = result.count;

    for(let i in result.rows)
    {  accessory_id.push( result.rows[i].dataValues.accessory_id)
        details.push(result.rows[i].dataValues)

    }

        accessory.findAll({where:{accessory_id:{[Op.in]:[accessory_id]}},include:[{model:cart_storage,where:{[Op.and]:[{user_id:req.body.user_id}]}}]}).then((result1)=>{
          for(let i in result1)
          {

              accessory_details.push(result1[i].dataValues)
          }
          console.log(accessory_details)

            sendDetails ={
                count,accessory_details,accessory_id
            }

            res.send(sendDetails);
        })

    })

})

app.post('/api/removeCart',authenticate,(req,res)=>{
    const Op = Sequelize.Op;

   cart_storage.findOne({where:{[Op.and]:[{user_id:req.body.user_id,accessory_id:req.body.accessory_id}]}}).then((result)=>{
       console.log(result)
       if(result===0)
        {
            res.send("Item does not exist")
        }
       else {
           cart_storage.destroy({where:{[Op.and]:[{user_id:req.body.user_id,accessory_id:req.body.accessory_id}]}}).then((result1) => {

                    res.send('Item Removed')




            }).catch(e => res.send(e))

        }
   })

})

app.post('/api/buy-accessories',authenticate,(req,res)=>{
    const Op = Sequelize.Op;
    let qty=null;
    let pdfItemName =[];
    let pdfItemQuantity =[];
    let pdfItemPrice =[];
    let GrandTotal=null;
    cart_storage.findOne({where:{[Op.and]:{user_id:req.body.user_id,accessory_id:req.body.accessory_id}}}).then((acc)=>{
        if(acc===null)
        {
            res.send('Item Does Not exist in Cart')
            return false;
        }
        else {
            qty=acc.dataValues.quantity

                accessory.findOne({where:{accessory_id:req.body.accessory_id}}).then((result1)=> {
                    if(qty>result1.dataValues.accessory_qty)
                    {
                        res.send('Item out of stock')
                        return false;
                    }
                pdfItemName.push(result1.dataValues.accessory_name)
                pdfItemQuantity.push(qty);
                    pdfItemPrice.push(req.body.amount)
                    GrandTotal=req.body.amount
            cart_storage.destroy({where:{[Op.and]:{user_id:req.body.user_id,accessory_id:req.body.accessory_id}}}).then((result)=>{

                    accessory.update({accessory_qty:result1.dataValues.accessory_qty - qty}, {where: {accessory_id: req.body.accessory_id}}).then((done) => {

                     card_details.findOne({where:{bank_account_no:req.body.bank_account_no}}).then((client_details)=>{
                         card_details.update({funds:client_details.dataValues.funds - req.body.amount},{where:{bank_account_no:req.body.bank_account_no}}).then(()=>{

                             card_details.findOne({where:{name:"Developer"}}).then((developer_details)=>{
                                card_details.update({funds:developer_details.dataValues.funds + req.body.amount},{where:{name:"Developer"}}).then(()=>{
                            user.findOne({where:{user_id:req.body.user_id}}).then((user_details)=>{


                                    let name= user_details.dataValues.first_name+" "+user_details.dataValues.last_name
                                    create_accessory(req.body.user_id,req.body.accessory_id,req.body.quantity,name,"Developer",req.body.amount,"SOLD")

                          generatePdf(name,pdfItemName,pdfItemQuantity,pdfItemPrice,GrandTotal)
                          setTimeout(function () {
                              var file = `uploads/${fileName}.pdf`
                              data1 = fs.readFileSync(file);
                              data= data1.toString('base64')
                              generate_email_attachment(user_details.dataValues.email,"Accessory Purchase","Thank you for Purchasing from Ride Wheelz",fileName,data)
                              fs.exists(`uploads/${fileName}.pdf`, function (exists) {
                                  if (exists) {

                                      console.log('File exists. Deleting now ...');
                                      fs.unlink(`uploads/${fileName}.pdf`);
                                  } else {

                                      console.log('File not found, so not deleting.');
                                  }
                              });

                          },2000)
                                res.send("Item removed From Cart");
                            })

                                })
                             })
                     })



                    })
                })


            })
                })
        }


})
})

//----accessory buy
app.post('/api/direct-buy-check',authenticate,(req,res)=>{
    let accessory_id = req.body.accessory_id;
    let user_id = req.body.user_id;
    let quantity = req.body.quantity;
    accessory.findOne({where:{accessory_id:accessory_id}}).then((result)=>{
        if(quantity>result.dataValues.accessory_qty)
        {
            res.send('Insufficient Stock');
        }
        else {
            res.send("Item Available")
        }

        }
    )
})

app.post('/api/direct-buy',authenticate,(req,res)=>{
   try{
       let pdfItemName =[];
       let pdfItemQuantity =[];
       let pdfItemPrice =[];
       let GrandTotal=null;
       user.findOne({where:{user_id:req.body.user_id}}).then((user_details)=>{


        accessory.findOne({where: {accessory_id: req.body.accessory_id}}).then((result) => {
            pdfItemName.push(result.dataValues.accessory_name)
            pdfItemQuantity.push(req.body.quantity)
            pdfItemPrice.push(req.body.amount)
            GrandTotal= req.body.amount
                accessory.update({accessory_qty: result.dataValues.accessory_qty - req.body.quantity},{where:{accessory_id: req.body.accessory_id}}).then(() => {
                console.log(result.dataValues.accessory_qty)
                    card_details.findOne({where: {bank_account_no: req.body.bank_account_no}}).then((bank_details) => {
                        if (bank_details.dataValues.funds < req.body.amount) {
                            res.send('Insufficient Funds');
                            return false;
                        }
                        card_details.update({funds: bank_details.dataValues.funds - req.body.amount}, {where: {bank_account_no: req.body.bank_account_no}}).then(() => {
                            card_details.findOne({where: {name: "Bank"}}).then((details) => {


                                        card_details.findOne({where:{name:"Developer"}}).then((developer_details)=>{
                                            console.log(developer_details.dataValues.funds);
                                            card_details.update({funds: details.dataValues.funds - req.body.amount}, {where: {name: "Bank"}}).then(() => {

                                                card_details.findOne({where: {name: "Bank"}}).then((details1) => {
                                                card_details.update({funds: details1.dataValues.funds + req.body.amount}, {where: {name: "Bank"}}).then(() => {

                                                    card_details.update({funds: developer_details.dataValues.funds + req.body.amount}, {where: {name: "Developer"}}).then(() => {

                                                        let name= user_details.dataValues.first_name+" "+user_details.dataValues.last_name
                                                        create_accessory(req.body.user_id,req.body.accessory_id,req.body.quantity,name,"Developer",req.body.amount,"SOLD")

                                                generatePdf(name,pdfItemName,pdfItemQuantity,pdfItemPrice,GrandTotal)

                                                        setTimeout(function () {
                                                            var file = `uploads/${fileName}.pdf`
                                                            data1 = fs.readFileSync(file);
                                                            data= data1.toString('base64')
                                                            generate_email_attachment(user_details.dataValues.email,"Accessory Purchase","Thank you for Purchasing from Ride Wheelz",fileName,data)
                                                            fs.exists(`uploads/${fileName}.pdf`, function (exists) {
                                                                if (exists) {

                                                                    console.log('File exists. Deleting now ...');
                                                                    fs.unlink(`uploads/${fileName}.pdf`);
                                                                } else {

                                                                    console.log('File not found, so not deleting.');
                                                                }
                                                            });

                                                        },2000)
                                                        res.send("Accessory Purchased")
                                                        console.log('')
                                                    })
                                                })
                                                })
                                    })
                                })
                            })
                        })
                        })
                    })


                })
            }
        ).catch(e => res.send(e.message))
    }
    catch(err)
    {
        res.status(400).send(err);
    }
})

//----Checkout Check----
app.post('/api/checkout-check',authenticate,async (req,res)=>{
    const Op = Sequelize.Op;
    let accessory_details=[];
    let accessory_id=[];
    let quantity=[]
    let price =[]
    let totalPrice=[];
    const test =await cart_storage.findAll({where:{user_id:req.body.user_id}}).then((result)=>{
    let count =0;
        if(result.length===0)
        {
            res.send('No Items In Cart');
            return false;
        }
        for(let i in result) {
            count++;
            quantity.push(result[i].dataValues.quantity)

            accessory.findOne({where:{accessory_id:result[i].dataValues.accessory_id}}).then((data)=>{
                price.push(data.dataValues.accessory_price)
                let total_price=(result[i].dataValues.quantity *  data.dataValues.accessory_price  )
                totalPrice.push(total_price)




            })

        }
            setTimeout(function(){
                let total_sum=  totalPrice.reduce(add,0)
                function add(a,b)
                {
                    return a+b;
                }
                console.log(total_sum)
                let sendDetails={
                    count:count,grand_total:total_sum
                }
                res.send(sendDetails)
            },1000)

    })




})



//---- Checkout ----
app.post('/api/checkout',authenticate,async (req,res)=>{
    const Op = Sequelize.Op;
    let user_details=[];
    let accessory_id=[];
    let quantity=[]
    let price =[]
    let totalPrice=[];
    let name="";
    let total_price = null;
    let pdfItemNames =[];
    const test =await cart_storage.findAll({where:{user_id:req.body.user_id}}).then((result)=>{
        user.findOne({where:{user_id:req.body.user_id}}).then((user_details1)=>{
            user_details.push(user_details1.dataValues)
        })
        if(result.length===0)
        {
            res.send('No Items In Cart');
            return false;
        }

        for(let i in result) {
            quantity.push(result[i].dataValues.quantity)

          accessory.findOne({where:{accessory_id:result[i].dataValues.accessory_id}}).then((data)=>{
                price.push(data.dataValues.accessory_price)
                pdfItemNames.push(data.dataValues.accessory_name)
              total_price=(result[i].dataValues.quantity *  data.dataValues.accessory_price  )
            totalPrice.push(total_price)
               name = user_details[0].first_name+" "+user_details[0].last_name
            create_accessory(req.body.user_id,data.dataValues.accessory_id,result[i].dataValues.quantity,name,"Developer",total_price,"SOLD")

              accessory.update({accessory_qty:data.dataValues.accessory_qty - result[i].dataValues.quantity},{where:{accessory_id:data.dataValues.accessory_id}})
           

          })

        }
        cart_storage.destroy({where:{user_id:req.body.user_id}}).then((data1)=>{

            setTimeout(function(){
             let total_sum=  totalPrice.reduce(add,0)
                function add(a,b)
                {
                   return a+b;
                }

                card_details.findOne({where:{bank_account_no:user_details[0].bank_account_no}}).then((bank_details)=>{
                    card_details.update({funds:bank_details.dataValues.funds - total_sum},{where:{bank_account_no:user_details[0].bank_account_no}}).then(()=>{
                        card_details.findOne({where:{name:"Developer"}}).then((developer_details)=>{
                            card_details.update({funds:developer_details.dataValues.funds + total_sum},{where:{name:"Developer"}}).then(()=>{
                                console.log("Payment Settled")
                            })
                        })
                    })
                })  

                generatePdf(name,pdfItemNames,quantity,price,total_sum)
                setTimeout(function () {
                    var file = `uploads/${fileName}.pdf`
                    data1 = fs.readFileSync(file);
                    data= data1.toString('base64')
                    generate_email_attachment(user_details.dataValues.email,"Accessory Purchase","Thank you for Purchasing from Ride Wheelz",fileName,data)
                    fs.exists(`uploads/${fileName}.pdf`, function (exists) {
                        if (exists) {

                            console.log('File exists. Deleting now ...');
                            fs.unlink(`uploads/${fileName}.pdf`);
                        } else {

                            console.log('File not found, so not deleting.');
                        }
                    });

                },2000)
                console.log(total_sum)
                res.send("Total Amount: "+total_sum)
            },2000)
        })
    })









})


//-----Cancel a Booking ---
app.post('/api/cancel-booking',authenticate,(req,res)=>{
    const Op = Sequelize.Op;
    


   let jobName = req.body.owner_name+req.body.vehicle_id+req.body.client_id;

   console.log(jobName)


    let my_job = schedule.scheduledJobs[jobName]
    my_job.cancel();
    vehicle.update({status:"AVAILABLE"},{where:{vehicle_id:req.body.vehicle_id}}).then(()=>{
        card_details.findOne({where:{name:"Bank"}}).then((bank_details)=>{


        card_details.update({funds:bank_details.dataValues.funds -  req.body.amount},{where:{name:"Bank"}}).then(()=> {
            card_details.findOne({where: {bank_account_no: req.body.client_bank_account_no}}).then((clientDetails) => {
                card_details.update({funds: clientDetails.dataValues.funds + req.body.amount}, {where: {bank_account_no: req.body.client_bank_account_no}}).then(() => {


                    vehicle_transaction.update({status:"Booking Cancelled"},{where:{[Op.and]: [{vehicle_id:req.body.vehicle_id}, {user_id: req.body.user_id}, {status:  "Rent Initiated"}]}}).then(()=>{
                        res.send("Booking Cancelled");
                    })

                })
            })
        })
        })

        }
    )

})

//---------Rating ----
app.post('/api/rating',authenticate,async (req,res)=>{
    const Op = Sequelize.Op
    let avg_rating=null;
    let total_rating=[];
  let test=await  rating.findOne({where:{[Op.and]:[{user_id:req.body.user_id},{vehicle_id:req.body.vehicle_id}]}}).then((data)=>{
        if(data!==null)
        {
            res.send('You have Already Rated this Vehicle');
            return false;
        }

    rating.create({
        user_id:req.body.user_id,
        vehicle_id:req.body.vehicle_id,
        vehicle_name:req.body.vehicle_name,
        user_name:req.body.user_name,
        rating_number:req.body.rating_number
    }).then((result)=>{

        rating.findAll({where:{vehicle_id:req.body.vehicle_id}}).then((result)=>{
            for(let i in result)
            {
                total_rating.push(result[i].dataValues.rating_number);
            }
            setTimeout(function(){
                let count =total_rating.length;
                let total_sum=  total_rating.reduce(add,0)
                function add(a,b)
                {
                    return a+b;
                }
                avg_rating = total_sum/count
                avg_rating.toFixed(2);
                avg_rating_vehicles.findOne({where:{vehicle_id:req.body.vehicle_id}}).then((result1)=>{
                    if(result1!==null)
                    {
                        avg_rating_vehicles.update({avg_rating:avg_rating},{where:{vehicle_id:req.body.vehicle_id}}).then(()=>{
                            console.log('Avg added of vehicles')
                        })
                    }
                    else{
                        avg_rating_vehicles.create({
                            vehicle_id:req.body.vehicle_id,
                            avg_rating: avg_rating
                        }).then(()=>{
                            console.log("Avg added to vehicles")
                        })
                    }
                })

                // res.send('Average rating is:'+avg_rating.toFixed(2))
            },100)
        })


        res.send('Successfully Rated')
    })
    })




    })
//for average rating of vehicles
app.post('/api/rating-for-vehicle',authenticate,(req,res)=>{
    let avg_rating=null;
    let total_rating=[];
    rating.findAll({where:{vehicle_id:req.body.vehicle_id}}).then((result)=>{
           for(let i in result)
           {
               total_rating.push(result[i].dataValues.rating_number);
           }
           setTimeout(function(){
              let count =total_rating.length;
               let total_sum=  total_rating.reduce(add,0)
               function add(a,b)
               {
                   return a+b;
               }
              avg_rating = total_sum/count
               res.send('Average rating is:'+avg_rating.toFixed(2))
           },100)
    })
})

app.post('/api/delete-rating',authenticate,(req,res)=>{
    const Op = Sequelize.Op;
    rating.destroy({where:{[Op.and]:[{user_id:req.body.user_id},{vehicle_id:req.body.vehicle_id}]}}).then((result)=>{
        console.log(result)
        if(result===0)
        {
            res.send('Rating does not exist')
            return false;
        }

        res.send('Rating Removed')
    })
})


//--- Comments ---
app.post('/api/create-comment',authenticate,(req,res)=>{
 const Op = Sequelize.Op;
 feedback.findOne({where:{[Op.and]:[{user_id:req.body.user_id},{vehicle_id:req.body.vehicle_id}]}}).then((data)=>{
   if(data!==null)
   {
       res.send('You have already given a feedback');
       return false;
   }

  feedback.create({
      vehicle_id:req.body.vehicle_id,
      vehicle_name: req.body.vehicle_name,
      user_id: req.body.user_id,
      user_name:req.body.user_name,
      feedback_comment:req.body.feedback_comment
  }).then((result)=>{
      res.send('FeedBack Received')
  })
 })
})

app.post('/api/delete-comment',authenticate,(req,res)=>{
    feedback.findOne({where:{[Op.and]:[{user_id:req.body.user_id},{vehicle_id:req.body.vehicle_id}]}}).then((data)=>{
        if(data!==0)
        {
            res.send('Invalid Feedback');
            return false;
        }
        feedback.destroy({where:{[Op.and]:[{user_id:req.body.user_id},{vehicle_id:req.body.vehicle_id}]}}).then((result1)=>{
        res.send('Comment Deleted')
        })
    })
})

app.post('/api/comments',authenticate,(req,res)=>{
    const Op = Sequelize.Op;
    let comment_display =[];
    feedback.findAll({where:{vehicle_id:req.body.vehicle_id},order:[['createdAt','DESC']]}).then((result)=>{
        for(let i in result)
        {

            comment_display.push(result[i].dataValues)
        }

        setTimeout(function () {

            res.send(comment_display)
        },100)
    })

})


app.post('/api/remove-vehicle',authenticate,(req,res)=>{

     const Op = Sequelize.Op
    vehicle.update({status:"UNAVAILABLE"},{where:{[Op.and]:[{user_id:req.body.user_id},{vehicle_id:req.body.vehicle_id},{status:"AVAILABLE"}]}}).then((result)=>{
        console.log(result);
        if(result[0]===0)
        {
            res.send('Vehicle Does Not Exist')
            return false;
        }
        res.send('Vehicle No Longer Available')
    })

})


app.post('/api/vehicle-history',authenticate,async (req,res)=>{
    const Op = Sequelize.Op;
    let details=[];
    let owner_id=[];
    let vehicle_id=[];
    let ratingDetails=[];
    let commentDetails=[];

 let test=await   vehicle_transaction.findAll({where:{[Op.and]:[{user_id:req.body.user_id},{status:{[Op.not]:["In Transaction","Rent in Process"]}}]}}).then((result1)=>{
       for(let i in result1)
       {
           owner_id.push(result1[i].dataValues.owner_id)
           vehicle_id.push(result1[i].dataValues.vehicle_id)

       }
       


    })


    
    let test2= await
  vehicle_transaction.findAll({where:{[Op.and]:[{user_id:req.body.user_id},{status:{[Op.not]:["In Transaction","Rent In Process"]}}]},include:[{model:owner},{model:vehicle},{model:rent}]}).then((result)=>{
    for(let i in result)
    {
       details.push(result[i].dataValues)


    }




    })

    let test3 = rating.findAll({where:{user_id:req.body.user_id}}).then((rating_details)=>{
        for(let i in rating_details)
        {
            ratingDetails.push(rating_details[i].dataValues)
        }

    })

    let test4 = feedback.findAll({where:{user_id:req.body.user_id}}).then((review_details)=>{
        for(let i in review_details)
        {
            commentDetails.push(review_details[i].dataValues)
        }
    })

setTimeout(function(){
let sendDetails={
    details,ratingDetails,commentDetails
}


   res.send(sendDetails)
},100)
})


//-----filter using raw queries ---
app.get('/api/filter1',authenticate,(req,res)=>{
    const sequelize = new Sequelize('test','root','root',{
        host:'localhost',
        dialect:'mysql'
    });
   
    let user_id=req.query.user_id
    if(req.query.user_id ==="")
    {
        user_id="'null'"
    }
   

    let typeOfService=null
    let typeOfService1=null;

    let vehicle_type=null;
    let vehicle_type1=null;

    let fuel_type = null;
    let fuel_type4=null;



    let select_state = null;
    let select_state1=null;

    let pricemin = null;
    let pricemax = null;
    let price1 = null;

    if(req.query.type_of_service !== '')
    {
        typeOfService=req.query.type_of_service.split(',')
            let typeOfServiceCheck=typeOfService.toString()
        if(typeOfServiceCheck ==="Rent")
        {
            typeOfService1="price_per_day!='null'"
        }
        else if(typeOfServiceCheck ==="Sale")
        {
            typeOfService1="price!='null'"
        }
        else if(typeOfService.toString() ==="Rent,Sale" || typeOfService.toString() ==="Sale,Rent")
        {
            typeOfService1 ="vehicle.vehicle_id!='null'"
        }
    }
    else {
        typeOfService1="vehicle.vehicle_id!='null'"
    }

    if(req.query.vehicle_type !== '')
    {
        vehicle_type=req.query.vehicle_type.split(',')
        let vehicle_type_check = vehicle_type.toString();
        if(vehicle_type_check==="Two-Wheelers")
        {
            vehicle_type1="vehicle_type='Two-Wheelers'"
        }
        else if(vehicle_type_check ==="Four-Wheelers"){
            vehicle_type1="vehicle_type='Four-Wheelers'"
        }
        else if(vehicle_type.toString() ==="Two-Wheelers,Four-Wheelers" || vehicle_type.toString() ==="Four-Wheelers,Two-Wheelers")
        {
            vehicle_type1="vehicle.vehicle_type!='null'"
        }

    }
    else
    {
        vehicle_type1="vehicle.vehicle_type!='null'"
    }

    if(req.query.fuel_type !== '') {
        fuel_type = req.query.fuel_type.split(',')
        let fuel_type_check = fuel_type.toString();
        if (fuel_type_check==="Petrol") {
            fuel_type4 = "fuel_type='Petrol'"
        }
        else if (fuel_type_check==="Diesel") {
            fuel_type4 = "fuel_type='Diesel'"
        }
        else if (fuel_type_check==="CNG") {
            fuel_type4 = "fuel_type='CNG'"
        }

        else if (fuel_type_check === "Petrol,Diesel" || fuel_type_check === "Diesel,Petrol") {
            fuel_type4 = "fuel_type in('Petrol','Diesel')"
        }
        else if (fuel_type_check === "Petrol,CNG" || fuel_type_check === "CNG,Petrol") {
            fuel_type4 = "fuel_type in('Petrol','CNG')"
        }
        else if (fuel_type_check === "Diesel,CNG" || fuel_type_check === "CNG,Diesel") {
            fuel_type4 = "fuel_type in('Diesel','CNG')"
        }
        else
        {

                fuel_type4 = "fuel_type!='null'"

            }

    }
    else
        {
            fuel_type4="fuel_type!='null'"
        }
        if(req.query.select_state !== '')
        {
            select_state= req.query.select_state.split(',')
            let select_state_check = select_state.sort().toString();

            if(select_state_check ==="Goa")
            {
                select_state1="registration_state='Goa'"
            }
            else if(select_state_check ==="Gujarat")
            {
                select_state1="registration_state='Gujarat'"
            }
            else if(select_state_check ==="Maharashtra")
            {
                select_state1="registration_state='Maharashtra'"
            }
            else if(select_state_check ==="Pune")
            {
                select_state1="registration_state='Pune'"
            }
            else if(select_state_check==="Goa,Gujarat")
            {
                select_state1="registration_state in('Goa','Gujarat')"
            }
            else if(select_state_check==="Goa,Maharashtra")
            {
                select_state1="registration_state in('Goa','Maharashtra')"
            }
            else if(select_state_check==="Goa,Pune")
            {
                select_state1="registration_state in('Goa','Pune')"
            }
            else if(select_state_check==="Gujarat,Maharashtra")
            {
                select_state1="registration_state in('Gujarat','Maharashtra')"

            }
            else if(select_state_check==="Gujarat,Pune")
            {
                select_state1="registration_state in('Gujarat','Pune')"

            }
            else if(select_state_check==="Maharashtra,Pune")
            {
                select_state1="registration_state in('Maharashtra','Pune')"

            }
            else if(select_state_check==="Goa,Gujarat,Maharashtra")
            {
                select_state1 ="registration_state in('Maharashtra','Goa','Gujarat')"
            }
            else if(select_state_check==="Goa,Gujarat,Pune")
            {
                select_state1 ="registration_state in('Pune','Goa','Gujarat')"

            }
            else if(select_state_check==="Goa,Maharashtra,Pune"){
                select_state1 ="registration_state in('Pune','Goa','Maharashtra')"

            }
            else if(select_state_check==="Gujarat,Maharashtra,Pune"){
                select_state1 ="registration_state in('Pune','Maharashtra','Gujarat')"

            }
            else {
                select_state1="registration_state!='null'"
            }


        }
        else{
            select_state1="registration_state!='null'"
        }

        if(req.query.pricemin !== "0" && req.query.pricemax !== "0")
        {
            pricemin=req.query.pricemin
            pricemax = req.query.pricemax
            if(req.query.type_of_service ==="Rent")
            {
                price1=`price_per_day between ${pricemin} and ${pricemax}`
            }
            else if(req.query.type_of_service ==="Sale") {
                price1=`price between ${pricemin} and ${pricemax}`
            }

        }
        else if(req.query.pricemin==="0" && req.query.pricemax!=="0")
        {
            pricemin=req.query.pricemin
            pricemax = req.query.pricemax
            if(req.query.type_of_service ==="Rent")
            {
                price1=`price_per_day between ${pricemin} and ${pricemax}`
            }
            else if(req.query.type_of_service ==="Sale") {
                price1=`price between ${pricemin} and ${pricemax}`
            }
        }
        else
        {
            price1="user_id!='null'"
        }

     let query="SELECT `vehicle`.`vehicle_id`, `vehicle`.`user_id`, `vehicle`.`vehicle_type`, `vehicle`.`brand`, `vehicle`.`model`, `vehicle`.`fuel_type`, `vehicle`.`year`, `vehicle`.`registration_state`, `vehicle`.`km_driven`, `vehicle`.`number_plate`, `vehicle`.`price_per_day`, `vehicle`.`description`, `vehicle`.`image`, `vehicle`.`documents`, `vehicle`.`price`, `vehicle`.`status`, `vehicle`.`createdAt`, `vehicle`.`updatedAt`, `avg_rating_vehicles`.`avg_rating` AS `avg_rating` FROM `vehicle` AS `vehicle` LEFT OUTER JOIN `avg_rating_vehicles` AS `avg_rating_vehicles` ON `vehicle`.`vehicle_id` = `avg_rating_vehicles`.`vehicle_id` WHERE   `vehicle`.`status` = 'AVAILABLE' "
    sequelize.query(`${query} and vehicle.user_id!=${user_id} and ${typeOfService1} and ${vehicle_type1} and ${fuel_type4} and ${select_state1} and ${price1}`,{type:sequelize.QueryTypes.SELECT}).then((result)=>{
            console.log(result)

        res.send(result)
    })
})



//---------- Fetch Comments and Ratings for user --
app.get('/api/fetch-vehicle-comments-and-ratings/:vehicle_id',authenticate,async (req,res)=>{
    let vehicle_id = req.params.vehicle_id;
    let comments = [];
    let ratings =[];
    let details=[];
    const Op = Sequelize.Op
    let test = await vehicle.findOne({where:{vehicle_id:vehicle_id},include:[{model:rating},{model:feedback}]}).then((vehicle_details)=>{
       if(vehicle_details.dataValues.feedbacks.length ===0)
       {
           return false;
       }
        details.push(vehicle_details.dataValues)
    })


    setTimeout(function () {
       if(details.length === 0)
       {
           res.send('No reviews')
           return false;
       }

        res.send(details)
    },100)


})


//---- accessory ratings ----
app.post('/api/accessory-rating',authenticate,async(req,res)=>{
    const Op = Sequelize.Op
    let total_rating=[];
    let avg_rating =null;
   accessory_rating.findOne({where:{[Op.and]:[{accessory_id:req.body.accessory_id},{user_id:req.body.user_id}]},include:[{model:avg_rating_accessory}]}).then((result)=>{
       if(result===null)
       {
           accessory_rating.create({
               user_id:req.body.user_id,
               accessory_id:req.body.accessory_id,
               rating:req.body.rating
           }).then(()=>{


              accessory_rating.findAll({where:{accessory_id:req.body.accessory_id}}).then((access1)=> {
                   for (let i in access1) {
                       total_rating.push(access1[i].dataValues.rating);
                       console.log(access1[i].dataValues.rating)
                   }
                   setTimeout(function () {
                       let count = total_rating.length;
                       let total_sum = total_rating.reduce(add, 0)

                       function add(a, b) {
                           return a + b;
                       }

                       avg_rating = total_sum / count
                       console.log(avg_rating)
                       avg_rating.toFixed(2);
                    setTimeout(function () {


                       avg_rating_accessory.findOne({where:{accessory_id:req.body.accessory_id}}).then((accessory_details)=>{
                           if(accessory_details !== null)
                           {
                               avg_rating_accessory.update({avg_rating:avg_rating},{where:{accessory_id:req.body.accessory_id}}).then(()=>{
                                   console.log("Avg calculated")
                               })
                           }
                           else
                           {
                               avg_rating_accessory.create({
                                   accessory_id:req.body.accessory_id,
                                   avg_rating:avg_rating
                               }).then(()=>{
                                   console.log("Avg calculated")
                               })
                           }
                       })
                   },100)
               })
              },100)




           })
           res.send('Rating Added')
       }
       else {
           if(result.dataValues.rating === null) {
               accessory_rating.update({rating: req.body.rating}, {where: {[Op.and]: [{accessory_id: req.body.accessory_id}, {user_id: req.body.user_id}]}}).then(() => {

                   accessory_rating.findAll({where:{accessory_id:req.body.accessory_id}}).then((access1)=> {
                       for (let i in access1) {
                           total_rating.push(access1[i].dataValues.rating);
                           console.log(access1[i].dataValues.rating)
                       }
                       setTimeout(function () {
                           let count = total_rating.length;
                           let total_sum = total_rating.reduce(add, 0)

                           function add(a, b) {
                               return a + b;
                           }

                           avg_rating = total_sum / count
                           console.log(avg_rating)
                           avg_rating.toFixed(2);
                           setTimeout(function () {


                               avg_rating_accessory.findOne({where:{accessory_id:req.body.accessory_id}}).then((accessory_details)=>{
                                   if(accessory_details !== null)
                                   {
                                       avg_rating_accessory.update({avg_rating:avg_rating},{where:{accessory_id:req.body.accessory_id}}).then(()=>{
                                           console.log("Avg calculated")
                                       })
                                   }
                                   else
                                   {
                                       avg_rating_accessory.create({
                                           accessory_id:req.body.accessory_id,
                                           avg_rating:avg_rating
                                       }).then(()=>{
                                           console.log("Avg calculated")
                                       })
                                   }
                               })
                           },100)
                       })
                   },100)


                   res.send('Rating Made')

               })
           }
           else{
               res.send('Already Rated')
                return false;
           }
       }


   })






})

// ---- adding accessory review -------
app.post('/api/accessory-review',authenticate,(req,res)=>{
    const Op = Sequelize.Op
    accessory_rating.findOne({where:{[Op.and]:[{accessory_id:req.body.accessory_id},{user_id:req.body.user_id}]}}).then((result)=>{
        if(result===null)
        {
            accessory_rating.create({
                user_id:req.body.user_id,
                accessory_id:req.body.accessory_id,
                review:req.body.review
            })
            res.send('Review Made')
        }
        else {
            if(result.dataValues.review === null) {
                accessory_rating.update({review: req.body.review}, {where: {[Op.and]: [{accessory_id: req.body.accessory_id}, {user_id: req.body.user_id}]}}).then(() => {
                    res.send('Review Added')

                })
            }
            else{
                res.send('Already Reviewed')
            }
        }
    })

})

// ---------- Fetch all accessory ratings and reviews ---
app.post('/api/fetch-accessory-ratings-and-reviews',authenticate,async (req,res)=>{
    const Op = Sequelize.Op;
    let details=[];
    let user_id=[];
    let accessory_id=[]
   let test1=await accessory_rating.findAll().then((user_details)=>{
        for(let i in user_details)
        {
            user_id.push(user_details[i].dataValues.user_id)
            accessory_id.push(user_details[i].dataValues.accessory_id)
        }
    })
     let test2=await   accessory_rating.findAll({include:[{model:user,where:{user_id:{[Op.in]:user_id}}},{model:accessory,where:{accessory_id:req.body.accessory_id}}]}).then((result)=>{
            for(let i in result)
            {
                details.push(result[i].dataValues)
            }
        })
    setTimeout(function () {
        res.send(details)
    },100)



})

// fetch specific accessory review and rating based on user_id and vehicle_id
app.post('/api/fetch-specific-accessory-rating-and-review-based-on-user-accessory',authenticate,(req,res)=>{
    const Op = Sequelize.Op;
    let details=[];
    accessory_rating.findAll({where:{[Op.and]:[{accessory_id:req.body.accessory_id},{user_id:req.body.user_id}]}}).then((result)=>{
        for(let i in result)
        {
            details.push(result[i].dataValues)
        }

    })
    setTimeout(function () {
        res.send(details)
    },100)
})

// fetch accessory based on accessory id
app.post('/api/fetch-specific-accessory-rating-and-review',authenticate,(req,res)=>{
    let details=[];
    console.log(req.body.accessory_id)
    accessory_rating.findAll({where:{accessory_id:req.body.accessory_id},include:[{model:user},{model:avg_rating_accessory}]}).then((result)=>{
        for(let i in result)
        {
            details.push(result[i].dataValues)
        }

    })
    setTimeout(function () {
        res.send(details)
    },100)
})


//fetch accessory rating based on user id
app.post('/api/fetch-user-accessory-rating',authenticate,(req,res)=>{
    let display=[];
    accessory_rating.findAll({where:{user_id:req.body.user_id}}).then((result)=>{
        for(let i in result)
        {
            display.push(result[i].dataValues)
        }
    })
    setTimeout(function () {
        res.send(display)
    },100)
})

app.get('/api/get-accessory',authenticate,(req,res)=>{
    let accessory_id = req.query.accessory_id;
    let user_id = req.query.user_id;
    const Op =Sequelize.Op;
    let reviews =[];
    accessory_rating.findAll({where:{accessory_id:accessory_id},include:[{model:user},{model:accessory}]}).then((result)=>{
       for(let i in result) {

           if (result[i].dataValues.review === "" ||result[i].dataValues.review === null) {
               return false;
           }
           reviews.push(result[i].dataValues)
       }
    })

    setTimeout(function () {
        if(reviews.length===0)
        {
            res.send("No Reviews")
            return false;
        }
        res.send(reviews)
    },100)
})


// --- fetch ratings and reviews based on user_id and vehicle_id
app.get('/api/get-vehicles',authenticate,async(req,res)=>{
    let vehicle_id= req.query.vehicle_id
    let user_id = req.query.user_id
    let ratings =[];
    let reviews =[];
    const Op =Sequelize.Op;
   let test1=await rating.findOne({where:{[Op.and]:[{user_id:user_id},{vehicle_id:vehicle_id}]},include:[{model:user},{model:vehicle}]}).then((rating_details)=>{
        if(rating_details === null)
        {
            return false;
        }
        ratings.push(rating_details.dataValues)
    })
   let test2=await feedback.findOne({where:{[Op.and]:[{user_id:user_id},{vehicle_id:vehicle_id}]},include:[{model:user},{model:vehicle}]}).then((review_details)=>{
       if(review_details === null )
       {
           return false;
       }
        reviews.push(review_details.dataValues)
    })
    setTimeout(function () {
        const details={ratings,reviews}
        res.send(details)
    },100)

})

//---- Helpful  and not helpful
app.post('/api/helpful-not-helpful',authenticate,(req,res)=>{
    const Op = Sequelize.Op;
    let helpful=req.body.helpful;
    let notHelpful=req.body.notHelpful;
    if(req.body.type==="vehicle") {
        if (helpful === "set") {
            console.log(req.body.feedback_id);
            helpful_vehicle.findOne({where:{[Op.and]:[{user_id:req.body.user_id},{feedback_id:req.body.feedback_id},{vehicle_id:req.body.vehicle_id}]}}).then((result)=>{
                if(result===null)
                {
                    helpful_vehicle.create({
                        feedback_id:req.body.feedback_id,
                        vehicle_id:req.body.vehicle_id,
                        user_id:req.body.user_id,
                        helpful:true,
                        not_helpful:false
                    }).then(()=>{
                        res.send("Helpful Like")
                        return false;
                    }).catch(e=>res.send(e))
                }
                else{
                    helpful_vehicle.update({helpful:true,not_helpful:false},{where:{[Op.and]:[{user_id:req.body.user_id},{feedback_id:req.body.feedback_id},{vehicle_id:req.body.vehicle_id}]}}).then(()=>{
                        res.send("Helpful Like")
                        return false;
                    }).catch(e=>res.send(e))
                }
            })
        }


        if(notHelpful==="set")
        {
            helpful_vehicle.findOne({where:{[Op.and]:[{user_id:req.body.user_id},{feedback_id:req.body.feedback_id},{vehicle_id:req.body.vehicle_id}]}}).then((result)=>{
                if(result===null)
                {
                    helpful_vehicle.create({
                        feedback_id:req.body.feedback_id,
                        vehicle_id:req.body.vehicle_id,
                        user_id:req.body.user_id,
                        not_helpful:true,
                        helpful:false
                    }).then(()=>{
                        res.send("Not Helpful Like")
                        return false;
                    }).catch(e=>res.send(e))
                }
                else{
                    helpful_vehicle.update({helpful:false,not_helpful:true},{where:{[Op.and]:[{user_id:req.body.user_id},{feedback_id:req.body.feedback_id},{vehicle_id:req.body.vehicle_id}]}}).then(()=>{
                        res.send("Not Helpful Like")
                        return false;
                    }).catch(e=>res.send(e))
                }
            })
        }


    }
    else if(req.body.type==="accessory") {
        if (helpful === "set") {
            helpful_accessory.findOne({where: {[Op.and]: [{user_id: req.body.user_id}, {feedback_id: req.body.feedback_id}, {accessory_id: req.body.accessory_id}]}}).then((result) => {
                if (result === null) {
                    console.log(req.body.feedback_id);
                    helpful_accessory.create({
                        feedback_id: req.body.feedback_id,
                        accessory_id: req.body.accessory_id,
                        user_id: req.body.user_id,
                        helpful: true,
                        not_helpful: false
                    }).then(() => {
                        res.send("Helpful Like")
                        return false;
                    }).catch(e => res.send(e))
                }
                else {
                    helpful_accessory.update({
                        helpful: true,
                        not_helpful: false
                    }, {where: {[Op.and]: [{user_id: req.body.user_id}, {feedback_id: req.body.feedback_id}, {accessory_id: req.body.accessory_id}]}}).then(() => {
                        res.send("Helpful Like")
                        return false;
                    }).catch(e => res.send(e))
                }
            })
        }


        if (notHelpful === "set") {
            helpful_accessory.findOne({where: {[Op.and]: [{user_id: req.body.user_id}, {feedback_id: req.body.feedback_id}, {accessory_id: req.body.accessory_id}]}}).then((result) => {
                if (result === null) {
                    helpful_accessory.create({
                        feedback_id: req.body.feedback_id,
                        accessory_id: req.body.accessory_id,
                        user_id: req.body.user_id,
                        not_helpful: true,
                        helpful: false
                    }).then(() => {
                        res.send("Not Helpful Like")
                        return false;
                    }).catch(e => res.send(e))
                }
                else {
                    helpful_accessory.update({
                        helpful: false,
                        not_helpful: true
                    }, {where: {[Op.and]: [{user_id: req.body.user_id}, {feedback_id: req.body.feedback_id}, {accessory_id: req.body.accessory_id}]}}).then(() => {
                        res.send("Not Helpful Like")
                        return false;
                    }).catch(e => res.send(e))
                }
            })
        }
    }



})

app.get('/api/vehicle-helpful',authenticate,(req,res)=>{
    let vehicle_id = req.query.vehicle_id;
    let feedback_id = req.query.feedback_id;
    let user_id = req.query.user_id;
    const Op = Sequelize.Op
    let display =[];
    helpful_vehicle.findOne({where:{[Op.and]:[{vehicle_id:vehicle_id},{feedback_id:feedback_id},{user_id:user_id}]}}).then((result)=>{
      console.log(result)
        if(result === null)
        {
            return false;

        }
        display.push(result.dataValues)
    })
    setTimeout(function () {
        if(display.length ===0)
        {
            res.send("No Likes")
            return false;
        }
        res.send(display)
    },100)

})

//---- Count help vehicle -----
app.get('/api/helpful-vehicle-count',authenticate,(req,res)=>{
    const Op = Sequelize.Op;
    let helpful = [];
    let notHelpful = [];
    helpful_vehicle.findAll({where:{[Op.and]:[{vehicle_id:req.query.vehicle_id},{feedback_id:req.query.feedback_id}]}}).then((result)=>{
        for(let i in result)
        {
            if(result[i].dataValues.helpful === "1") {
                helpful.push(result[i].dataValues.helpful)
            }
            if(result[i].dataValues.not_helpful === "1") {
                notHelpful.push(result[i].dataValues.not_helpful)
            }
            }

    })
    setTimeout(function () {
        let countHelpful = helpful.length;

        let countNotHelpful = notHelpful.length;
        let sendDetails={
            countHelpful,
            countNotHelpful
        }
        res.send(sendDetails)
    },100)
})

//----- Accessory Count ----

app.get('/api/accessory-helpful',authenticate,(req,res)=>{
    let accessory_id = req.query.accessory_id;
    let feedback_id = req.query.feedback_id;
    let user_id = req.query.user_id;
    const Op = Sequelize.Op
    let display =[];
    helpful_accessory.findOne({where:{[Op.and]:[{accessory_id:accessory_id},{feedback_id:feedback_id},{user_id:user_id}]}}).then((result)=>{
        console.log(result)
        if(result === null)
        {
            return false;

        }
        display.push(result.dataValues)
    })
    setTimeout(function () {
        if(display.length ===0)
        {
            res.send("No Likes")
            return false;
        }
        res.send(display)
    },100)

})

//---- Count helpful accessory -----
app.get('/api/helpful-accessory-count',authenticate,(req,res)=>{
    const Op = Sequelize.Op;
    let helpful = [];
    let notHelpful = [];
    helpful_accessory.findAll({where:{[Op.and]:[{accessory_id:req.query.accessory_id},{feedback_id:req.query.feedback_id}]}}).then((result)=>{
        for(let i in result)
        {
            if(result[i].dataValues.helpful === "1") {
                helpful.push(result[i].dataValues.helpful)
            }
            if(result[i].dataValues.not_helpful === "1") {
                notHelpful.push(result[i].dataValues.not_helpful)
            }
        }

    })
    setTimeout(function () {
        let countHelpful = helpful.length;

        let countNotHelpful = notHelpful.length;
        let sendDetails={
            countHelpful,
            countNotHelpful
        }
        res.send(sendDetails)
    },100)
})

app.post('/api/remove-profile-image',authenticate,(req,res)=>{
    user.update({image:null},{where:{user_id:req.body.user_id}}).then((result)=>{
        res.send("Profile Image Removed");
    }).catch(e=>res.send(e))
})



//--------------
app.listen(process.env.PORT,()=>{
    console.log(`Listening on port ${process.env.PORT}`)

})


