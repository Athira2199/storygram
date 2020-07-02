const path=require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const exphbs=require('express-handlebars');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session)
const connectDB = require('./config/db');


dotenv.config({path: './config/config.env'})

require('./config/passport')(passport)

connectDB();

const app = express()
app.use(express.urlencoded({extended:false}))
app.use(express.json())

app.use(methodOverride((req,res)=>{
  if(req.body && typeof req.body === 'object' && '_method' in req.body){
    let method = req.body._method
    delete req.body._method
    return method 
  }
}))

const PORT = process.env.PORT || 3000;

app.use(morgan('dev'))

const { formatDate,stripTags,truncate,editIcon,select} = require('./helpers/hbs')

app.engine('.hbs', exphbs({helpers:{formatDate,stripTags,truncate,editIcon,select},defaultLayout:'main',extname: '.hbs'}))
app.set('view engine','.hbs');


app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store : new MongoStore({ mongooseConnection : mongoose.connection})
  }))

app.use(passport.initialize());
app.use(passport.session())

app.use(function(req,res,next){
  res.locals.user=req.user || ""
  next()
})


app.use(express.static(path.join(__dirname,'public')))

app.use('/',require('./routes/index'))
app.use('/auth',require('./routes/auth'))
app.use('/stories',require('./routes/stories'))

app.listen(PORT,console.log(`server running in ${PORT}`))